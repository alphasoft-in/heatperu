import { d as db, p as products } from './index_DB2r2R9w.mjs';
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
    const subcategoryIdStr = formData.get("subcategoryId")?.toString();
    const sku = formData.get("sku")?.toString() || "";
    const brand = formData.get("brand")?.toString() || "";
    const isAvailableStr = formData.get("isAvailable")?.toString();
    const imageFile = formData.get("image");
    if (!name || !subcategoryIdStr) {
      return new Response(JSON.stringify({ error: "El nombre y la subcategoría son obligatorios" }), { status: 400 });
    }
    const subcategoryId = parseInt(subcategoryIdStr, 10);
    if (isNaN(subcategoryId)) {
      return new Response(JSON.stringify({ error: "Subcategoría inválida" }), { status: 400 });
    }
    const isAvailable = isAvailableStr === "true";
    let imageUrl;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder: "heatfactory/productos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }
    const slug = generateSlug(name) + "-" + Math.floor(Math.random() * 1e3);
    if (imageUrl) {
      await db.update(products).set({ name, slug, subcategoryId, sku, brand, isAvailable, imageUrl }).where(eq(products.id, id));
    } else {
      await db.update(products).set({ name, slug, subcategoryId, sku, brand, isAvailable }).where(eq(products.id, id));
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al actualizar el producto" }), { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    await db.delete(products).where(eq(products.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al eliminar el producto" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
