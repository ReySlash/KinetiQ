import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/analytics",
        "/progress",
        "/calendar",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/routines/new",
        "/training-programs/new",
      ],
    },
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}
