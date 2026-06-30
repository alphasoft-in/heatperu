import 'dotenv/config';
import { db } from '../src/db/index.js';
import { categories, subcategories, products } from '../src/db/schema.js';

async function main() {
  console.log('Iniciando verificación de conteos...');

  // 1. Obtener conteos de la BD local
  const cList = await db.select().from(categories);
  const sList = await db.select().from(subcategories);
  const pList = await db.select().from(products);

  console.log('--- CONTEOS EN BASE DE DATOS LOCAL ---');
  console.log('Categorías (Familias):', cList.length);
  console.log('Subcategorías:', sList.length);
  console.log('Productos:', pList.length);
  
  // 2. Scraping web heatperu.com
  console.log('\n--- EXTRACCIÓN DE CONTEOS DESDE LA WEB ---');
  let webCategoriesCount = 0;
  let webSubcategoriesCount = 0;
  let webProductsCount = 0;

  const res = await fetch('https://heatperu.com/productos');
  const html = await res.text();
  
  const dataPageMatch = html.match(/data-page="([^"]+)"/);
  if (!dataPageMatch) {
    console.error('No se pudo encontrar data-page');
    return;
  }
  
  const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
  const data = JSON.parse(jsonStr);
  const familyList = data.props.familyList || [];
  webCategoriesCount = familyList.length;

  for (const family of familyList) {
    const famRes = await fetch(`https://heatperu.com/${family.slug}`);
    const famHtml = await famRes.text();
    const famMatch = famHtml.match(/data-page="([^"]+)"/);
    if (!famMatch) continue;
    
    const famJson = JSON.parse(famMatch[1].replace(/&quot;/g, '"'));
    const categoryList = famJson.props.categoryList || [];
    // The previous script found that subcategories in old web are under `props.categories` or `categoryList`?
    // Wait, the previous test showed it was `categories`. Let's use `categories`.
    const subs = famJson.props.categories || [];
    webSubcategoriesCount += subs.length;

    for (const sub of subs) {
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const subRes = await fetch(`https://heatperu.com/${family.slug}/${sub.slug}?page=${page}`);
        const subHtml = await subRes.text();
        const subMatch = subHtml.match(/data-page="([^"]+)"/);
        if (!subMatch) break;
        
        const subJson = JSON.parse(subMatch[1].replace(/&quot;/g, '"'));
        const comms = subJson.props.commodities?.data || [];
        webProductsCount += comms.length;

        if (subJson.props.commodities?.next_page_url) {
          page++;
        } else {
          hasMore = false;
        }
      }
    }
  }

  console.log('Categorías (Familias) en Web:', webCategoriesCount);
  console.log('Subcategorías en Web:', webSubcategoriesCount);
  console.log('Productos en Web:', webProductsCount);
  
  console.log('\n--- RESUMEN DE DIFERENCIAS ---');
  console.log(`Categorías Diferencia: ${webCategoriesCount - cList.length}`);
  console.log(`Subcategorías Diferencia: ${webSubcategoriesCount - sList.length}`);
  console.log(`Productos Diferencia: ${webProductsCount - pList.length}`);

  process.exit(0);
}

main().catch(console.error);
