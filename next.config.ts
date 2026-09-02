import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography while real product shots don't exist yet.
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
