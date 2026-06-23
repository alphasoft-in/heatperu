import 'dotenv/config';
import { db } from './src/db/index';
import { categories, subcategories, products } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  const allCategories = await db.select().from(categories);
  console.log("Categories:", allCategories.map(c => c.name));

  const levelControlCat = allCategories.find(c => c.name.toUpperCase() === 'CONTROLES DE NIVEL');
  if (levelControlCat) {
    const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, levelControlCat.id));
    console.log("Subcategories in Controles de Nivel:", subs.map(s => s.name));
    
    if (subs.length > 0) {
      const subIds = subs.map(s => s.id);
      const prods = await db.select().from(products).where(
        // dirty way to check if it's in the subIds
        eq(products.subcategoryId, subIds[0]) // just checking the first one for simplicity
      );
      console.log("Products in first subcategory:", prods);
    } else {
      console.log("No subcategories found for this category.");
    }
  } else {
    console.log("Category 'CONTROLES DE NIVEL' not found.");
  }
}

test().catch(console.error).finally(() => process.exit(0));
