import { d as db, s as subcategories } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';
import { v2 } from 'cloudinary';

v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
function generateSlug(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
const PUT = async ({ params, request }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const categoryIdStr = formData.get("categoryId")?.toString();
    const imageFile = formData.get("image");
    if (!name || !categoryIdStr) {
      return new Response(JSON.stringify({ error: "El nombre y la categoría padre son obligatorios" }), { status: 400 });
    }
    const categoryId = parseInt(categoryIdStr, 10);
    if (isNaN(categoryId)) {
      return new Response(JSON.stringify({ error: "Categoría padre inválida" }), { status: 400 });
    }
    let imageUrl;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder: "heatfactory/subcategorias" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }
    const slug = generateSlug(name);
    if (imageUrl) {
      await db.update(subcategories).set({ name, slug, categoryId, imageUrl }).where(eq(subcategories.id, id));
    } else {
      await db.update(subcategories).set({ name, slug, categoryId }).where(eq(subcategories.id, id));
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar subcategoría:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al actualizar la subcategoría" }), { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    await db.delete(subcategories).where(eq(subcategories.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al eliminar subcategoría:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al eliminar la subcategoría" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
