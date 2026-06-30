import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { tutorials } from '../../../db/schema';
import { desc, asc } from 'drizzle-orm';

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, ""); // remove leading/trailing dashes
}

export const GET: APIRoute = async () => {
  try {
    const allTutorials = await db.select().from(tutorials).orderBy(asc(tutorials.order), desc(tutorials.id));
    return new Response(JSON.stringify(allTutorials), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener tutoriales' }), { status: 500 });
  }
};

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const videoUrl = formData.get('videoUrl')?.toString() || '';
    const executionDate = formData.get('executionDate')?.toString() || null;
    const orderStr = formData.get('order')?.toString();
    const categoryIdStr = formData.get('categoryId')?.toString();
    const imageFile = formData.get('image') as File | null;

    let imageUrl = 'https://placehold.co/600x400/eeeeee/999999?text=Tutorial';

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
      imageUrl = (uploadResult as any).secure_url;
    }

    const newTutorial = await db.insert(tutorials).values({
      title,
      slug: createSlug(title),
      description,
      videoUrl,
      imageUrl,
      executionDate,
      categoryId: categoryIdStr ? parseInt(categoryIdStr, 10) : null,
      order: orderStr ? parseInt(orderStr, 10) : 0
    }).returning();
    
    return new Response(JSON.stringify(newTutorial[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al crear tutorial' }), { status: 500 });
  }
};
