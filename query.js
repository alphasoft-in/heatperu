import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_YLR5EGHXkvW1@ep-delicate-cell-ai21kn9i-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    const rows = await sql`SELECT * FROM admins LIMIT 1`;
    console.log(rows);
  } catch(e) {
    console.error(e)
  }
}
run();
