import { Section, Text, Link, Row, Column } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  orderId: string;
  appUrl?: string;
  reviewUrl?: string;
}

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderConfirmation({
  orderNumber,
  createdAt,
  status,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  subtotal,
  discountAmount,
  total,
  orderId,
  appUrl = 'https://laaldeatala.com.uy',
  reviewUrl,
}: OrderConfirmationProps) {
  const isPaid = status === 'paid' || status === 'invoiced' || status === 'paid_pending_verification';

  return (
    <Layout preview={`Pedido ${orderNumber} confirmado - ${formatPrice(total)}`}>
      <Text style={greeting}>Hola {customerName},</Text>
      <Text style={title}>Gracias por tu compra!</Text>
      <Text style={subtitle}>Recibimos tu pedido y lo estamos preparando para vos.</Text>

      {/* Order Info Box */}
      <Section style={infoBox}>
        <Row>
          <Column>
            <Text style={infoLabel}>Numero de pedido:</Text>
          </Column>
          <Column align="right">
            <Text style={infoValue}>{orderNumber}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={infoLabel}>Fecha:</Text>
          </Column>
          <Column align="right">
            <Text style={infoText}>{formatDate(createdAt)}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={infoLabel}>Estado:</Text>
          </Column>
          <Column align="right">
            <Text style={isPaid ? statusPaid : statusPending}>
              {isPaid ? 'Pago Recibido' : 'Pendiente'}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Products */}
      <Text style={sectionTitle}>Productos</Text>
      <Section>
        {/* Header */}
        <Row style={tableHeader}>
          <Column style={{ width: '50%' }}>
            <Text style={tableHeaderText}>Producto</Text>
          </Column>
          <Column style={{ width: '15%' }} align="center">
            <Text style={tableHeaderText}>Cant.</Text>
          </Column>
          <Column style={{ width: '17%' }} align="right">
            <Text style={tableHeaderText}>Precio</Text>
          </Column>
          <Column style={{ width: '18%' }} align="right">
            <Text style={tableHeaderText}>Subtotal</Text>
          </Column>
        </Row>
        {/* Items */}
        {items.map((item, i) => (
          <Row key={i} style={tableRow}>
            <Column style={{ width: '50%' }}>
              <Text style={tableCellText}>{item.product_name}</Text>
            </Column>
            <Column style={{ width: '15%' }} align="center">
              <Text style={tableCellText}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '17%' }} align="right">
              <Text style={tableCellText}>{formatPrice(item.unit_price)}</Text>
            </Column>
            <Column style={{ width: '18%' }} align="right">
              <Text style={tableCellText}>{formatPrice(item.subtotal)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Totals */}
      <Section style={totalsBox}>
        {discountAmount > 0 && (
          <>
            <Row>
              <Column>
                <Text style={totalsLabel}>Subtotal:</Text>
              </Column>
              <Column align="right">
                <Text style={totalsValue}>{formatPrice(subtotal)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={discountLabel}>Descuento:</Text>
              </Column>
              <Column align="right">
                <Text style={discountValue}>-{formatPrice(discountAmount)}</Text>
              </Column>
            </Row>
          </>
        )}
        <Row>
          <Column>
            <Text style={totalLabel}>Total:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{formatPrice(total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Info */}
      <Section style={customerBox}>
        <Text style={customerTitle}>Datos del cliente</Text>
        <Text style={customerText}><strong>Nombre:</strong> {customerName}</Text>
        <Text style={customerText}><strong>Email:</strong> {customerEmail}</Text>
        {customerPhone && <Text style={customerText}><strong>Telefono:</strong> {customerPhone}</Text>}
        {shippingAddress && <Text style={customerText}><strong>Direccion:</strong> {shippingAddress}</Text>}
      </Section>

      {/* Google Review CTA */}
      {reviewUrl && (
        <Section style={reviewSection}>
          <Text style={reviewTitle}>Te gusto tu compra?</Text>
          <Text style={reviewText}>
            Tu opinion nos ayuda a crecer. Dejanos una resena en Google, solo te toma 1 minuto!
          </Text>
          <Link href={reviewUrl} style={reviewButton}>
            Dejar una Resena en Google
          </Link>
        </Section>
      )}

      {/* CTAs */}
      <Section style={ctaSection}>
        <Link href={`${appUrl}/gracias?order_id=${orderId}`} style={ctaButton}>
          Ver Comprobante de Compra
        </Link>
        <Text style={ctaText}>Tenes alguna consulta sobre tu pedido?</Text>
        <Link
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Consulto por mi pedido ${orderNumber}`)}`}
          style={whatsappButton}
        >
          Escribinos por WhatsApp
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const greeting: React.CSSProperties = { color: '#475569', margin: '0 0 4px 0', fontSize: '16px' };
const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' };
const subtitle: React.CSSProperties = { color: '#64748b', margin: '0 0 24px 0' };
const sectionTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' };

const infoBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px' };
const infoLabel: React.CSSProperties = { color: '#64748b', margin: '4px 0', fontSize: '14px' };
const infoValue: React.CSSProperties = { color: '#0f172a', fontWeight: 'bold', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const infoText: React.CSSProperties = { color: '#0f172a', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const statusPaid: React.CSSProperties = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline', textAlign: 'right' as const };
const statusPending: React.CSSProperties = { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline', textAlign: 'right' as const };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9', marginBottom: '0' };
const tableHeaderText: React.CSSProperties = { padding: '12px', color: '#475569', fontSize: '12px', textTransform: 'uppercase' as const, margin: '0' };
const tableRow: React.CSSProperties = { borderBottom: '1px solid #e2e8f0' };
const tableCellText: React.CSSProperties = { padding: '12px', margin: '0', fontSize: '14px', color: '#334155' };

const totalsBox: React.CSSProperties = { backgroundColor: '#0f172a', borderRadius: '12px', padding: '20px', color: '#ffffff', marginTop: '24px' };
const totalsLabel: React.CSSProperties = { color: '#94a3b8', margin: '4px 0', fontSize: '14px' };
const totalsValue: React.CSSProperties = { color: '#ffffff', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const discountLabel: React.CSSProperties = { color: '#4ade80', margin: '4px 0', fontSize: '14px' };
const discountValue: React.CSSProperties = { color: '#4ade80', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const totalLabel: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#ffffff' };
const totalValue: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0', textAlign: 'right' as const, color: '#ffffff' };

const customerBox: React.CSSProperties = { marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' };
const customerTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' };
const customerText: React.CSSProperties = { color: '#475569', margin: '4px 0', fontSize: '14px' };

const ctaSection: React.CSSProperties = { marginTop: '32px', textAlign: 'center' as const };
const ctaButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#3b82f6', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
const ctaText: React.CSSProperties = { color: '#64748b', margin: '16px 0', fontSize: '14px' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };

const reviewSection: React.CSSProperties = { marginTop: '24px', backgroundColor: '#fffbeb', borderRadius: '12px', padding: '24px', textAlign: 'center' as const };
const reviewTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' };
const reviewText: React.CSSProperties = { color: '#64748b', margin: '0 0 16px 0', fontSize: '14px' };
const reviewButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#4285f4', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
