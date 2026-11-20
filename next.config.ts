import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is loaded at runtime via process.getBuiltinModule, so nothing to bundle.
  // Self-contained server bundle for Docker / any Node host (node .next/standalone/server.js).
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  // Note: a local build may copy ./data into .next/standalone; deployments never contain it
  // (data/ is git-ignored and excluded by .dockerignore).
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
