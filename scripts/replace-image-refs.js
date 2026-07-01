import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Regex para buscar extensiones de imagen en strings.
// Abarca .png, .jpg, .jpeg precedidos por texto.
const regex = /(\.png|\.jpe?g)/gi;

async function processDirectory(dir) {
  let modifiedFiles = 0;
  const list = await fs.readdir(dir);
  
  for (const file of list) {
    const fullPath = path.resolve(dir, file);
    const stat = await fs.stat(fullPath);
    
    if (stat && stat.isDirectory()) {
      modifiedFiles += await processDirectory(fullPath);
    } else {
      // Ignorar archivos que no sean de texto/código (por si acaso)
      const ext = path.extname(fullPath).toLowerCase();
      if (['.ts', '.tsx', '.astro', '.js', '.jsx', '.md', '.json', '.html', '.css'].includes(ext)) {
        let content = await fs.readFile(fullPath, 'utf8');
        
        if (regex.test(content)) {
          console.log(`Actualizando referencias en: ${fullPath}`);
          content = content.replace(regex, '.avif');
          await fs.writeFile(fullPath, content, 'utf8');
          modifiedFiles++;
        }
      }
    }
  }
  
  return modifiedFiles;
}

async function main() {
  console.log(`Iniciando reemplazo de referencias en ${SRC_DIR}...`);
  const count = await processDirectory(SRC_DIR);
  console.log(`\nCompletado. Se actualizaron ${count} archivos en src/.`);
}

main().catch(console.error);
