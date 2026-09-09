import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    localPatterns: [
      {
        pathname: "/empty-state-*.webp",
        search: "",
      },
      {
        pathname: "/hero-image.webp",
        search: "",
      },
      {
        pathname: "/temp/**",
        search: "",
      },
      {
        pathname: "/temp/Covers/**",
        search: "?v=2",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
