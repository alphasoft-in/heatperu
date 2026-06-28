import { d as db, a as projects } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';
import { v2 } from 'cloudinary';

v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
function createSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
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
    const executionDate = formData.get("executionDate")?.toString() || null;
    const galleryFiles = formData.getAll("gallery");
    if (!title || !description) {
      return new Response(JSON.stringify({ error: "El título y la descripción son obligatorios" }), { status: 400 });
    }
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const updateData = {
      title,
      slug: createSlug(title),
      description,
      order,
      executionDate
    };
    let uploadedUrls = [];
    if (galleryFiles && galleryFiles.length > 0) {
      let hasValidFile = false;
      for (const file of galleryFiles) {
        if (file.size > 0) {
          hasValidFile = true;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = v2.uploader.upload_stream(
              { folder: "heatfactory/proyectos" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          uploadedUrls.push(uploadResult.secure_url);
        }
      }
      if (hasValidFile) {
        updateData.gallery = JSON.stringify(uploadedUrls);
        updateData.imageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : "/placeholder.png";
      }
    }
    await db.update(projects).set(updateData).where(eq(projects.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/proyectos/[id] PUT:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al actualizar el proyecto." }), { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }
    await db.delete(projects).where(eq(projects.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/proyectos/[id] DELETE:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al eliminar el proyecto." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
