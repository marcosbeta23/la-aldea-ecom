// app/api/quote-request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuoteRequestSchema } from '@/lib/validators';
import { supabaseAdmin } from '@/lib/supabase';
import rateLimit from '@/lib/rate-limit';
import { quoteRatelimit, getClientIp } from '@/lib/redis';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  // Rate limiting - 3 requests per minute per IP
  const ip = getClientIp(request);

  // Prefer Upstash distributed rate limiter; fall back to in-memory LRU
  if (quoteRatelimit) {
    const { success } = await quoteRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Esperá un momento.' },
        { status: 429 }
      );
    }
  } else {
    try {
      await limiter.check(3, ip); // 3 requests per minute
    } catch {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Esperá un momento.' },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validation = QuoteRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, message, category } = validation.data;

    // Store in database
    const { data: quote, error } = await (supabaseAdmin as any)
      .from('quote_requests')
      .insert({
        name,
        email,
        phone,
        message,
        category: category || 'general',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, just log and continue
      console.error('Quote request insert error:', error);
      
      // Still send email notification even if DB fails
    }

    // Send email notification to admin
    try {
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      const FROM_EMAIL = process.env.FROM_EMAIL;
      const FROM_NAME = process.env.FROM_NAME || 'La Aldea';

      if (BREVO_API_KEY && ADMIN_EMAIL && FROM_EMAIL) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email: ADMIN_EMAIL }],
            subject: `Nueva consulta de ${name}`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #166534;">Nueva Consulta - La Aldea</h2>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Nombre:</strong> ${name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p><strong>Teléfono:</strong> <a href="tel:${phone}">${phone}</a></p>
                  <p><strong>Categoría:</strong> ${category || 'General'}</p>
                </div>
                
                <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h3 style="margin-top: 0;">Mensaje:</h3>
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                  Recibido: ${new Date().toLocaleString('es-UY')}
                </p>
              </div>
            `,
          }),
        });
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    // Auto-reply to customer
    try {
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      const FROM_EMAIL = process.env.FROM_EMAIL;
      const FROM_NAME = process.env.FROM_NAME || 'La Aldea';

      if (BREVO_API_KEY && FROM_EMAIL) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email, name }],
            subject: 'Recibimos tu consulta - La Aldea',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #166534;">¡Gracias por contactarnos!</h2>
                
                <p>Hola ${name},</p>
                
                <p>Recibimos tu consulta y te responderemos a la brevedad.</p>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #334155;">Tu mensaje:</h3>
                  <p style="white-space: pre-wrap; color: #64748b;">${message}</p>
                </div>
                
                <p>Mientras tanto, podés:</p>
                <ul>
                  <li><a href="https://laaldeatala.com.uy/productos">Ver nuestros productos</a></li>
                  <li><a href="https://laaldeatala.com.uy/faq">Consultar preguntas frecuentes</a></li>
                </ul>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                
                <p style="color: #64748b; font-size: 14px;">
                  <strong>La Aldea</strong><br />
                  Tala, Canelones, Uruguay<br />
                  <a href="https://laaldeatala.com.uy">laaldeatala.com.uy</a>
                </p>
              </div>
            `,
          }),
        });
      }
    } catch (autoReplyError) {
      console.error('Auto-reply error:', autoReplyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Consulta enviada correctamente. Te responderemos a la brevedad.',
      id: quote?.id,
    });
  } catch (error) {
    console.error('Quote request error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
