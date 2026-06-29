import { d as db, p as products } from './index_B4lP7dzv.mjs';
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
    const model = formData.get("model")?.toString() || null;
    const description = formData.get("description")?.toString() || null;
    const isAvailableStr = formData.get("isAvailable")?.toString();
    const imageFile = formData.get("image");
    const galleryFiles = formData.getAll("gallery");
    const pdfFile = formData.get("pdf");
    const existingGalleryStr = formData.get("existingGallery")?.toString() || "[]";
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
    const galleryUrls = JSON.parse(existingGalleryStr);
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = v2.uploader.upload_stream(
            { folder: "heatfactory/productos/galeria" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
        galleryUrls.push(uploadResult.secure_url);
      }
    }
    let pdfUrl = void 0;
    if (pdfFile && pdfFile.size > 0) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const dataUri = `data:${pdfFile.type || "application/pdf"};base64,${base64Data}`;
      const pdfName = pdfFile.name ? pdfFile.name.replace(/\.[^/.]+$/, "") : "ficha_tecnica";
      const safeName = pdfName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const publicId = `${safeName}_${Date.now()}.pdf`;
      const uploadResult = await v2.uploader.upload(dataUri, {
        folder: "heatfactory/productos/fichas",
        resource_type: "raw",
        public_id: publicId
      });
      pdfUrl = uploadResult.secure_url;
    }
    const slug = generateSlug(name) + "-" + Math.floor(Math.random() * 1e3);
    const updateData = { name, slug, subcategoryId, sku, brand, model, description, isAvailable };
    if (imageUrl) updateData.imageUrl = imageUrl;
    updateData.galleryUrls = JSON.stringify(galleryUrls);
    if (pdfUrl !== void 0) updateData.pdfUrl = pdfUrl;
    await db.update(products).set(updateData).where(eq(products.id, id));
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
