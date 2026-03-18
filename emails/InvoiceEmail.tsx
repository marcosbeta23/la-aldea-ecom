import { Section, Text, Link, Row, Column, Hr } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface InvoiceEmailProps {
  orderNumber: string;
  customerName: string;
  invoiceNumber: string;
  invoiceType: 'consumer_final' | 'invoice_rut' | null;
  total: number;
  currency?: string;
  items: OrderItem[];
  invoiceFileUrl?: string;
  reviewUrl?: string;
}

function formatPrice(price: number, currency = 'UYU'): string {
  if (currency === 'USD') {
    return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

export default function InvoiceEmail({
  orderNumber,
  customerName,
  invoiceNumber,
  invoiceType,
  total,
  currency = 'UYU',
  items,
  invoiceFileUrl,
  reviewUrl,
}: InvoiceEmailProps) {
  const invoiceTypeName = invoiceType === 'invoice_rut'
    ? 'Factura con RUT'
    : 'Comprobante de Consumidor Final';

  return (
    <Layout preview={`Factura N\u00B0 ${invoiceNumber} - Pedido ${orderNumber}`}>
      {/* Badge */}
      <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
        <Text style={docBadge}>FACTURA</Text>
      </Section>

      <Text style={greeting}>Hola {customerName},</Text>
      <Text style={title}>Tu factura esta lista</Text>
      <Text style={subtitle}>Adjuntamos el comprobante fiscal de tu compra.</Text>

      {/* Invoice Info */}
      <Section style={invoiceBox}>
        <Row>
          <Column><Text style={invoiceLabel}>Tipo</Text></Column>
          <Column align="right"><Text style={invoiceValue}>{invoiceTypeName}</Text></Column>
        </Row>
        <Row>
          <Column><Text style={invoiceLabel}>Numero</Text></Column>
          <Column align="right"><Text style={invoiceValue}>{invoiceNumber}</Text></Column>
        </Row>
        <Row>
          <Column><Text style={invoiceLabel}>Pedido</Text></Column>
          <Column align="right"><Text style={invoiceText}>{orderNumber}</Text></Column>
        </Row>
        <Hr style={{ borderColor: '#86efac', margin: '8px 0' }} />
        <Row>
          <Column><Text style={invoiceTotalLabel}>Total</Text></Column>
          <Column align="right"><Text style={invoiceTotalValue}>{formatPrice(total, currency)}</Text></Column>
        </Row>
      </Section>

      {/* Download Button */}
      {invoiceFileUrl && (
        <Section style={ctaSection}>
          <Link href={invoiceFileUrl} style={downloadButton}>
            Descargar Factura PDF
          </Link>
        </Section>
      )}

      {/* Products Summary */}
      <Text style={sectionTitle}>Detalle de la compra</Text>
      <Section>
        <Row style={tableHeader}>
          <Column style={{ width: '55%' }}>
            <Text style={tableHeaderText}>Producto</Text>
          </Column>
          <Column style={{ width: '20%' }} align="center">
            <Text style={tableHeaderText}>Cant.</Text>
          </Column>
          <Column style={{ width: '25%' }} align="right">
            <Text style={tableHeaderText}>Subtotal</Text>
          </Column>
        </Row>
        {items.map((item, i) => (
          <Row key={i} style={i % 2 === 0 ? tableRowEven : tableRowOdd}>
            <Column style={{ width: '55%' }}>
              <Text style={cellText}>{item.product_name}</Text>
            </Column>
            <Column style={{ width: '20%' }} align="center">
              <Text style={cellText}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '25%' }} align="right">
              <Text style={cellText}>{formatPrice(item.subtotal, currency)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Footer Note */}
      <Section style={noteBox}>
        <Text style={noteText}>
          Guarda este comprobante para tus registros.
          Si necesitas asistencia, no dudes en contactarnos.
        </Text>
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

      {/* WhatsApp CTA */}
      <Section style={ctaSection}>
        <Link
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Consulto por mi factura del pedido ${orderNumber}`)}`}
          style={whatsappButton}
        >
          Consultas? Escribinos
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const docBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f0fdf4',
  color: '#166534',
  border: '2px solid #22c55e',
  borderRadius: '8px',
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  margin: '0',
};

const greeting: React.CSSProperties = { color: '#475569', margin: '0 0 4px 0', fontSize: '16px' };
const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' };
const subtitle: React.CSSProperties = { color: '#64748b', margin: '0 0 24px 0', fontSize: '15px', lineHeight: '1.5' };
const sectionTitle: React.CSSProperties = { color: '#0f172a', margin: '24px 0 12px 0', fontSize: '16px', fontWeight: '700' };

const invoiceBox: React.CSSProperties = { backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', marginBottom: '24px' };
const invoiceLabel: React.CSSProperties = { color: '#166534', margin: '6px 0', fontSize: '14px' };
const invoiceValue: React.CSSProperties = { color: '#166534', fontWeight: '600', margin: '6px 0', fontSize: '14px', textAlign: 'right' as const };
const invoiceText: React.CSSProperties = { color: '#166534', margin: '6px 0', fontSize: '14px', textAlign: 'right' as const };
const invoiceTotalLabel: React.CSSProperties = { color: '#166534', fontWeight: '700', margin: '4px 0', fontSize: '16px' };
const invoiceTotalValue: React.CSSProperties = { color: '#166534', fontWeight: '700', margin: '4px 0', fontSize: '20px', textAlign: 'right' as const };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' };
const tableHeaderText: React.CSSProperties = { padding: '10px 12px', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0' };
const tableRowEven: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const tableRowOdd: React.CSSProperties = { borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' };
const cellText: React.CSSProperties = { padding: '10px 12px', margin: '0', fontSize: '14px', color: '#334155' };

const noteBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' as const, marginTop: '24px', border: '1px solid #e2e8f0' };
const noteText: React.CSSProperties = { color: '#64748b', margin: '0', fontSize: '14px', lineHeight: '1.5' };

const ctaSection: React.CSSProperties = { textAlign: 'center' as const, marginTop: '24px' };
const downloadButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };

const reviewSection: React.CSSProperties = { marginTop: '24px', backgroundColor: '#fffbeb', borderRadius: '12px', padding: '24px', textAlign: 'center' as const, border: '1px solid #fde68a' };
const reviewTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' };
const reviewText: React.CSSProperties = { color: '#64748b', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' };
const reviewButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#4285f4', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
