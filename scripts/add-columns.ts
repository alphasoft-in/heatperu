import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    await sql`ALTER TABLE complaints ADD COLUMN resolution_type text;`;
    console.log("Added resolution_type column");
  } catch(e) { console.log(e); }
  
  try {
    await sql`ALTER TABLE complaints ADD COLUMN resolution_message text;`;
    console.log("Added resolution_message column");
  } catch(e) { console.log(e); }
  
  console.log("Done");
}

main();
