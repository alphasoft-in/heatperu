import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { db } from '../src/db/index.js';
import { categories, subcategories, products } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://heatperu.com/productos';
const UPLOADS_DIR = path.resolve('public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadFile(url: string, filename: string): Promise<string | null> {
  const filepath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filepath)) {
    return `/uploads/${filename}`;
  }
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`Warning: Failed to download ${url}: ${res.statusCode}`);
        return resolve(filename.endsWith('.pdf') ? null : '/placeholder.png');
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`/uploads/${filename}`);
      });
      fileStream.on('error', (err) => {
        console.warn(`Error writing ${filepath}:`, err.message);
        fs.unlink(filepath, () => resolve(filename.endsWith('.pdf') ? null : '/placeholder.png'));
      });
    }).on('error', (err) => {
      console.warn(`Network error downloading ${url}:`, err.message);
      resolve(filename.endsWith('.pdf') ? null : '/placeholder.png');
    });
  });
}

async function fetchPage(pageUrl: string) {
  const res = await fetch(pageUrl);
  const text = await res.text();
  const match = text.match(/data-page="([^"]+)"/);
  if (!match) throw new Error('data-page not found on ' + pageUrl);
  const jsonStr = match[1].replace(/&quot;/g, '"');
  return JSON.parse(jsonStr);
}

async function run() {
  console.log('Fetching first page...');
  const firstPage = await fetchPage(BASE_URL);
  
  const familyList = firstPage.props.familyList || [];
  console.log(`Found ${familyList.length} families (categories).`);
  
  const categoryIdMap = new Map<number, number>(); // family.id -> our category.id
  
  // 1. Insert Categories
  for (const family of familyList) {
    let imageUrl = '/placeholder.png';
    if (family.media && family.media.length > 0) {
      console.log(`Downloading image for category ${family.name}...`);
      imageUrl = await downloadFile(family.media[0].original_url, family.media[0].file_name);
    }
    
    // Check if exists
    let cat = await db.select().from(categories).where(eq(categories.slug, family.slug));
    let catId: number;
    
    if (cat.length === 0) {
      const inserted = await db.insert(categories).values({
        name: family.name,
        slug: family.slug,
        imageUrl,
      }).returning();
      catId = inserted[0].id;
    } else {
      catId = cat[0].id;
    }
    categoryIdMap.set(family.id, catId);
  }

  // 2. Fetch and Insert Commodities
  let currentPageUrl = BASE_URL;
  let totalProducts = 0;
  
  const subcategoryIdMap = new Map<number, number>(); // their category_id -> our subcategory.id
  
  while (currentPageUrl) {
    console.log(`Fetching ${currentPageUrl}...`);
    const pageData = await fetchPage(currentPageUrl);
    const commodities = pageData.props.commodities;
    
    for (const commodity of commodities.data) {
      // Find or create subcategory
      const oldCategoryId = parseInt(commodity.category.id);
      let subcatId = subcategoryIdMap.get(oldCategoryId);
      
      if (!subcatId) {
        // Create subcategory
        const oldFamilyId = parseInt(commodity.category.family_id);
        const mappedCatId = categoryIdMap.get(oldFamilyId);
        
        if (!mappedCatId) {
          console.warn(`Category mapping not found for family_id ${oldFamilyId}`);
          continue;
        }
        
        let subcat = await db.select().from(subcategories).where(eq(subcategories.slug, commodity.category.slug));
        if (subcat.length === 0) {
          const inserted = await db.insert(subcategories).values({
            categoryId: mappedCatId,
            name: commodity.category.name,
            slug: commodity.category.slug,
            imageUrl: '/placeholder.png', // We'll just use placeholder for subcategories if no image
          }).returning();
          subcatId = inserted[0].id;
        } else {
          subcatId = subcat[0].id;
        }
        subcategoryIdMap.set(oldCategoryId, subcatId);
      }
      
      // Images & PDFs
      let imageUrl = '/placeholder.png';
      let pdfUrl: string | null = null;
      const galleryUrls: string[] = [];
      
      if (commodity.media) {
        for (const m of commodity.media) {
          if (m.mime_type.startsWith('image/')) {
            console.log(`Downloading image for product ${commodity.name}...`);
            const dlUrl = await downloadFile(m.original_url, m.file_name);
            if (dlUrl && dlUrl !== '/placeholder.png') {
              galleryUrls.push(dlUrl);
            }
          } else if (m.mime_type === 'application/pdf') {
            if (!pdfUrl) { // only get the first pdf
              console.log(`Downloading PDF for product ${commodity.name}...`);
              pdfUrl = await downloadFile(m.original_url, m.file_name);
            }
          }
        }
      }

      if (galleryUrls.length > 0) {
        imageUrl = galleryUrls[0];
      }
      
      // Insert or update product
      const existingProduct = await db.select().from(products).where(eq(products.slug, commodity.slug));
      if (existingProduct.length === 0) {
        await db.insert(products).values({
          subcategoryId: subcatId,
          name: commodity.name,
          slug: commodity.slug,
          sku: commodity.sku || 'N/A',
          brand: commodity.brand ? commodity.brand.name : 'Genérico',
          model: commodity.model || null,
          description: commodity.description || null,
          isAvailable: commodity.available === 1 || commodity.available === true,
          imageUrl,
          galleryUrls: JSON.stringify(galleryUrls),
          pdfUrl,
        });
      } else {
        // Update existing with model and description
        await db.update(products).set({
          model: commodity.model || null,
          description: commodity.description || null,
          imageUrl,
          galleryUrls: JSON.stringify(galleryUrls),
        }).where(eq(products.slug, commodity.slug));
      }
      totalProducts++;
    }
    
    currentPageUrl = commodities.next_page_url;
  }
  
  console.log(`Successfully imported ${totalProducts} products!`);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
