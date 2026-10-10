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
    ],
  },
};

export default nextConfig;
