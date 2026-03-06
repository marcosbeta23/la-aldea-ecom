import { Section, Text, Link, Row, Column } from '@react-email/components';
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

const STATUS_CONFIG: Record<string, {
  title: string;
  emoji: string;
  message: string;
  color: string;
  bgColor: string;
  nextStep: string;
}> = {
  paid: {
    title: 'Pago Confirmado',
    emoji: '\u2705',
    message: 'Tu pago ha sido confirmado exitosamente. Estamos preparando tu pedido.',
    color: '#166534',
    bgColor: '#f0fdf4',
    nextStep: 'Vamos a preparar tu pedido y te avisaremos cuando este listo para envio.',
  },
  paid_pending_verification: {
    title: 'Pago en Verificacion',
    emoji: '\u23F3',
    message: 'Recibimos tu solicitud de pago y la estamos verificando. Te avisaremos cuando sea confirmado.',
    color: '#92400e',
    bgColor: '#fffbeb',
    nextStep: 'Una vez confirmado el pago, comenzaremos a preparar tu pedido.',
  },
  awaiting_stock: {
    title: 'Pedido en Espera de Stock',
    emoji: '\uD83D\uDCE6',
    message: 'Tu pago fue confirmado, pero algunos productos de tu pedido estan pendientes de reposicion de stock.',
    color: '#c2410c',
    bgColor: '#fff7ed',
    nextStep: 'Te notificaremos en cuanto tengamos el stock disponible y tu pedido este listo.',
  },
  ready_to_invoice: {
    title: 'Preparando tu Factura',
    emoji: '\uD83D\uDCC4',
    message: 'Tu pago fue confirmado y estamos preparando tu factura.',
    color: '#1e40af',
    bgColor: '#eff6ff',
    nextStep: 'En breve recibirás tu factura y te avisaremos cuando el pedido este listo.',
  },
  processing: {
    title: 'Preparando tu Pedido',
    emoji: '\uD83D\uDCE6',
    message: 'Tu pedido esta siendo preparado por nuestro equipo.',
    color: '#1e40af',
    bgColor: '#eff6ff',
    nextStep: 'Te enviaremos un aviso cuando tu pedido haya sido despachado.',
  },
  shipped: {
    title: 'Pedido en Camino',
    emoji: '\uD83D\uDE9A',
    message: 'Tu pedido ha sido enviado y esta en camino a tu direccion.',
    color: '#6d28d9',
    bgColor: '#f5f3ff',
    nextStep: 'Recibiras una notificacion cuando el pedido sea entregado.',
  },
  delivered: {
    title: 'Pedido Entregado',
    emoji: '\uD83C\uDF89',
    message: 'Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.',
    color: '#166534',
    bgColor: '#f0fdf4',
    nextStep: 'Si tenes alguna consulta sobre los productos, no dudes en escribirnos.',
  },
  refunded: {
    title: 'Reembolso Procesado',
    emoji: '\uD83D\uDCB8',
    message: 'Tu reembolso ha sido procesado. El monto se acreditara en tu cuenta en los proximos dias.',
    color: '#92400e',
    bgColor: '#fffbeb',
    nextStep: 'Si no ves el reembolso en 5-10 dias habiles, contactanos.',
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
      {/* Status Icon + Title */}
      <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
        <Text style={{ fontSize: '48px', margin: '0 0 8px 0' }}>{config.emoji}</Text>
        <Text style={greeting}>Hola {customerName},</Text>
        <Text style={title}>{config.title}</Text>
      </Section>

      {/* Status Message Box */}
      <Section style={{ ...statusBox, backgroundColor: config.bgColor, borderLeft: `4px solid ${config.color}` }}>
        <Text style={{ ...statusMessage, color: config.color }}>{message}</Text>
      </Section>

      {/* Order Details */}
      <Section style={infoBox}>
        <Row>
          <Column>
            <Text style={infoLabel}>Pedido</Text>
          </Column>
          <Column align="right">
            <Text style={infoValue}>{orderNumber}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={infoLabel}>Total</Text>
          </Column>
          <Column align="right">
            <Text style={infoValue}>{formatPrice(total)}</Text>
          </Column>
        </Row>
        {trackingNumber && (
          <Row>
            <Column>
              <Text style={infoLabel}>N. de seguimiento</Text>
            </Column>
            <Column align="right">
              <Text style={infoValue}>{trackingNumber}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Next Step */}
      <Section style={nextStepBox}>
        <Text style={nextStepTitle}>Que sigue?</Text>
        <Text style={nextStepText}>{config.nextStep}</Text>
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

      {/* Browse Store CTA for delivered orders */}
      {isDelivered && (
        <Section style={ctaSection}>
          <Link href="https://laaldeatala.com.uy/productos" style={browseButton}>
            Seguir Comprando
          </Link>
        </Section>
      )}

      {/* WhatsApp CTA */}
      <Section style={ctaSection}>
        <Link
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Consulto por mi pedido ${orderNumber}`)}`}
          style={whatsappButton}
        >
          Consultas? Escribinos por WhatsApp
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const greeting: React.CSSProperties = { color: '#475569', margin: '0 0 4px 0', fontSize: '16px' };
const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' };

const statusBox: React.CSSProperties = { borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' };
const statusMessage: React.CSSProperties = { margin: '0', fontSize: '15px', lineHeight: '1.5' };

const infoBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' };
const infoLabel: React.CSSProperties = { color: '#64748b', margin: '6px 0', fontSize: '14px' };
const infoValue: React.CSSProperties = { color: '#0f172a', fontWeight: '600', margin: '6px 0', fontSize: '14px', textAlign: 'right' as const };

const nextStepBox: React.CSSProperties = { marginTop: '24px', padding: '16px 20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' };
const nextStepTitle: React.CSSProperties = { color: '#1e40af', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700' };
const nextStepText: React.CSSProperties = { color: '#1e40af', margin: '0', fontSize: '14px', lineHeight: '1.5' };

const reviewSection: React.CSSProperties = { marginTop: '24px', backgroundColor: '#fffbeb', borderRadius: '12px', padding: '24px', textAlign: 'center' as const, border: '1px solid #fde68a' };
const reviewTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' };
const reviewText: React.CSSProperties = { color: '#64748b', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' };
const reviewButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#4285f4', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };

const ctaSection: React.CSSProperties = { marginTop: '20px', textAlign: 'center' as const };
const browseButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
