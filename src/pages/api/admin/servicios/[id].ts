import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { services } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const orderStr = formData.get('order')?.toString();
    const imageFile = formData.get('image') as File | null;

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'El título y la descripción son obligatorios' }), { status: 400 });
    }

    const order = orderStr ? parseInt(orderStr, 10) : 0;

    const updateData: any = {
      title,
      description,
      order
    };

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'heatfactory/servicios' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      
      updateData.imageUrl = (uploadResult as any).secure_url;
    }

    await db.update(services).set(updateData).where(eq(services.id, id));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/servicios/[id] PUT:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al actualizar el servicio.' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
    }

    await db.delete(services).where(eq(services.id, id));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/servicios/[id] DELETE:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al eliminar el servicio.' }), { status: 500 });
  }
};
