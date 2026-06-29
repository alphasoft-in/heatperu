import { d as db, c as categories } from './index_B4lP7dzv.mjs';
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
    const imageFile = formData.get("image");
    if (!name) {
      return new Response(JSON.stringify({ error: "El nombre es obligatorio" }), { status: 400 });
    }
    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder: "heatfactory/categorias" },
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
    await db.insert(categories).values({
      name,
      slug,
      imageUrl: imageUrl || "/placeholder.png"
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/categorias:", error);
    if (error?.code === "23505") {
      return new Response(JSON.stringify({ error: "Ya existe una categoría con este nombre." }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: error?.message || "Hubo un error al crear la categoría." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
