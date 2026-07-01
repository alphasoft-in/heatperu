import 'dotenv/config';
import { db } from '../src/db/index.js';
import { admins } from '../src/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const adminUsers = [
  { email: 'elvis.zevallos@heatperu.com', password: '=[xC.XLF{]Bm$rPN', name: 'Elvis Zevallos' },
  { email: 'ana.hernandez@heatperu.com', password: 'IzL](3]W%zBbY(4c', name: 'Ana Hernandez' }
];

async function seed() {
  console.log('Seeding admins...');
  
  for (const user of adminUsers) {
    const existing = await db.select().from(admins).where(eq(admins.email, user.email));
    
    const passwordHash = await bcrypt.hash(user.password, 10);
    
    if (existing.length > 0) {
      console.log(`Updating ${user.email}...`);
      await db.update(admins)
        .set({ passwordHash, name: user.name })
        .where(eq(admins.email, user.email));
    } else {
      console.log(`Inserting ${user.email}...`);
      await db.insert(admins).values({
        email: user.email,
        passwordHash,
        name: user.name
      });
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
