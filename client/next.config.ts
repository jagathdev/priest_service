import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phplexus.astroved.com",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "www.srimandir.com",
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
