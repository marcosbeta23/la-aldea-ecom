import { Section, Text, Link } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface StatusUpdateProps {
  orderNumber: string;
  customerName: string;
  newStatus: string;
  total: number;
  trackingNumber?: string;
  reviewUrl?: string;
}

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

const STATUS_CONFIG: Record<string, { title: string; emoji: string; message: string; color: string }> = {
  paid: {
    title: 'Pago Confirmado',
    emoji: '\u2705',
    message: 'Tu pago ha sido confirmado y estamos preparando tu pedido.',
    color: '#22c55e',
  },
  processing: {
    title: 'Preparando tu Pedido',
    emoji: '\uD83D\uDCE6',
    message: 'Estamos preparando tu pedido para envio.',
    color: '#3b82f6',
  },
  shipped: {
    title: 'Tu Pedido esta en Camino!',
    emoji: '\uD83D\uDE9A',
    message: 'Tu pedido ha sido enviado y pronto llegara a destino.',
    color: '#8b5cf6',
  },
  delivered: {
    title: 'Pedido Entregado!',
    emoji: '\uD83C\uDF89',
    message: 'Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.',
    color: '#22c55e',
  },
  refunded: {
    title: 'Reembolso Procesado',
    emoji: '\uD83D\uDCB8',
    message: 'Tu reembolso ha sido procesado. El monto se acreditara en tu cuenta en los proximos dias.',
    color: '#f59e0b',
  },
};

export default function StatusUpdate({
  orderNumber,
  customerName,
  newStatus,
  total,
  trackingNumber,
  reviewUrl,
}: StatusUpdateProps) {
  const config = STATUS_CONFIG[newStatus];
  if (!config) return null;

  const message = newStatus === 'shipped' && trackingNumber
    ? `Tu pedido ha sido enviado. Numero de seguimiento: ${trackingNumber}`
    : config.message;

  const isDelivered = newStatus === 'delivered';

  return (
    <Layout preview={`${config.emoji} ${config.title} - Pedido ${orderNumber}`}>
      {/* Icon + Title */}
      <Section style={{ textAlign: 'center' as const, padding: '20px' }}>
        <Text style={{ fontSize: '48px', margin: '0 0 16px 0' }}>{config.emoji}</Text>
        <Text style={greeting}>Hola {customerName},</Text>
        <Text style={title}>{config.title}</Text>
        <Text style={subtitle}>{message}</Text>
      </Section>

      {/* Order Info */}
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Pedido:</strong> {orderNumber}
        </Text>
        <Text style={infoText}>
          <strong>Total:</strong> {formatPrice(total)}
        </Text>
      </Section>

      {/* Google Review CTA — only shown on delivery */}
      {isDelivered && reviewUrl && (
        <Section style={reviewSection}>
          <Text style={reviewTitle}>Te gusto tu compra?</Text>
          <Text style={reviewText}>
            Tu opinion nos ayuda a seguir mejorando. Dejanos una resena en Google, solo te toma 1 minuto!
          </Text>
          <Link href={reviewUrl} style={reviewButton}>
            Dejar una Resena en Google
          </Link>
        </Section>
      )}

      {/* CTA */}
      <Section style={ctaSection}>
        <Link
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Consulto por mi pedido ${orderNumber}`)}`}
          style={whatsappButton}
        >
          Consultas? Escribinos
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const greeting: React.CSSProperties = { color: '#475569', margin: '0 0 4px 0', fontSize: '16px' };
const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' };
const subtitle: React.CSSProperties = { color: '#64748b', margin: '0 0 24px 0', fontSize: '16px' };

const infoBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', textAlign: 'center' as const };
const infoText: React.CSSProperties = { color: '#475569', margin: '4px 0', fontSize: '14px' };

const reviewSection: React.CSSProperties = { marginTop: '24px', backgroundColor: '#fffbeb', borderRadius: '12px', padding: '24px', textAlign: 'center' as const };
const reviewTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' };
const reviewText: React.CSSProperties = { color: '#64748b', margin: '0 0 16px 0', fontSize: '14px' };
const reviewButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#4285f4', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };

const ctaSection: React.CSSProperties = { marginTop: '32px', textAlign: 'center' as const };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
