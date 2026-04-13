import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/me/salary/pdf': ['./public/fonts/**/*', './public/*.png'],
  },
};

export default nextConfig;
