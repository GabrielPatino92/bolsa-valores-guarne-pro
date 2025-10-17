/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@guarne/ui', '@guarne/sdk'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
