import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'rewrite-routes',
        configureServer(server) {
          const routes = [
            { prefix: '/en/for-hotels', file: '/for-hotels-en.html' },
            { prefix: '/en/for-labs', file: '/for-labs-en.html' },
            { prefix: '/en/for-spa', file: '/for-spa-en.html' },
            { prefix: '/en/projects', file: '/projects-en.html' },
            { prefix: '/for-hotels', file: '/for-hotels.html' },
            { prefix: '/for-labs', file: '/for-labs.html' },
            { prefix: '/for-spa', file: '/for-spa.html' },
            { prefix: '/projects', file: '/projects.html' },
            { prefix: '/en', file: '/en.html' },
          ];

          server.middlewares.use((req, _res, next) => {
            const url = req.url || '';
            if (!url.includes('.')) {
              const route = routes.find(r => url.startsWith(r.prefix));
              if (route) req.url = route.file;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          en: path.resolve(__dirname, 'en.html'),
          'for-hotels': path.resolve(__dirname, 'for-hotels.html'),
          'for-hotels-en': path.resolve(__dirname, 'for-hotels-en.html'),
          'for-labs': path.resolve(__dirname, 'for-labs.html'),
          'for-labs-en': path.resolve(__dirname, 'for-labs-en.html'),
          'for-spa': path.resolve(__dirname, 'for-spa.html'),
          'for-spa-en': path.resolve(__dirname, 'for-spa-en.html'),
          'projects': path.resolve(__dirname, 'projects.html'),
          'projects-en': path.resolve(__dirname, 'projects-en.html'),
        },
      },
    },
});
