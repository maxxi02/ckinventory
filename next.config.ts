import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Disable webpack cache completely
    config.cache = false;

    // Additional optimization for TensorFlow.js if you're using it
    if (!isServer) {
      // Don't bundle large dependencies on the server
      config.externals = [
        ...(config.externals || []),
        { "@tensorflow/tfjs": "tfjs" },
      ];
    }

    return config;
  },
  // Increase the memory limit for the build process
  experimental: {
    // Enable memory-based worker count for Next.js compiler
    memoryBasedWorkersCount: true,
  },
};

module.exports = nextConfig;
