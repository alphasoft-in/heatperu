import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Creating admins table if not exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  
  console.log('Inserting default admin...');
  const email = 'admin@heatperu.com';
  const password = 'admin'; // We will just use 'admin' for simplicity. User can change later.
  const passwordHash = await bcrypt.hash(password, 10);
  const name = 'Administrador Principal';

  // Check if admin exists
  const existing = await sql`SELECT * FROM admins WHERE email = ${email}`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO admins (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
    `;
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Done!');
}

main().catch(console.error);
