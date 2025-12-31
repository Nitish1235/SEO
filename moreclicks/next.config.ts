import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for Docker/Cloud Run deployment
  output: 'standalone',
  // Ensure webpack is used for production builds (not Turbopack)
  // This prevents Turbopack-related build errors in production
  webpack: (config, { dev, isServer }) => {
    // Return webpack config as-is
    return config;
  },
};

export default nextConfig;
