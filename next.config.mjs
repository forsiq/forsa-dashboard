import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    // File-replacement override: if a local file exists in src/core/,
    // it takes priority over the core-ui package version.
    // Pattern: @core/core/* → checks src/core/* first, then falls back to package
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push({
      apply(resolver) {
        resolver.hooks.resolve.tapAsync('CoreOverridePlugin', (request, context, callback) => {
          if (request.request && request.request.startsWith('@core/core/')) {
            const relativePath = request.request.replace('@core/core/', '');
            const localPath = path.resolve(__dirname, 'src/core', relativePath);
            
            // Check if local override exists (with common extensions)
            const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
            for (const ext of extensions) {
              if (fs.existsSync(localPath + ext)) {
                const overrideRequest = { ...request, request: localPath + ext };
                return resolver.doResolve(
                  resolver.hooks.resolve,
                  overrideRequest,
                  `core override: ${request.request} → src/core/${relativePath}${ext}`,
                  context,
                  callback
                );
              }
            }
          }
          callback();
        });
      }
    });

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
