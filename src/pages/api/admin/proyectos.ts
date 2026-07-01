import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projects } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, ""); // remove leading/trailing dashes
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const orderStr = formData.get('order')?.toString();
    const executionDate = formData.get('executionDate')?.toString() || null;
    const galleryFiles = formData.getAll('gallery') as File[];
    const galleryOrderStr = formData.get('galleryOrder')?.toString();

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'El título y la descripción son obligatorios' }), { status: 400 });
    }
    
    let uploadedUrls: string[] = [];
    
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'heatfactory/proyectos' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          
          uploadedUrls.push((uploadResult as any).secure_url);
        }
      }
    }

    let finalGallery: string[] = [];
    if (galleryOrderStr) {
      const galleryOrder = JSON.parse(galleryOrderStr);
      let newFileIndex = 0;
      finalGallery = galleryOrder.map((item: string) => {
        if (item === 'NEW') {
          return uploadedUrls[newFileIndex++];
        }
        return item;
      }).filter(Boolean);
    } else {
      finalGallery = uploadedUrls;
    }

    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const imageUrl = finalGallery.length > 0 ? finalGallery[0] : '/placeholder.png';

    await db.insert(projects).values({
      title,
      slug: createSlug(title),
      description,
      order,
      executionDate,
      gallery: JSON.stringify(finalGallery),
      imageUrl,
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/proyectos:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Hubo un error al crear el proyecto.' }), { status: 500 });
  }
};
