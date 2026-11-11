import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CSS (≈ 10 Ko) inliné dans le HTML : supprime la requête bloquante avant le premier rendu
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 2048],
    minimumCacheTTL: 2678400,
  },
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
