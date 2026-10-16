import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "motion/react",
      "@google/genai",
      "recharts",
    ],
  },
};

export default nextConfig;
