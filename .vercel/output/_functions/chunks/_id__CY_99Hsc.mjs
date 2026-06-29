import { d as db, b as complaints } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';

const PUT = async ({ request, params }) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: "ID inválido" }), { status: 400 });
    }
    const data = await request.json();
    await db.update(complaints).set({ status: data.status }).where(eq(complaints.id, id));
    return new Response(JSON.stringify({ success: true, message: "Estado actualizado exitosamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return new Response(JSON.stringify({ success: false, message: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
