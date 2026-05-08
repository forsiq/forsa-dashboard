import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corePkgPath = path.resolve(__dirname, 'node_modules/@yousef2001/core-ui/dist');
const localCorePath = path.resolve(__dirname, 'src/core');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@yousef2001/core-ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'file.zonevast.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force single React/Next instance to avoid hook dispatcher issues
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      next: path.resolve(__dirname, 'node_modules/next'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      // @core resolves: local src/core/ overrides take priority,
      // then falls back to core-ui package
      '@core': [localCorePath, corePkgPath],
    };

    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 300,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          '**/.dist/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
