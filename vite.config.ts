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
            // Blog posts (must be before blog list)
            { prefix: '/en/blog/', file: '/blog-post.html', isPost: true },
            { prefix: '/blog/', file: '/blog-post.html', isPost: true },
            // Blog list
            { prefix: '/en/blog', file: '/blog-en.html' },
            { prefix: '/blog', file: '/blog.html' },
            { prefix: '/en/services/seo', file: '/seo-en.html' },
            { prefix: '/en/services/geo', file: '/geo-en.html' },
            { prefix: '/services/seo', file: '/seo.html' },
            { prefix: '/services/geo', file: '/geo.html' },
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
              const route = routes.find(r => {
                if (r.isPost) {
                  // Blog post: /blog/[slug]/ but not /blog/ itself
                  const match = url.match(new RegExp(`^${r.prefix}[^/]+/?$`));
                  return match !== null;
                }
                return url.startsWith(r.prefix);
              });
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
          'seo': path.resolve(__dirname, 'seo.html'),
          'seo-en': path.resolve(__dirname, 'seo-en.html'),
          'geo': path.resolve(__dirname, 'geo.html'),
          'geo-en': path.resolve(__dirname, 'geo-en.html'),
          'blog': path.resolve(__dirname, 'blog.html'),
          'blog-en': path.resolve(__dirname, 'blog-en.html'),
          'blog-post': path.resolve(__dirname, 'blog-post.html'),
        },
      },
    },
});
