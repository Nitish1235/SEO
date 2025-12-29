import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for Docker/Cloud Run deployment
  output: 'standalone',
};

export default nextConfig;
