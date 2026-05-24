import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/budgets",
        destination: "/settings/budget",
        permanent: true,
      },
      {
        source: "/budgets/:path*",
        destination: "/settings/budget",
        permanent: true,
      },
      {
        source: "/categories",
        destination: "/settings/categories",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        destination: "/settings/categories",
        permanent: true,
      },
      {
        source: "/features",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [40, 64, 96, 128, 256, 384, 512],
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
