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
