import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Extensiones a buscar
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg']);

async function findImages(dir) {
  let results = [];
  const list = await fs.readdir(dir);
  for (const file of list) {
    const fullPath = path.resolve(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await findImages(fullPath));
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (IMG_EXTS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertToAvif(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const newPath = path.join(dir, `${baseName}.avif`);

  try {
    console.log(`Converting ${filePath} -> ${newPath}`);
    await sharp(filePath)
      .avif({ effort: 6, quality: 80 })
      .toFile(newPath);
    
    // Delete original file
    await fs.unlink(filePath);
    console.log(`Deleted original ${filePath}`);
  } catch (err) {
    console.error(`Error converting ${filePath}:`, err);
  }
}

async function main() {
  console.log(`Buscando imágenes en ${PUBLIC_DIR}...`);
  const images = await findImages(PUBLIC_DIR);
  console.log(`Encontradas ${images.length} imágenes.`);

  let successCount = 0;
  for (const img of images) {
    await convertToAvif(img);
    successCount++;
  }
  console.log(`\nConversión completada. ${successCount}/${images.length} imágenes procesadas.`);
}

main().catch(console.error);
