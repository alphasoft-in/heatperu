import 'dotenv/config';
import { db } from '../src/db/index';
import { products } from '../src/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const latestProducts = await db.select().from(products).orderBy(desc(products.id)).limit(10);
  for (const p of latestProducts) {
    if (p.pdfUrl) {
      console.log(`Product ID: ${p.id}, URL: ${p.pdfUrl}`);
    }
  }
}
main().catch(console.error);
