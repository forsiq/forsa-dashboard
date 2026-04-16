import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 4001,
    host: '0.0.0.0',
    proxy: {
      '/api/v1/auth': {
        target: 'https://test.zonevast.com',
        changeOrigin: true,
        secure: false,
      },
      '/graphql': {
        target: 'https://test.zonevast.com/graphql',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/graphql/, ''),
      },
    },
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      '@core': path.resolve(__dirname, './src/core'),
      '@core/': path.resolve(__dirname, './src/core/'),
      '@features': path.resolve(__dirname, './src/features'),
      '@features/': path.resolve(__dirname, './src/features/'),
      '@services': path.resolve(__dirname, './src/services'),
      '@services/': path.resolve(__dirname, './src/services/'),
      '@config': path.resolve(__dirname, './src/config'),
      '@config/': path.resolve(__dirname, './src/config/'),
      '@types': path.resolve(__dirname, './src/types'),
      '@types/': path.resolve(__dirname, './src/types/'),
    }
  }
});
