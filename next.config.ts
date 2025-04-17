import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true, // For InfinityFree's file-based routing
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
