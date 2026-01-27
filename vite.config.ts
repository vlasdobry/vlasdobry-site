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
          server.middlewares.use((req, _res, next) => {
            const url = req.url || '';
            // Handle /en/for-hotels routes
            if (url.startsWith('/en/for-hotels') && !url.includes('.')) {
              req.url = '/for-hotels-en.html';
            }
            // Handle /en/for-labs routes
            else if (url.startsWith('/en/for-labs') && !url.includes('.')) {
              req.url = '/for-labs-en.html';
            }
            // Handle /en/projects routes
            else if (url.startsWith('/en/projects') && !url.includes('.')) {
              req.url = '/projects-en.html';
            }
            // Handle /for-hotels routes (RU)
            else if (url.startsWith('/for-hotels') && !url.includes('.')) {
              req.url = '/for-hotels.html';
            }
            // Handle /for-labs routes (RU)
            else if (url.startsWith('/for-labs') && !url.includes('.')) {
              req.url = '/for-labs.html';
            }
            // Handle /en routes (main EN page)
            else if (url.startsWith('/en') && !url.includes('.')) {
              req.url = '/en.html';
            }
            // Handle /projects routes (RU)
            else if (url.startsWith('/projects') && !url.includes('.')) {
              req.url = '/projects.html';
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
          'projects': path.resolve(__dirname, 'projects.html'),
          'projects-en': path.resolve(__dirname, 'projects-en.html'),
        },
      },
    },
});
