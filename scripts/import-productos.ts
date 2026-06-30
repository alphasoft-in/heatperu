import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { db } from '../src/db/index.js';
import { categories, subcategories, products } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Iniciando extracción de productos...');

  // Obtener familias y subcategorías
  const dbCategories = await db.select().from(categories);
  const dbSubcategories = await db.select().from(subcategories);

  const uploadDirImg = path.join(process.cwd(), 'public', 'uploads', 'productos', 'imagenes');
  const uploadDirPdf = path.join(process.cwd(), 'public', 'uploads', 'productos', 'pdfs');
  if (!fs.existsSync(uploadDirImg)) fs.mkdirSync(uploadDirImg, { recursive: true });
  if (!fs.existsSync(uploadDirPdf)) fs.mkdirSync(uploadDirPdf, { recursive: true });

  let totalImported = 0;

  for (const sub of dbSubcategories) {
    const family = dbCategories.find(c => c.id === sub.categoryId);
    if (!family) continue;

    console.log(`\n--- Extrayendo productos para: ${family.name} > ${sub.name} ---`);
    
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = `https://heatperu.com/${family.slug}/${sub.slug}?page=${page}`;
      
      try {
        console.log(`Página ${page}: ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`Error al acceder a ${url}`);
          break;
        }
        const html = await res.text();
        
        const dataPageMatch = html.match(/data-page="([^"]+)"/);
        if (!dataPageMatch) break;
        
        const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
        const data = JSON.parse(jsonStr);
        
        if (!data.props.commodities || !data.props.commodities.data) {
          console.log(`No se encontraron productos en la pág ${page}.`);
          break;
        }

        const items = data.props.commodities.data;
        if (items.length === 0) {
          break;
        }

        for (const item of items) {
          console.log(`  [${item.name}] Importando...`);
          
          let mainImage = '';
          const gallery = [];
          let pdfUrl = '';

          if (item.media && Array.isArray(item.media)) {
            const images = item.media.filter((m: any) => m.collection_name === 'commodities' || m.collection_name === 'commodity_images');
            const pdfs = item.media.filter((m: any) => m.collection_name === 'comodity_guides' || m.mime_type === 'application/pdf');

            for (let i = 0; i < images.length; i++) {
              const m = images[i];
              const originalUrl = m.original_url;
              const cleanUrl = originalUrl.split('?')[0];
              const ext = path.extname(cleanUrl) || '.jpg';
              const fileName = `${item.slug}-img${i}-${Date.now()}${ext}`;
              const localPath = path.join(uploadDirImg, fileName);
              
              try {
                const imgRes = await fetch(originalUrl);
                if (imgRes.ok) {
                  fs.writeFileSync(localPath, Buffer.from(await imgRes.arrayBuffer()));
                  if (i === 0) {
                    mainImage = `/uploads/productos/imagenes/${fileName}`;
                  } else {
                    gallery.push(`/uploads/productos/imagenes/${fileName}`);
                  }
                }
              } catch (e) {
                console.error(`Error descargando imagen de ${item.name}`);
              }
            }

            if (pdfs.length > 0) {
              const p = pdfs[0];
              const originalUrl = p.original_url;
              const cleanUrl = originalUrl.split('?')[0];
              const ext = path.extname(cleanUrl) || '.pdf';
              const fileName = `${item.slug}-ficha-${Date.now()}${ext}`;
              const localPath = path.join(uploadDirPdf, fileName);

              try {
                const pdfRes = await fetch(originalUrl);
                if (pdfRes.ok) {
                  fs.writeFileSync(localPath, Buffer.from(await pdfRes.arrayBuffer()));
                  pdfUrl = `/uploads/productos/pdfs/${fileName}`;
                }
              } catch (e) {
                console.error(`Error descargando PDF de ${item.name}`);
              }
            }
          }

          if (!mainImage) mainImage = '/placeholder-product.jpg';

          try {
            await db.insert(products).values({
              subcategoryId: sub.id,
              name: item.name,
              slug: item.slug,
              sku: item.sku || 'N/A',
              brand: item.brand ? item.brand.name : 'Genérico',
              model: item.model || '',
              description: item.description || '',
              isAvailable: item.available !== false,
              imageUrl: mainImage,
              galleryUrls: JSON.stringify(gallery),
              pdfUrl: pdfUrl || null,
            }).onConflictDoUpdate({
              target: products.slug,
              set: {
                name: item.name,
                sku: item.sku || 'N/A',
                brand: item.brand ? item.brand.name : 'Genérico',
                model: item.model || '',
                description: item.description || '',
                isAvailable: item.available !== false,
                imageUrl: mainImage,
                galleryUrls: JSON.stringify(gallery),
                pdfUrl: pdfUrl || null,
              }
            });
            console.log(`  [${item.name}] ✓ Guardado.`);
            totalImported++;
          } catch (err) {
            console.error(`  [${item.name}] ❌ Error BD:`, err);
          }
        }

        if (data.props.commodities.next_page_url) {
          page++;
        } else {
          hasMorePages = false;
        }

      } catch (e) {
        console.error(`Error procesando subcategoría ${sub.name}:`, e);
        hasMorePages = false;
      }
    }
  }

  console.log(`\n¡Proceso finalizado! Se importaron/actualizaron ${totalImported} productos.`);
  process.exit(0);
}

main().catch(console.error);
