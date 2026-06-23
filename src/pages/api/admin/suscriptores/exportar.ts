import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { subscribers } from '../../../../db/schema';
import { desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const allSubscribers = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));

    // Crear contenido CSV
    const csvHeader = 'ID,Email,Estado,Fecha de Suscripción\n';
    const csvRows = allSubscribers.map(sub => {
      const date = new Date(sub.createdAt).toLocaleString('es-PE', { timeZone: 'America/Lima' });
      // Escapar comas en los datos por si acaso
      return `${sub.id},"${sub.email}",${sub.status},"${date}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="suscriptores_boletin.csv"'
      }
    });
  } catch (error) {
    console.error('Error exportando suscriptores:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
