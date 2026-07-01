import 'dotenv/config';
import { db } from './index';
import { categories, subcategories, products } from './schema';

async function main() {
  console.log('Seeding database...');

  // Insert Categories
  const insertedCategories = await db.insert(categories).values([
    { name: "ACTUADORES", slug: "actuadores", imageUrl: "/cat_actuadores.avif" },
    { name: "BOMBAS DE AGUA Y ACEITE", slug: "bombas-agua-aceite", imageUrl: "/cat_bombas_agua.avif" },
    { name: "BOMBAS DE PETRÓLEO Y ACCESORIOS", slug: "bombas-petroleo", imageUrl: "/cat_bombas_petroleo.avif" },
    { name: "CONTROLADORES", slug: "controladores", imageUrl: "/cat_controladores.avif" }
  ]).returning();

  const actuadoresCategory = insertedCategories.find(c => c.slug === 'actuadores')!;

  // Insert Subcategories
  const insertedSubcategories = await db.insert(subcategories).values([
    {
      categoryId: actuadoresCategory.id,
      name: "MODULACIÓN ELECTRÓNICA",
      slug: "modulacion-electronica",
      imageUrl: "/subcat_modulacion.avif"
    },
    {
      categoryId: actuadoresCategory.id,
      name: "MULTIFUNCIÓN",
      slug: "multifuncion",
      imageUrl: "/subcat_multifuncion.avif"
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
      imageUrl: "/prod_ml7999.avif",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "ACTUADOR R8001M1150 150 LB AIRE/GAS",
      slug: "r8001m1150",
      sku: "10302",
      brand: "HONEYWELL",
      isAvailable: true,
      imageUrl: "/prod_r8001m1150.avif",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "ACTUADORES R8001M4050 50 LB GAS",
      slug: "r8001m4050",
      sku: "10548",
      brand: "HONEYWELL",
      isAvailable: true,
      imageUrl: "/prod_r8001m4050.avif",
    },
    {
      subcategoryId: modulacionSubcategory.id,
      name: "SERVOMOTOR SIEMENS SQM45.295B9 3NM",
      slug: "sqm45-295b9",
      sku: "10672",
      brand: "SIEMENS",
      isAvailable: true,
      imageUrl: "/prod_sqm45.avif",
    }
  ]);

  console.log('Database seeded successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
