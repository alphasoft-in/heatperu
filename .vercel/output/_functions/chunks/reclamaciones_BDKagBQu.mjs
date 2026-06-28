import { d as db, b as complaints } from './index_DB2r2R9w.mjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");
const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const [newComplaint] = await db.insert(complaints).values({
      consumerName: data.consumerName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      address: data.address,
      phone: data.phone,
      email: data.email,
      productType: data.productType,
      amount: data.amount,
      productDescription: data.productDescription,
      complaintType: data.complaintType,
      complaintDetail: data.complaintDetail,
      consumerRequest: data.consumerRequest
    }).returning();
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "HeatPeru <onboarding@resend.dev>",
        // Usar dominio de prueba para asegurar envío si no hay dominio verificado
        to: [data.email],
        subject: `Copia de su ${data.complaintType} - HeatPeru (Ticket #${newComplaint.id})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hola ${data.consumerName},</h2>
            <p>Hemos recibido su <strong>${data.complaintType}</strong> exitosamente. Su número de ticket es el <strong>#${newComplaint.id}</strong>.</p>
            <p>A continuación le adjuntamos una copia de los datos enviados:</p>
            <ul>
              <li><strong>Documento:</strong> ${data.documentType} ${data.documentNumber}</li>
              <li><strong>Teléfono:</strong> ${data.phone}</li>
              <li><strong>Bien Contratado:</strong> ${data.productType} - ${data.productDescription}</li>
              <li><strong>Monto Reclamado:</strong> S/ ${data.amount}</li>
              <li><strong>Detalle:</strong> ${data.complaintDetail}</li>
              <li><strong>Pedido:</strong> ${data.consumerRequest}</li>
            </ul>
            <p>Nos pondremos en contacto con usted a la brevedad posible.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">GRUPO EMPRESARIAL ZEVALLOS S.A.C.</p>
          </div>
        `
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Reclamo registrado exitosamente",
      id: newComplaint.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error processing complaint:", error);
    return new Response(JSON.stringify({ success: false, message: "Hubo un error al procesar el reclamo" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
