import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { products } from '../../../../db/schema';
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const subcategoryIdStr = formData.get('subcategoryId')?.toString();
    const sku = formData.get('sku')?.toString() || '';
    const brand = formData.get('brand')?.toString() || '';
    const isAvailableStr = formData.get('isAvailable')?.toString();
    const imageFile = formData.get('image') as File | null;

    if (!name || !subcategoryIdStr) {
      return new Response(JSON.stringify({ error: 'El nombre y la subcategoría son obligatorios' }), { status: 400 });
    }
    
    const subcategoryId = parseInt(subcategoryIdStr, 10);
    if (isNaN(subcategoryId)) {
      return new Response(JSON.stringify({ error: 'Subcategoría inválida' }), { status: 400 });
    }

    const isAvailable = isAvailableStr === 'true';

    let imageUrl = '';
    
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'heatfactory/productos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      
      imageUrl = (uploadResult as any).secure_url;
    }

    const slug = generateSlug(name) + '-' + Math.floor(Math.random() * 10000); // To avoid exact slug duplicates on products
    
    await db.insert(products).values({
      name,
      slug,
      subcategoryId,
      sku,
      brand,
      isAvailable,
      imageUrl: imageUrl || '/placeholder.png',
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en API /admin/productos:", error);
    return new Response(JSON.stringify({ error: error?.message || 'Hubo un error al crear el producto.' }), { status: 500 });
  }
};
