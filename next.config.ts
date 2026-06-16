import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // Workaround for the Next.js 16.2.2+ Turbopack dev memory leak
  // (vercel/next.js#91396): server fast refresh became opt-out and makes the
  // dev server's heap grow until it OOM-crashes (e.g. on POST /api/orders).
  experimental: {
    turbopackServerFastRefresh: false,
  } as unknown as NextConfig["experimental"],
  images: {
    qualities: [75, 88, 90, 92, 95, 100],
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.png",
        permanent: true,
      },
      {
        source: "/story",
        destination: "/meet-khoudia",
        permanent: true,
      },
      {
        source: "/fr/story",
        destination: "/fr/rencontrer-khoudia",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
