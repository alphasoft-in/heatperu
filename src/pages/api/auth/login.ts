import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { admins } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'super-secret-heatperu-key-2026-fallback'
);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email y contraseña son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const users = await db.select().from(admins).where(eq(admins.email, email));
    const user = users[0];

    if (!user) {
      return new Response(JSON.stringify({ message: 'Credenciales inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'Credenciales inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create JWT
    const jwt = await new jose.SignJWT({ id: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d') // Expire in 1 day
      .sign(JWT_SECRET);

    // Set cookie
    cookies.set('admin_session', jwt, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return new Response(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
