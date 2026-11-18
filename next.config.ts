import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is loaded at runtime via process.getBuiltinModule, so nothing to bundle.
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
