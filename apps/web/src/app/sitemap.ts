import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: getSiteUrl(), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: getSiteUrl("/exercises"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: getSiteUrl("/muscle-groups"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: getSiteUrl("/routines"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: getSiteUrl("/training-programs"), lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];
}
