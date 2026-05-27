import path from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from "@serwist/next";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corePkgPath = path.resolve(__dirname, 'node_modules/@yousef2001/core-ui/dist');
const localCorePath = path.resolve(__dirname, 'src/core');

const isCI = !!process.env.CI;
const revision = isCI
  ? spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() || Date.now().toString()
  : Date.now().toString();

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

const isSafeBuild = process.env.BUILD_SAFE === '1';
const webpackParallelism = process.env.WEBPACK_PARALLELISM
  ? Number.parseInt(process.env.WEBPACK_PARALLELISM, 10)
  : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next was inferring ~/package-lock.json as repo root, which slows output file tracing.
  outputFileTracingRoot: path.join(__dirname),

  // Limit static-generation workers when BUILD_SAFE=1 (avoids saturating all CPU cores).
  ...(isSafeBuild ? { experimental: { cpus: 1 } } : {}),

  transpilePackages: ['@yousef2001/core-ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'file.zonevast.com' },
      { protocol: 'https', hostname: 'file1.zonevast.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'test.zonevast.com' },
      { protocol: 'https', hostname: 'api.zonevast.com' },
      { protocol: 'http', hostname: 'localhost' },
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

    // YAML → JS module (yaml-loader emits `export default …`).
    // `type: 'javascript/auto'` tells webpack to treat yaml-loader's output as JS
    // instead of trying to run it through the JSON parser, which breaks on `export default`.
    config.module.rules.push({
      test: /\.ya?ml$/,
      include: path.resolve(__dirname, 'src'),
      type: 'javascript/auto',
      use: 'yaml-loader',
    });

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
    } else if (webpackParallelism && webpackParallelism > 0) {
      // Webpack defaults to high parallelism; cap it so Cursor/other apps stay responsive.
      config.parallelism = webpackParallelism;
    }
    return config;
  },
};

export default withSerwist(
  withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "zonevast-td",

  project: "forsa-dashboard",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: !isSafeBuild,

  // Skip Sentry upload work during local safe builds (major CPU/IO saver).
  ...(isSafeBuild ? { sourcemaps: { disable: true } } : {}),

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
}),
);
