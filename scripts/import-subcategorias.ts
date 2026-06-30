import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { db } from '../src/db/index.js';
import { categories, subcategories } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Iniciando extracción de subcategorías...');

  // Obtener todas las categorías (familias) que ya guardamos en la BD
  const dbCategories = await db.select().from(categories);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'subcategorias');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let totalImported = 0;

  for (const category of dbCategories) {
    console.log(`\n--- Extrayendo subcategorías para la familia: ${category.name} ---`);
    const url = `https://heatperu.com/${category.slug}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Error al acceder a ${url} (HTTP ${res.status})`);
        continue;
      }
      const html = await res.text();
      
      const dataPageMatch = html.match(/data-page="([^"]+)"/);
      if (!dataPageMatch) continue;
      
      const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
      const data = JSON.parse(jsonStr);
      
      const categoryList = data.props.categories || [];
      if (categoryList.length === 0) {
        console.log(`No se encontraron subcategorías para ${category.name}.`);
        continue;
      }
      
      for (const sub of categoryList) {
        let imageUrl = '';
        if (sub.media && sub.media.length > 0) {
          const originalUrl = sub.media[0].original_url;
          const cleanUrl = originalUrl.split('?')[0];
          const ext = path.extname(cleanUrl) || '.jpg';
          const fileName = `${sub.slug}-${Date.now()}${ext}`;
          const localPath = path.join(uploadDir, fileName);
          
          console.log(`  [${sub.name}] Descargando imagen...`);
          try {
            const imgRes = await fetch(originalUrl);
            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              fs.writeFileSync(localPath, Buffer.from(buffer));
              imageUrl = `/uploads/subcategorias/${fileName}`;
            }
          } catch (err) {
            console.error(`  [${sub.name}] Error descargando imagen:`, err);
          }
        }
        
        if (!imageUrl) {
          imageUrl = '/placeholder-subcategory.jpg';
        }

        try {
          await db.insert(subcategories).values({
            categoryId: category.id,
            name: sub.name,
            slug: sub.slug,
            imageUrl: imageUrl
          }).onConflictDoUpdate({
            target: subcategories.slug,
            set: {
              categoryId: category.id,
              name: sub.name,
              imageUrl: imageUrl,
            }
          });
          console.log(`  [${sub.name}] ✓ Guardado.`);
          totalImported++;
        } catch (err) {
          console.error(`  [${sub.name}] ❌ Error BD:`, err);
        }
      }
    } catch (e) {
      console.error(`Error procesando familia ${category.name}:`, e);
    }
  }

  console.log(`\n¡Proceso finalizado! Se importaron/actualizaron ${totalImported} subcategorías.`);
  process.exit(0);
}

main().catch(console.error);
