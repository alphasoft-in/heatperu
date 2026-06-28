import { d as db, p as products } from './index_DB2r2R9w.mjs';
import { v2 } from 'cloudinary';

v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
function generateSlug(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
const POST = async ({ request }) => {
  try {
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
    let imageUrl = "";
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
    const slug = generateSlug(name) + "-" + Math.floor(Math.random() * 1e4);
    await db.insert(products).values({
      name,
      slug,
      subcategoryId,
      sku,
      brand,
      isAvailable,
      imageUrl: imageUrl || "/placeholder.png"
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/productos:", error);
    return new Response(JSON.stringify({ error: error?.message || "Hubo un error al crear el producto." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
