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
  console.error("CRITICAL ERROR: DATABASE_URL is not set.");
  console.error("Available process.env keys:", typeof process !== 'undefined' ? Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DB') || k.includes('NEON')) : 'No process.env');
  console.error("Available import.meta.env keys:", typeof import.meta !== 'undefined' && import.meta.env ? Object.keys(import.meta.env) : 'No import.meta.env');
  // We throw so Vercel logs the actual error with the trace, but now we have context above it.
  throw new Error('DATABASE_URL is not set in environment.');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
