import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { categories } from '../../../db/schema';
import { v2 as cloudinary } from 'cloudinary';

// Configuramos Cloudinary con las variables de entorno
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const imageFile = formData.get('image') as File | null;

    if (!name) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { status: 400 });
    }
    
    let imageUrl = '';
    
    // Si hay una imagen, la subimos a Cloudinary
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
    
    // Guardamos en Neon DB
    await db.insert(categories).values({
      name,
      slug,
      imageUrl: imageUrl || '/placeholder.avif',
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/categorias:", error);
    if (error?.code === '23505') {
      return new Response(JSON.stringify({ error: 'Ya existe una categoría con este nombre.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: error?.message || 'Hubo un error al crear la categoría.' }), { status: 500 });
  }
};
