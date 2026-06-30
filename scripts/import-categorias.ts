import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { db } from '../src/db/index.js';
import { categories } from '../src/db/schema.js';

async function main() {
  console.log('Iniciando la extracción de categorías desde https://heatperu.com/productos...');
  const res = await fetch('https://heatperu.com/productos');
  const html = await res.text();
  
  // Extraer el atributo data-page
  const dataPageMatch = html.match(/data-page="([^"]+)"/);
  if (!dataPageMatch) {
    console.error('No se pudo encontrar el atributo data-page en el HTML');
    return;
  }
  
  // Desescapar entidades HTML y parsear el JSON
  const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
  const data = JSON.parse(jsonStr);
  
  const familyList = data.props.familyList || [];
  console.log(`Se encontraron ${familyList.length} categorías (familias).`);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'categorias');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let count = 0;
  for (const family of familyList) {
    let imageUrl = '';
    
    if (family.media && family.media.length > 0) {
      const originalUrl = family.media[0].original_url;
      // Usar url limpia para la extensión
      const cleanUrl = originalUrl.split('?')[0]; 
      const ext = path.extname(cleanUrl) || '.jpg';
      const fileName = `${family.slug}-${Date.now()}${ext}`;
      const localPath = path.join(uploadDir, fileName);
      
      console.log(`[${family.name}] Descargando imagen desde ${originalUrl}...`);
      try {
        const imgRes = await fetch(originalUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          fs.writeFileSync(localPath, Buffer.from(buffer));
          imageUrl = `/uploads/categorias/${fileName}`;
          console.log(`[${family.name}] Imagen guardada exitosamente.`);
        } else {
          console.error(`[${family.name}] HTTP Error al descargar imagen: ${imgRes.status}`);
        }
      } catch (err) {
        console.error(`[${family.name}] Error descargando la imagen:`, err);
      }
    }
    
    if (!imageUrl) {
        imageUrl = '/placeholder-category.jpg'; // fallback
    }

    try {
      console.log(`[${family.name}] Guardando en la base de datos...`);
      await db.insert(categories).values({
        name: family.name,
        slug: family.slug,
        imageUrl: imageUrl,
      }).onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: family.name,
          imageUrl: imageUrl,
        }
      });
      console.log(`[${family.name}] ✓ Guardado completado.`);
      count++;
    } catch (err) {
      console.error(`[${family.name}] ❌ Error al guardar en DB:`, err);
    }
  }
  
  console.log(`\n¡Proceso finalizado! Se importaron/actualizaron ${count} categorías exitosamente.`);
  process.exit(0);
}

main().catch(console.error);
