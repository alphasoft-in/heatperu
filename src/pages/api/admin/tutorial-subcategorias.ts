import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { tutorialSubcategories } from '../../../db/schema';

function generateSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, categoryId } = body;

    if (!name || !categoryId) {
      return new Response(JSON.stringify({ error: 'Nombre y categoría son obligatorios' }), { status: 400 });
    }

    const slug = generateSlug(name);

    await db.insert(tutorialSubcategories).values({
      name,
      slug,
      categoryId: Number(categoryId),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/tutorial-subcategorias:", error);
    if (error?.code === '23505') {
      return new Response(JSON.stringify({ error: 'Ya existe una subcategoría con este nombre.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: error?.message || 'Error al crear la subcategoría.' }), { status: 500 });
  }
};
