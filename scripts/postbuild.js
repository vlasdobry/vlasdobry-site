import { mkdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Move en.html to en/index.html for clean URLs
const enSrc = join(distDir, 'en.html');
const enDest = join(distDir, 'en', 'index.html');

if (existsSync(enSrc)) {
  mkdirSync(join(distDir, 'en'), { recursive: true });
  renameSync(enSrc, enDest);
  console.log('Moved en.html -> en/index.html');
}

// Move for-hotels.html to for-hotels/index.html for clean URLs
const hotelsRuSrc = join(distDir, 'for-hotels.html');
const hotelsRuDest = join(distDir, 'for-hotels', 'index.html');

if (existsSync(hotelsRuSrc)) {
  mkdirSync(join(distDir, 'for-hotels'), { recursive: true });
  renameSync(hotelsRuSrc, hotelsRuDest);
  console.log('Moved for-hotels.html -> for-hotels/index.html');
}

// Move for-hotels-en.html to en/for-hotels/index.html for clean URLs
const hotelsEnSrc = join(distDir, 'for-hotels-en.html');
const hotelsEnDest = join(distDir, 'en', 'for-hotels', 'index.html');

if (existsSync(hotelsEnSrc)) {
  mkdirSync(join(distDir, 'en', 'for-hotels'), { recursive: true });
  renameSync(hotelsEnSrc, hotelsEnDest);
  console.log('Moved for-hotels-en.html -> en/for-hotels/index.html');
}
