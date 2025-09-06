import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/duqkxqaij/**",
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      "https://3000-firebase-stenomaster-1757135644702.cluster-mwsteha33jfdowtvzffztbjcj6.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
