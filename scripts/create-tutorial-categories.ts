import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS tutorial_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0
    )
  `;
  console.log('tutorial_categories creada');

  await sql`
    CREATE TABLE IF NOT EXISTS tutorial_subcategories (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES tutorial_categories(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      "order" INTEGER NOT NULL DEFAULT 0
    )
  `;
  console.log('tutorial_subcategories creada');

  await sql`
    ALTER TABLE tutorials
    ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES tutorial_subcategories(id)
  `;
  console.log('columna subcategory_id agregada a tutorials');

  console.log('Migracion completada con exito.');
}

main().catch(console.error);
