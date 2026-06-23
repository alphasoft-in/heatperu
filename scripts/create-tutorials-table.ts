import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS "tutorials" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "youtube_url" text NOT NULL,
      "thumbnail_url" text,
      "order" integer DEFAULT 0 NOT NULL
    );
  `;
  console.log("Tutorials table created!");
}

main().catch(console.error);
