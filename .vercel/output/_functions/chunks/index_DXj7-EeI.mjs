import { d as db, p as products } from './index_B4lP7dzv.mjs';
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
    const model = formData.get("model")?.toString() || null;
    const description = formData.get("description")?.toString() || null;
    const isAvailableStr = formData.get("isAvailable")?.toString();
    const imageFile = formData.get("image");
    const galleryFiles = formData.getAll("gallery");
    const pdfFile = formData.get("pdf");
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
    const galleryUrls = [];
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
    let pdfUrl = null;
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
    const slug = generateSlug(name) + "-" + Math.floor(Math.random() * 1e4);
    await db.insert(products).values({
      name,
      slug,
      subcategoryId,
      sku,
      brand,
      model,
      description,
      isAvailable,
      imageUrl: imageUrl || "/placeholder.png",
      galleryUrls: JSON.stringify(galleryUrls),
      pdfUrl
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
