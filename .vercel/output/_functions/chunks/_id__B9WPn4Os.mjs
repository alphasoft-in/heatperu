import { d as db, h as tutorials } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';
import { v2 } from 'cloudinary';

function createSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
const PUT = async ({ request, params }) => {
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: "ID requerido" }), { status: 400 });
  try {
    const formData = await request.formData();
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const videoUrl = formData.get("videoUrl")?.toString() || "";
    const executionDate = formData.get("executionDate")?.toString() || null;
    const orderStr = formData.get("order")?.toString();
    const imageFile = formData.get("image");
    let updateData = {
      title,
      slug: createSlug(title),
      description,
      videoUrl,
      executionDate,
      order: orderStr ? parseInt(orderStr, 10) : 0
    };
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder: "heatfactory/tutoriales" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      updateData.imageUrl = uploadResult.secure_url;
    }
    const updatedTutorial = await db.update(tutorials).set(updateData).where(eq(tutorials.id, Number(id))).returning();
    return new Response(JSON.stringify(updatedTutorial[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al actualizar tutorial" }), { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: "ID requerido" }), { status: 400 });
  try {
    await db.delete(tutorials).where(eq(tutorials.id, Number(id)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al eliminar tutorial" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
