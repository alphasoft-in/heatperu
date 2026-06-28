import { d as db, e as services } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';
import { v2 } from 'cloudinary';

v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
const PUT = async ({ params, request }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const orderStr = formData.get("order")?.toString();
    const imageFile = formData.get("image");
    if (!title || !description) {
      return new Response(JSON.stringify({ error: "El título y la descripción son obligatorios" }), { status: 400 });
    }
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const updateData = {
      title,
      description,
      order
    };
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
      updateData.imageUrl = uploadResult.secure_url;
    }
    await db.update(services).set(updateData).where(eq(services.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/servicios/[id] PUT:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al actualizar el servicio." }), { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }
    await db.delete(services).where(eq(services.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/servicios/[id] DELETE:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al eliminar el servicio." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
