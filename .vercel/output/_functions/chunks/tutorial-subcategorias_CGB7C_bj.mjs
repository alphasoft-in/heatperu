import { d as db, g as tutorialSubcategories } from './index_B4lP7dzv.mjs';

function generateSlug(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, categoryId } = body;
    if (!name || !categoryId) {
      return new Response(JSON.stringify({ error: "Nombre y categoría son obligatorios" }), { status: 400 });
    }
    const slug = generateSlug(name);
    await db.insert(tutorialSubcategories).values({
      name,
      slug,
      categoryId: Number(categoryId)
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API /admin/tutorial-subcategorias:", error);
    if (error?.code === "23505") {
      return new Response(JSON.stringify({ error: "Ya existe una subcategoría con este nombre." }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: error?.message || "Error al crear la subcategoría." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
