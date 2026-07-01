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
    const token = cookies.get('admin_session')?.value;
    
    if (!token) {
      return new Response(JSON.stringify({ message: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let payload;
    try {
      const result = await jose.jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Sesión inválida o expirada' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ message: 'Ambas contraseñas son requeridas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ message: 'La nueva contraseña debe tener al menos 6 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = payload.email as string;
    const users = await db.select().from(admins).where(eq(admins.email, email));
    const user = users[0];

    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'La contraseña actual es incorrecta' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db.update(admins)
      .set({ passwordHash: newPasswordHash })
      .where(eq(admins.id, user.id));

    return new Response(JSON.stringify({ message: 'Contraseña actualizada exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
