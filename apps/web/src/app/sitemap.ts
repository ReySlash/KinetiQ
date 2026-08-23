import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: getSiteUrl() },
    { url: getSiteUrl("/exercises") },
    { url: getSiteUrl("/muscle-groups") },
    { url: getSiteUrl("/routines") },
    { url: getSiteUrl("/training-programs") },
  ];
}
