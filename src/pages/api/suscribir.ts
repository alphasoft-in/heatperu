import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { subscribers } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, message: 'Correo electrónico inválido' }), { status: 400 });
    }

    // Comprobar si ya existe
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email));
    
    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: true, message: '¡Ya estabas suscrito!' }), { status: 200 });
    }

    // Insertar nuevo suscriptor
    await db.insert(subscribers).values({
      email: email,
      status: 'Activo'
    });

    return new Response(JSON.stringify({ success: true, message: '¡Suscripción exitosa!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error al suscribir:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
