import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        technology: resolve(__dirname, 'technology.html'),
        order: resolve(__dirname, 'order.html'),
        specs: resolve(__dirname, 'specs.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  }
});
