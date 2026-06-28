import { d as db, f as subscribers } from './index_DB2r2R9w.mjs';
import { desc } from 'drizzle-orm';

const GET = async () => {
  try {
    const allSubscribers = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
    const csvHeader = "ID,Email,Estado,Fecha de Suscripción\n";
    const csvRows = allSubscribers.map((sub) => {
      const date = new Date(sub.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" });
      return `${sub.id},"${sub.email}",${sub.status},"${date}"`;
    }).join("\n");
    const csvContent = csvHeader + csvRows;
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="suscriptores_boletin.csv"'
      }
    });
  } catch (error) {
    console.error("Error exportando suscriptores:", error);
    return new Response(JSON.stringify({ success: false, message: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
