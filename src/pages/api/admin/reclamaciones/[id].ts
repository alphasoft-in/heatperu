import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { complaints } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const id = params.id as string;
    if (!id) {
      return new Response(JSON.stringify({ success: false, message: 'ID inválido' }), { status: 400 });
    }

    const data = await request.json();
    
    await db.update(complaints)
      .set({ 
        status: data.status,
        resolutionType: data.resolutionType || null,
        resolutionMessage: data.resolutionMessage || null,
        resolvedAt: data.status === 'Atendido' ? new Date() : null
      })
      .where(eq(complaints.id, id));

    return new Response(JSON.stringify({ success: true, message: 'Estado actualizado exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
