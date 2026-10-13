import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phplexus.astroved.com",
      },
      {
        protocol: "https",
        hostname: "vedamfoundation.com",
      },
      {
        protocol: "https",
        hostname: "cdn.astroved.com",
      },
      {
        protocol: "https",
        hostname: "priestservices.astroved.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
