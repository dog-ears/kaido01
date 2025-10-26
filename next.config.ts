import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ '@prisma/client': '@prisma/client' });
    }
    return config;
  },
};

export default nextConfig;
