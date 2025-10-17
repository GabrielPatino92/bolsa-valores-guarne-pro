/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@guarne/ui', '@guarne/sdk'],
};

module.exports = nextConfig;
