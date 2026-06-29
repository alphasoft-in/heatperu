import { d as db, e as services } from './index_B4lP7dzv.mjs';
import { v2 } from 'cloudinary';

v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const orderStr = formData.get("order")?.toString();
    const imageFile = formData.get("image");
    if (!title || !description) {
      return new Response(JSON.stringify({ error: "El título y la descripción son obligatorios" }), { status: 400 });
    }
    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder: "heatfactory/servicios" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    await db.insert(services).values({
      title,
      description,
      order,
      imageUrl: imageUrl || "/placeholder.png"
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/servicios:", error);
    return new Response(JSON.stringify({ error: error?.message || "Hubo un error al crear el servicio." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
