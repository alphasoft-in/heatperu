import { d as db, h as tutorials } from './index_B4lP7dzv.mjs';
import { asc, desc } from 'drizzle-orm';
import { v2 } from 'cloudinary';

function createSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
const GET = async () => {
  try {
    const allTutorials = await db.select().from(tutorials).orderBy(asc(tutorials.order), desc(tutorials.id));
    return new Response(JSON.stringify(allTutorials), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al obtener tutoriales" }), { status: 500 });
  }
};
v2.config({
  cloud_name: "driafbrd9",
  api_key: "246957645472286",
  api_secret: "OZOYBFN4w-ydJdBKVlwkXBt8TH4"
});
const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const videoUrl = formData.get("videoUrl")?.toString() || "";
    const executionDate = formData.get("executionDate")?.toString() || null;
    const orderStr = formData.get("order")?.toString();
    const imageFile = formData.get("image");
    let imageUrl = "https://placehold.co/600x400/eeeeee/999999?text=Tutorial";
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
      imageUrl = uploadResult.secure_url;
    }
    const newTutorial = await db.insert(tutorials).values({
      title,
      slug: createSlug(title),
      description,
      videoUrl,
      imageUrl,
      executionDate,
      order: orderStr ? parseInt(orderStr, 10) : 0
    }).returning();
    return new Response(JSON.stringify(newTutorial[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al crear tutorial" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
