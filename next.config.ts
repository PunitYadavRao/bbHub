import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Dev only: let phones and tablets on the same Wi-Fi open the dev server by the laptop's
  // network address. Without this, Next blocks its dev scripts for any host but localhost, so
  // the page never hydrates there (no stage, mesh, menu or click effects). Private ranges only.
  allowedDevOrigins: ["127.0.0.1", "10.*.*.*", "192.168.*.*", "172.*.*.*", "*.local"],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
