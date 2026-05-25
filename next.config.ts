import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/budgets",
        destination: "/settings/budgets",
        permanent: true,
      },
      {
        source: "/budgets/:path*",
        destination: "/settings/budgets",
        permanent: true,
      },
      {
        source: "/settings/budget",
        destination: "/settings/budgets",
        permanent: true,
      },
      {
        source: "/settings/notification-history",
        destination: "/settings/announcements",
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
