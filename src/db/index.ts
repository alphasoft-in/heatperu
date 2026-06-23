import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let connectionString: string | undefined;

if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
} else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DATABASE_URL) {
  connectionString = import.meta.env.DATABASE_URL;
}

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
