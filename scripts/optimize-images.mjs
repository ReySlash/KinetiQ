import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

export const PUBLIC_DIRECTORY = path.resolve("apps/web/public");
export const DEFAULT_QUALITY = 75;
export const BENCHMARK_QUALITIES = [60, 70, 75, 80, 85, 90];

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const CONCURRENCY = 4;

export function parseArguments(argv) {
  const options = {
    benchmark: false,
    quality: DEFAULT_QUALITY,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--") continue;

    if (argument === "--benchmark") {
      options.benchmark = true;
      continue;
    }

    if (argument === "--write") {
      options.write = true;
      continue;
    }

    if (argument === "--quality") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 1 || value > 100) {
        throw new Error("--quality must be an integer between 1 and 100.");
      }
      options.quality = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
      continue;
    }

    if (
      entry.isFile() &&
      SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function discoverImages(directory = PUBLIC_DIRECTORY) {
  return walk(directory);
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, items.length) },
      () => consume(),
    ),
  );
  return results;
}

function toWebpPath(sourcePath) {
  return path.format({
    dir: path.dirname(sourcePath),
    name: path.basename(sourcePath, path.extname(sourcePath)),
    ext: ".webp",
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

function formatSavings(sourceBytes, outputBytes) {
  const savings = ((sourceBytes - outputBytes) / sourceBytes) * 100;
  return `${savings.toFixed(1)}%`;
}

async function encodeWebp(sourcePath, quality) {
  const image = sharp(sourcePath, { failOn: "error" });
  const metadata = await image.metadata();
  const result = await image
    .webp({
      quality,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true,
    })
    .toBuffer();

  const outputMetadata = await sharp(result).metadata();
  if (
    metadata.width !== outputMetadata.width ||
    metadata.height !== outputMetadata.height
  ) {
    throw new Error(
      `Dimension validation failed for ${sourcePath}: ${metadata.width}x${metadata.height} became ${outputMetadata.width}x${outputMetadata.height}.`,
    );
  }

  return {
    buffer: result,
    height: metadata.height,
    width: metadata.width,
  };
}

function createOperation(sourcePath, outputPath, sourceBytes, outputBytes, dimensions) {
  return {
    dimensions,
    outputBytes,
    outputPath,
    sourceBytes,
    sourcePath,
  };
}

export async function planImages(
  directory = PUBLIC_DIRECTORY,
  quality = DEFAULT_QUALITY,
) {
  const sourcePaths = (await discoverImages(directory)).filter(
    (sourcePath) => path.extname(sourcePath).toLowerCase() !== ".webp",
  );
  const seenOutputs = new Set();

  for (const sourcePath of sourcePaths) {
    const outputPath = toWebpPath(sourcePath);
    if (seenOutputs.has(outputPath)) {
      throw new Error(`Multiple source images map to ${outputPath}.`);
    }
    seenOutputs.add(outputPath);
  }

  return mapWithConcurrency(sourcePaths, async (sourcePath) => {
    const outputPath = toWebpPath(sourcePath);
    const sourceStat = await fs.stat(sourcePath);
    const encoded = await encodeWebp(sourcePath, quality);
    return createOperation(
      sourcePath,
      outputPath,
      sourceStat.size,
      encoded.buffer.length,
      { height: encoded.height, width: encoded.width },
    );
  });
}

async function writeOperation(operation, quality, temporaryDirectory) {
  const encoded = await encodeWebp(operation.sourcePath, quality);
  const temporaryPath = path.join(
    temporaryDirectory,
    `${path.basename(operation.outputPath)}.${randomUUID()}.tmp`,
  );
  await fs.writeFile(temporaryPath, encoded.buffer);
  return {
    ...operation,
    dimensions: { height: encoded.height, width: encoded.width },
    outputBytes: encoded.buffer.length,
    temporaryPath,
  };
}

async function commitOperations(operations) {
  for (const operation of operations) {
    await fs.rename(operation.temporaryPath, operation.outputPath);
  }

  for (const operation of operations) {
    if (operation.sourcePath !== operation.outputPath) {
      await fs.unlink(operation.sourcePath);
    }
  }
}

export async function writeImages(
  directory = PUBLIC_DIRECTORY,
  quality = DEFAULT_QUALITY,
) {
  const sourcePaths = (await discoverImages(directory)).filter(
    (sourcePath) => path.extname(sourcePath).toLowerCase() !== ".webp",
  );
  const seenOutputs = new Set();
  const sourceOperations = [];

  for (const sourcePath of sourcePaths) {
    const outputPath = toWebpPath(sourcePath);
    if (seenOutputs.has(outputPath)) {
      throw new Error(`Multiple source images map to ${outputPath}.`);
    }
    seenOutputs.add(outputPath);
    sourceOperations.push({
      outputPath,
      sourceBytes: (await fs.stat(sourcePath)).size,
      sourcePath,
    });
  }

  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "kinetiq-image-"),
  );

  try {
    const preparedOperations = await mapWithConcurrency(
      sourceOperations,
      (operation) => writeOperation(operation, quality, temporaryDirectory),
    );
    await commitOperations(preparedOperations);
    return preparedOperations;
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function printOperations(operations) {
  for (const operation of operations) {
    const relativeSource = path.relative(process.cwd(), operation.sourcePath);
    const relativeOutput = path.relative(process.cwd(), operation.outputPath);
    console.log(
      `${relativeSource} -> ${relativeOutput} | ${operation.dimensions.width}x${operation.dimensions.height} | ${formatBytes(operation.sourceBytes)} -> ${formatBytes(operation.outputBytes)} (${formatSavings(operation.sourceBytes, operation.outputBytes)})`,
    );
  }
}

async function benchmark(directory = PUBLIC_DIRECTORY) {
  const sourcePaths = await discoverImages(directory);
  const findSample = (folder) =>
    sourcePaths.find((sourcePath) =>
      sourcePath.includes(`${path.sep}temp${path.sep}${folder}${path.sep}`),
    );
  const selected = [
    findSample("Exercises"),
    findSample("Muscles"),
    findSample("Covers"),
  ].filter(Boolean);

  if (selected.length < 3) {
    throw new Error("Benchmark requires exercise, muscle, and cover image samples.");
  }

  const benchmarkDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "kinetiq-image-benchmark-"),
  );
  console.log(`Benchmark samples: ${benchmarkDirectory}`);
  console.log("Quality benchmark (inspect representative output samples visually):");
  for (const sourcePath of selected) {
    const sourceStat = await fs.stat(sourcePath);
    const relativeSource = path.relative(process.cwd(), sourcePath);
    const sampleName = path.basename(sourcePath, path.extname(sourcePath));
    console.log(`\n${relativeSource} (${formatBytes(sourceStat.size)})`);
    for (const quality of BENCHMARK_QUALITIES) {
      const encoded = await encodeWebp(sourcePath, quality);
      await fs.writeFile(
        path.join(benchmarkDirectory, `${sampleName}-q${quality}.webp`),
        encoded.buffer,
      );
      console.log(
        `  quality ${quality}: ${formatBytes(encoded.buffer.length)} (${formatSavings(sourceStat.size, encoded.buffer.length)})`,
      );
    }
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.benchmark) {
    await benchmark();
    return;
  }

  const operations = options.write
    ? await writeImages(PUBLIC_DIRECTORY, options.quality)
    : await planImages(PUBLIC_DIRECTORY, options.quality);

  printOperations(operations);
  console.log(
    options.write
      ? `Optimized ${operations.length} images.`
      : `Dry run complete for ${operations.length} images. Re-run with --write to apply changes.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
