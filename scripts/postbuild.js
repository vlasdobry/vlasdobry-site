import { mkdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const moves = [
  { src: 'en.html', dest: 'en/index.html' },
  { src: 'for-hotels.html', dest: 'for-hotels/index.html' },
  { src: 'for-hotels-en.html', dest: 'en/for-hotels/index.html' },
  { src: 'for-labs.html', dest: 'for-labs/index.html' },
  { src: 'for-labs-en.html', dest: 'en/for-labs/index.html' },
  { src: 'for-spa.html', dest: 'for-spa/index.html' },
  { src: 'for-spa-en.html', dest: 'en/for-spa/index.html' },
  { src: 'projects.html', dest: 'projects/index.html' },
  { src: 'projects-en.html', dest: 'en/projects/index.html' },
];

for (const { src, dest } of moves) {
  const srcPath = join(distDir, src);
  const destPath = join(distDir, dest);
  if (existsSync(srcPath)) {
    mkdirSync(dirname(destPath), { recursive: true });
    renameSync(srcPath, destPath);
    console.log(`Moved ${src} -> ${dest}`);
  }
}
