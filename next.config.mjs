import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cache for local override lookups to avoid repeated disk I/O
const overrideCache = new Map();

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
      '@config': path.resolve(__dirname, 'src/config'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@core': path.resolve(__dirname, 'node_modules/@yousef2001/core-ui/src'),
    };

    // Cached local override: if a local file exists in src/core/,
    // it takes priority over the core-ui package version.
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push({
      apply(resolver) {
        resolver.hooks.resolve.tapAsync('CoreOverridePlugin', (request, context, callback) => {
          if (request.request && request.request.startsWith('@core/core/')) {
            const relativePath = request.request.replace('@core/core/', '');

            // Check cache first to avoid disk I/O on repeated resolves
            const cached = overrideCache.get(relativePath);
            if (cached !== undefined) {
              if (cached === null) {
                return callback();
              }
              const overrideRequest = { ...request, request: cached };
              return resolver.doResolve(
                resolver.hooks.resolve,
                overrideRequest,
                `core override: ${request.request} → ${cached}`,
                context,
                callback
              );
            }

            const localPath = path.resolve(__dirname, 'src/core', relativePath);
            const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
            for (const ext of extensions) {
              const fullPath = localPath + ext;
              if (fs.existsSync(fullPath)) {
                overrideCache.set(relativePath, fullPath);
                const overrideRequest = { ...request, request: fullPath };
                return resolver.doResolve(
                  resolver.hooks.resolve,
                  overrideRequest,
                  `core override: ${request.request} → ${fullPath}`,
                  context,
                  callback
                );
              }
            }

            // Cache the miss so we don't check disk again
            overrideCache.set(relativePath, null);
          }
          callback();
        });
      }
    });

    if (dev) {
      config.watchOptions = {
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
