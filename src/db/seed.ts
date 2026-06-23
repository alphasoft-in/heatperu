import 'dotenv/config';
import { db } from './index';
import { categories, subcategories, products } from './schema';

async function main() {
  console.log('Seeding database...');

  // Insert Categories
  const insertedCategories = await db.insert(categories).values([
    { name: "ACTUADORES", slug: "actuadores", imageUrl: "/cat_actuadores.png" },
    { name: "BOMBAS DE AGUA Y ACEITE", slug: "bombas-agua-aceite", imageUrl: "/cat_bombas_agua.png" },
    { name: "BOMBAS DE PETRÓLEO Y ACCESORIOS", slug: "bombas-petroleo", imageUrl: "/cat_bombas_petroleo.png" },
    { name: "CONTROLADORES", slug: "controladores", imageUrl: "/cat_controladores.png" }
  ]).returning();

  const actuadoresCategory = insertedCategories.find(c => c.slug === 'actuadores')!;

  // Insert Subcategories
  const insertedSubcategories = await db.insert(subcategories).values([
    {
      categoryId: actuadoresCategory.id,
      name: "MODULACIÓN ELECTRÓNICA",
      slug: "modulacion-electronica",
      imageUrl: "/subcat_modulacion.png"
    },
    {
      categoryId: actuadoresCategory.id,
      name: "MULTIFUNCIÓN",
      slug: "multifuncion",
      imageUrl: "/subcat_multifuncion.png"
    }
  ]).returning();

  const modulacionSubcategory = insertedSubcategories.find(s => s.slug === 'modulacion-electronica')!;

  // Insert Products
  await db.insert(products).values([
    {
      subcategoryId: modulacionSubcategory.id,
      name: "ACTUADOR DE SISTEMA CONTROL LINK ML7999A2001",
      slug: "ml7999a2001",
      sku: "10686",
      brand: "HONEYWELL",
      isAvailable: true,
      imageUrl: "/prod_ml7999.png",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "ACTUADOR R8001M1150 150 LB AIRE/GAS",
      slug: "r8001m1150",
      sku: "10302",
      brand: "HONEYWELL",
      isAvailable: true,
      imageUrl: "/prod_r8001m1150.png",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "ACTUADORES R8001M4050 50 LB GAS",
      slug: "r8001m4050",
      sku: "10548",
      brand: "HONEYWELL",
      isAvailable: true,
      imageUrl: "/prod_r8001m4050.png",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "SERVOMOTOR SIEMENS SQM45.295B9 3NM",
      slug: "sqm45-295b9",
      sku: "10672",
      brand: "SIEMENS",
      isAvailable: true,
      imageUrl: "/prod_sqm45.png",
    }
  ]);

  console.log('Database seeded successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
