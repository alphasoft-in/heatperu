import type { APIRoute } from 'astro';
import { db } from '../../db';
import { complaints } from '../../db/schema';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Insert into database
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
      consumerRequest: data.consumerRequest,
    }).returning();

    // Send email using Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"HeatPeru" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: data.email,
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
        `,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Reclamo registrado exitosamente',
      id: newComplaint.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error processing complaint:', error);
    return new Response(JSON.stringify({ success: false, message: 'Hubo un error al procesar el reclamo' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
