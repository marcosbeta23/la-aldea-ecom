// inngest/functions/bank-transfer-reminder.ts
// Sends a 24h reminder email for unpaid bank transfer orders
import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export const bankTransferReminder = inngest.createFunction(
  { id: 'bank-transfer-reminder', name: 'Bank Transfer Reminder' },
  { event: 'order/transfer.created' },
  async ({ event, step }) => {
    const { orderId, orderNumber, customerEmail, customerName, total, currency } = event.data;

    // Wait 24 hours
    await step.sleep('wait-24h', '24h');

    // Check if still unpaid
    const stillPending = await step.run('check-payment-status', async () => {
      const { data } = await (supabaseAdmin as any)
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      return data?.status === 'pending';
    });

    if (!stillPending) return { skipped: 'already paid or cancelled' };

    await step.run('send-reminder-email', async () => {
      if (!customerEmail) return;

      const accountDetails = process.env.BANK_ACCOUNT_DETAILS || '';
      const orderUrl = `https://laaldeatala.com.uy/pedido/${orderId}`;

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">Recordatorio de Transferencia</h2>
          <p>Hola ${customerName},</p>
          <p>Tu pedido <strong>#${orderNumber}</strong> por <strong>${currency} ${total.toLocaleString('es-UY')}</strong> todavía está pendiente de pago.</p>
          <p>Si ya realizaste la transferencia, por favor ignorá este mensaje — la verificación puede demorar algunas horas.</p>
          ${accountDetails ? `<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;"><strong>Datos bancarios:</strong><br/>${accountDetails.replace(/\n/g, '<br/>')}</div>` : ''}
          <p><a href="${orderUrl}" style="color: #1e40af;">Ver estado de tu pedido</a></p>
          <p style="color: #64748b; font-size: 14px;">Recordá que los pedidos se cancelan automáticamente después de 48 horas sin pago.</p>
          <p>Saludos,<br/>La Aldea</p>
        </div>
      `.trim();

      await sendEmail({
        to: customerEmail,
        toName: customerName,
        subject: `Recordatorio: Tu pedido #${orderNumber} espera tu transferencia`,
        htmlContent,
      });
    });

    return { sent: true, orderId };
  }
);
