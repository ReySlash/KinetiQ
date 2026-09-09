import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

import {
  DEFAULT_QUALITY,
  discoverImages,
  parseArguments,
  planImages,
  writeImages,
} from "./optimize-images.mjs";

async function createFixture() {
  const directory = await mkdtemp(path.join(tmpdir(), "kinetiq-image-test-"));
  const imageDirectory = path.join(directory, "nested", "images");
  await mkdir(imageDirectory, { recursive: true });
  await sharp({
    create: {
      width: 4,
      height: 5,
      channels: 4,
      background: { alpha: 0.5, b: 30, g: 20, r: 10 },
    },
  })
    .png()
    .toFile(path.join(imageDirectory, "sample.png"));
  await writeFile(path.join(directory, "nested", "notes.txt"), "ignored");
  return { directory, sourcePath: path.join(imageDirectory, "sample.png") };
}

test("discovers supported raster files recursively and ignores other files", async () => {
  const fixture = await createFixture();

  assert.deepEqual(await discoverImages(fixture.directory), [fixture.sourcePath]);
});

test("parses dry-run, write, benchmark, and quality options", () => {
  assert.deepEqual(parseArguments([]), {
    benchmark: false,
    quality: DEFAULT_QUALITY,
    write: false,
  });
  assert.deepEqual(parseArguments(["--", "--benchmark", "--write", "--quality", "70"]), {
    benchmark: true,
    quality: 70,
    write: true,
  });
});

test("planning is a non-mutating dry run and preserves dimensions", async () => {
  const fixture = await createFixture();

  const operations = await planImages(fixture.directory, 75);
  assert.equal(operations.length, 1);
  assert.equal(operations[0].dimensions.width, 4);
  assert.equal(operations[0].dimensions.height, 5);
  assert.equal(operations[0].outputPath, fixture.sourcePath.replace(".png", ".webp"));
  await stat(fixture.sourcePath);
  await assert.rejects(stat(operations[0].outputPath));
});

test("write converts to WebP, preserves transparency and dimensions, and removes the source", async () => {
  const fixture = await createFixture();

  await writeImages(fixture.directory, 75);

  const outputPath = fixture.sourcePath.replace(".png", ".webp");
  const metadata = await sharp(outputPath).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 4);
  assert.equal(metadata.height, 5);
  assert.equal(metadata.hasAlpha, true);
  await assert.rejects(stat(fixture.sourcePath));
});

test("repeated writes are idempotent", async () => {
  const fixture = await createFixture();
  await writeImages(fixture.directory, 75);
  const outputPath = fixture.sourcePath.replace(".png", ".webp");
  const firstOutput = await readFile(outputPath);

  await writeImages(fixture.directory, 75);

  assert.deepEqual(await readFile(outputPath), firstOutput);
  assert.deepEqual((await readdir(path.dirname(outputPath))).sort(), ["sample.webp"]);
});

test("a failed conversion leaves source images untouched", async () => {
  const fixture = await createFixture();
  const invalidPath = path.join(fixture.directory, "nested", "images", "z-invalid.png");
  await writeFile(invalidPath, "not an image");

  await assert.rejects(writeImages(fixture.directory, 75));
  await stat(fixture.sourcePath);
  await stat(invalidPath);
  await assert.rejects(stat(fixture.sourcePath.replace(".png", ".webp")));
});
