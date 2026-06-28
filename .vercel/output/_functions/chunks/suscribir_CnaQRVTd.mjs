import { d as db, f as subscribers } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const { email } = data;
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ success: false, message: "Correo electrónico inválido" }), { status: 400 });
    }
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email));
    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: true, message: "¡Ya estabas suscrito!" }), { status: 200 });
    }
    await db.insert(subscribers).values({
      email,
      status: "Activo"
    });
    return new Response(JSON.stringify({ success: true, message: "¡Suscripción exitosa!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al suscribir:", error);
    return new Response(JSON.stringify({ success: false, message: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
