import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const res = await sql`SELECT * FROM tutorials`;
    console.log("Success:", res);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();
