export function getRequiredId(
  idsBySlug: ReadonlyMap<string, string>,
  slug: string,
  entityName: string,
): string {
  const id = idsBySlug.get(slug);

  if (!id) {
    throw new Error(`${entityName} with slug "${slug}" was not found.`);
  }

  return id;
}

export function assertUniqueSlugs(
  items: ReadonlyArray<{ slug: string }>,
  entityName: string,
): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`Duplicate ${entityName} slug "${item.slug}".`);
    }

    seen.add(item.slug);
  }
}

export function assertRequiredText(
  value: string | undefined,
  context: string,
): void {
  if (!value?.trim()) {
    throw new Error(`${context} must not be empty.`);
  }
}
