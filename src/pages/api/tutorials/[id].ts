import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { tutorials } from '../../../db/schema';
import { eq } from 'drizzle-orm';

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, ""); // remove leading/trailing dashes
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const PUT: APIRoute = async ({ request, params }) => {
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const videoUrl = formData.get('videoUrl')?.toString() || '';
    const executionDate = formData.get('executionDate')?.toString() || null;
    const orderStr = formData.get('order')?.toString();
    const imageFile = formData.get('image') as File | null;

    let updateData: any = {
      title,
      slug: createSlug(title),
      description,
      videoUrl,
      executionDate,
      order: orderStr ? parseInt(orderStr, 10) : 0
    };

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'heatfactory/tutoriales' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      updateData.imageUrl = (uploadResult as any).secure_url;
    }

    const updatedTutorial = await db.update(tutorials).set(updateData)
    .where(eq(tutorials.id, Number(id)))
    .returning();
    
    return new Response(JSON.stringify(updatedTutorial[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al actualizar tutorial' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  try {
    await db.delete(tutorials).where(eq(tutorials.id, Number(id)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar tutorial' }), { status: 500 });
  }
};
