import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { tutorialSubcategories } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!id) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });

    await db.delete(tutorialSubcategories).where(eq(tutorialSubcategories.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error al eliminar subcategoría de tutorial:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al eliminar' }), { status: 500 });
  }
};
