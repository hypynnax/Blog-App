import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // tüm domainlere izin verir (güvenlik düşük)
      },
    ],
  },
};

export default nextConfig;
