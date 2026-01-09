import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Required for react-pdf to work with Next.js
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
