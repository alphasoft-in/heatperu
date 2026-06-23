import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { projects } from '../../../../db/schema';
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
    const executionDate = formData.get('executionDate')?.toString() || null;
    const galleryFiles = formData.getAll('gallery') as File[];

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'El título y la descripción son obligatorios' }), { status: 400 });
    }

    const order = orderStr ? parseInt(orderStr, 10) : 0;

    const updateData: any = {
      title,
      slug: createSlug(title),
      description,
      order,
      executionDate
    };

    let uploadedUrls: string[] = [];
    
    if (galleryFiles && galleryFiles.length > 0) {
      let hasValidFile = false;
      for (const file of galleryFiles) {
        if (file.size > 0) {
          hasValidFile = true;
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

      if (hasValidFile) {
        updateData.gallery = JSON.stringify(uploadedUrls);
        updateData.imageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : '/placeholder.png';
      }
    }

    await db.update(projects).set(updateData).where(eq(projects.id, id));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/proyectos/[id] PUT:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al actualizar el proyecto.' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
    }

    await db.delete(projects).where(eq(projects.id, id));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/proyectos/[id] DELETE:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Error al eliminar el proyecto.' }), { status: 500 });
  }
};
