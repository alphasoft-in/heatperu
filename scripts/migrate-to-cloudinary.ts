import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../src/db/index.js';
import { categories, subcategories, products } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function uploadToCloudinary(localUrl: string | null, folderName: string): Promise<string | null> {
  if (!localUrl) return null;
  if (localUrl.startsWith('http')) return localUrl; // Already absolute URL
  
  const localPath = path.join(PUBLIC_DIR, localUrl);
  if (!fs.existsSync(localPath)) {
    console.warn(`Archivo local no encontrado: ${localPath}`);
    return null;
  }
  
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: `heatperu/${folderName}`,
      use_filename: true,
      unique_filename: false,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error subiendo ${localPath} a Cloudinary:`, error);
    return null;
  }
}

async function main() {
  console.log('Iniciando migración a Cloudinary...');
  
  // 1. Categorías
  const cList = await db.select().from(categories);
  for (const c of cList) {
    if (c.imageUrl && c.imageUrl.startsWith('/uploads/')) {
      process.stdout.write(`Subiendo imagen de categoría [${c.name}]... `);
      const url = await uploadToCloudinary(c.imageUrl, 'categorias');
      if (url) {
        await db.update(categories).set({ imageUrl: url }).where(eq(categories.id, c.id));
        console.log('✓ OK');
      } else {
        console.log('✗ FAILED');
      }
    }
  }

  // 2. Subcategorías
  const sList = await db.select().from(subcategories);
  for (const s of sList) {
    if (s.imageUrl && s.imageUrl.startsWith('/uploads/')) {
      process.stdout.write(`Subiendo imagen de subcategoría [${s.name}]... `);
      const url = await uploadToCloudinary(s.imageUrl, 'subcategorias');
      if (url) {
        await db.update(subcategories).set({ imageUrl: url }).where(eq(subcategories.id, s.id));
        console.log('✓ OK');
      } else {
        console.log('✗ FAILED');
      }
    }
  }

  // 3. Productos
  const pList = await db.select().from(products);
  let index = 1;
  for (const p of pList) {
    console.log(`Procesando producto ${index}/${pList.length}: [${p.name}]`);
    let updated = false;
    let newImageUrl = p.imageUrl;
    let newPdfUrl = p.pdfUrl;
    let newGallery = [...(p.galleryUrls || [])];

    // Main image
    if (newImageUrl && newImageUrl.startsWith('/uploads/')) {
      const url = await uploadToCloudinary(newImageUrl, 'productos/imagenes');
      if (url) {
        newImageUrl = url;
        updated = true;
      }
    }

    // PDF
    if (newPdfUrl && newPdfUrl.startsWith('/uploads/')) {
      const url = await uploadToCloudinary(newPdfUrl, 'productos/pdfs');
      if (url) {
        newPdfUrl = url;
        updated = true;
      }
    }

    // Gallery
    for (let i = 0; i < newGallery.length; i++) {
      if (newGallery[i] && newGallery[i].startsWith('/uploads/')) {
        const url = await uploadToCloudinary(newGallery[i], 'productos/imagenes');
        if (url) {
          newGallery[i] = url;
          updated = true;
        }
      }
    }

    if (updated) {
      await db.update(products).set({
        imageUrl: newImageUrl,
        pdfUrl: newPdfUrl,
        galleryUrls: newGallery
      }).where(eq(products.id, p.id));
    }
    index++;
  }

  console.log('Migración finalizada.');
  process.exit(0);
}

main().catch(console.error);
