import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "",
      },
      {
        pathname: "/assets/Covers/**",
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
