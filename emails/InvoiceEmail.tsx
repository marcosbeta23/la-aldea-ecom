import { Section, Text, Link, Row, Column } from '@react-email/components';
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
  items: OrderItem[];
  invoiceFileUrl?: string;
}

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

export default function InvoiceEmail({
  orderNumber,
  customerName,
  invoiceNumber,
  invoiceType,
  total,
  items,
  invoiceFileUrl,
}: InvoiceEmailProps) {
  const invoiceTypeName = invoiceType === 'invoice_rut'
    ? 'Factura con RUT'
    : 'Comprobante de Consumidor Final';

  return (
    <Layout preview={`Factura N\u00B0 ${invoiceNumber} - Pedido ${orderNumber}`}>
      {/* Icon + Title */}
      <Section style={{ textAlign: 'center' as const, padding: '20px' }}>
        <Text style={{ fontSize: '48px', margin: '0 0 16px 0' }}>{'\uD83E\uDDFE'}</Text>
        <Text style={title}>Tu Factura esta Lista</Text>
        <Text style={subtitle}>Adjuntamos el comprobante de tu compra.</Text>
      </Section>

      {/* Invoice Info */}
      <Section style={invoiceBox}>
        <Row>
          <Column><Text style={invoiceLabel}>Tipo:</Text></Column>
          <Column align="right"><Text style={invoiceValue}>{invoiceTypeName}</Text></Column>
        </Row>
        <Row>
          <Column><Text style={invoiceLabel}>Numero:</Text></Column>
          <Column align="right"><Text style={invoiceValue}>{invoiceNumber}</Text></Column>
        </Row>
        <Row>
          <Column><Text style={invoiceLabel}>Pedido:</Text></Column>
          <Column align="right"><Text style={invoiceText}>{orderNumber}</Text></Column>
        </Row>
        <Row>
          <Column><Text style={invoiceLabel}>Total:</Text></Column>
          <Column align="right"><Text style={invoiceValue}>{formatPrice(total)}</Text></Column>
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
          <Row key={i} style={tableRow}>
            <Column style={{ width: '55%' }}>
              <Text style={cellText}>{item.product_name}</Text>
            </Column>
            <Column style={{ width: '20%' }} align="center">
              <Text style={cellText}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '25%' }} align="right">
              <Text style={cellText}>{formatPrice(item.subtotal)}</Text>
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

const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' };
const subtitle: React.CSSProperties = { color: '#64748b', margin: '0 0 24px 0', fontSize: '16px' };
const sectionTitle: React.CSSProperties = { color: '#0f172a', margin: '24px 0 16px 0', fontSize: '16px', fontWeight: 'bold' };

const invoiceBox: React.CSSProperties = { backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', marginBottom: '24px' };
const invoiceLabel: React.CSSProperties = { color: '#166534', margin: '4px 0', fontSize: '14px' };
const invoiceValue: React.CSSProperties = { color: '#166534', fontWeight: 'bold', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const invoiceText: React.CSSProperties = { color: '#166534', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9' };
const tableHeaderText: React.CSSProperties = { padding: '8px', color: '#475569', fontSize: '12px', margin: '0' };
const tableRow: React.CSSProperties = { borderBottom: '1px solid #e2e8f0' };
const cellText: React.CSSProperties = { padding: '8px', margin: '0', fontSize: '14px', color: '#334155' };

const noteBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center' as const, marginTop: '24px' };
const noteText: React.CSSProperties = { color: '#64748b', margin: '0', fontSize: '14px' };

const ctaSection: React.CSSProperties = { textAlign: 'center' as const, marginTop: '24px' };
const downloadButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
