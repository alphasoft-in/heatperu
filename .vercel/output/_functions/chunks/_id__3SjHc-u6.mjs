import { d as db, t as tutorialCategories } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';

const DELETE = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!id) return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    await db.delete(tutorialCategories).where(eq(tutorialCategories.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al eliminar categoría de tutorial:", error);
    return new Response(JSON.stringify({ error: error?.message || "Error al eliminar" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
