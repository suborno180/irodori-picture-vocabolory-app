import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.irodori.jpf.go.jp",
      },
    ],
  },
};

export default nextConfig;
