import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { categories } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

function generateSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    if (isNaN(id)) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });

    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const imageFile = formData.get('image') as File | null;

    if (!name) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { status: 400 });
    }
    
    let imageUrl;
    
    // Si se subió una nueva imagen, la guardamos en Cloudinary
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'heatfactory/categorias' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      
      imageUrl = (uploadResult as any).secure_url;
    }

    const slug = generateSlug(name);
    
    // Actualizamos en la DB
    if (imageUrl) {
      await db.update(categories).set({ name, slug, imageUrl }).where(eq(categories.id, id));
    } else {
      // Si no hay nueva imagen, solo actualizamos el nombre y slug
      await db.update(categories).set({ name, slug }).where(eq(categories.id, id));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al actualizar la categoría' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    if (isNaN(id)) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });

    await db.delete(categories).where(eq(categories.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al eliminar la categoría' }), { status: 500 });
  }
};
