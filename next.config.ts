import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 92, 95, 100],
  },
  async redirects() {
    return [
      {
        source: "/story",
        destination: "/meet-khoudia",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
