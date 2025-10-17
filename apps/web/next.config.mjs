/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@guarne/ui', '@guarne/sdk'],

  // Optimizaciones de rendimiento
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimizar para desarrollo más rápido
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reducir tiempo de compilación en desarrollo
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
