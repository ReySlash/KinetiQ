const fallbackSiteUrl = "http://localhost:3001";

export function getSiteUrl(path = "/"): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}
