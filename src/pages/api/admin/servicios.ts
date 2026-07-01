import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { services } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const orderStr = formData.get('order')?.toString();
    const imageFile = formData.get('image') as File | null;

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'El título y la descripción son obligatorios' }), { status: 400 });
    }
    
    let imageUrl = '';
    
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
      
      imageUrl = (uploadResult as any).secure_url;
    }

    const order = orderStr ? parseInt(orderStr, 10) : 0;

    await db.insert(services).values({
      title,
      description,
      order,
      imageUrl: imageUrl || '/placeholder.avif',
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/servicios:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Hubo un error al crear el servicio.' }), { status: 500 });
  }
};
