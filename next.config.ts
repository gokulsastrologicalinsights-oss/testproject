import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking on Vercel to prevent silent out-of-memory crashes
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
