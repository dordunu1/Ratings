import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'window', // Polyfill global for browser
  },
  server: {
    // Removed COOP and COEP headers for Coinbase Wallet compatibility
    // No custom headers set
    allowedHosts: [
      'dedicated-bachelor-video-could.trycloudflare.com'
    ]
  }
  // If you need to set up custom middlewares for .wasm, add them here in a supported way for your Vite version.
});