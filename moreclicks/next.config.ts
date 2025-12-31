import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for Docker/Cloud Run deployment
  output: 'standalone',
  // Disable Turbopack and use webpack for production builds
  // This prevents Turbopack-related build errors
  experimental: {
    turbo: false, // Disable Turbopack, use webpack
  },
};

export default nextConfig;
