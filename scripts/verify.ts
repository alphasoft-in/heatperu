import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sqlDb = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    const result = await sqlDb`SELECT column_name FROM information_schema.columns WHERE table_name='complaints';`;
    console.log(result.map(r => r.column_name));
    
    // Attempt to add it again just in case
    await sqlDb`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at timestamp;`;
    console.log("Column added manually via neon");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
