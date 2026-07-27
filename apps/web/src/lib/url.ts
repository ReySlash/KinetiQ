type QueryValue = string | number | boolean | null | undefined;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function buildUrl(
  baseUrl: string | undefined,
  path: string,
  queryParams?: Record<string, QueryValue>,
): string {
  if (!baseUrl) {
    throw new Error("A base URL is required.");
  }

  const url = new URL(path.replace(/^\//, ""), normalizeBaseUrl(baseUrl));

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined || value === null) {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
