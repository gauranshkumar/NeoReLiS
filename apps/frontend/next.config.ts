import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9078";

const nextConfig: NextConfig = {
  // Proxy API requests to the backend server during development
  // This eliminates CORS issues when the frontend and backend run on different ports
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
