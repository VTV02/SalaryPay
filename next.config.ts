import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/me/salary/pdf': ['./public/fonts/**/*'],
  },
};

export default nextConfig;
