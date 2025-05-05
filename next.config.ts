import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config) => {
    // Disable webpack cache completely
    config.cache = false;
    return config;
  },
  // Increase the memory limit for the build process
  experimental: {
    // Enable memory-based worker count for Next.js compiler
    memoryBasedWorkersCount: true,
  },
};

module.exports = nextConfig;
