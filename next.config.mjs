import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@yousef2001/core-ui'],
  webpack: (config, { dev, isServer }) => {
    // Ensure path aliases resolve correctly in webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@config': path.resolve(__dirname, 'src/config'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@core': path.resolve(__dirname, 'node_modules/@yousef2001/core-ui/src'),
    };

    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          '**/dist/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
