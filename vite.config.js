import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  base: '/hero-tactics/',
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      events: 'events/',
      util: 'util/',
    }
  },
  optimizeDeps: {
    include: ['socket.io-client'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        })
      ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  }
});
