const fallbackSiteUrl = "http://localhost:3001";

export function getSiteUrl(path = "/"): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredSiteUrl && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  const baseUrl = configuredSiteUrl ?? fallbackSiteUrl;
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}
