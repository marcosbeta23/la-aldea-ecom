import { Section, Text, Link, Row, Column } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface AdminNotificationProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  status: string;
  items: OrderItem[];
  total: number;
  orderId: string;
}

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

export default function AdminNotification({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  status,
  items,
  total,
  orderId,
}: AdminNotificationProps) {
  return (
    <Layout preview={`Nuevo pedido ${orderNumber} - ${formatPrice(total)}`}>
      <Text style={title}>Nuevo Pedido Recibido</Text>
      <Text style={subtitle}>Se recibio un nuevo pedido en la tienda.</Text>

      {/* Order Summary */}
      <Section style={alertBox}>
        <Text style={alertText}>
          <strong>Pedido:</strong> {orderNumber}
        </Text>
        <Text style={alertText}>
          <strong>Cliente:</strong> {customerName}
        </Text>
        <Text style={alertText}>
          <strong>Total:</strong> {formatPrice(total)}
        </Text>
        <Text style={alertText}>
          <strong>Estado:</strong> {status}
        </Text>
      </Section>

      {/* Products */}
      <Text style={sectionTitle}>Productos ({items.length})</Text>
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

      {/* Customer Details */}
      <Section style={customerBox}>
        <Text style={customerTitle}>Datos del cliente</Text>
        <Text style={customerText}><strong>Nombre:</strong> {customerName}</Text>
        <Text style={customerText}><strong>Email:</strong> {customerEmail || 'No proporcionado'}</Text>
        <Text style={customerText}><strong>Telefono:</strong> {customerPhone || 'No proporcionado'}</Text>
        <Text style={customerText}><strong>Direccion:</strong> {shippingAddress || 'No proporcionada'}</Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Link href={`https://laaldeatala.com.uy/admin/orders/${orderId}`} style={ctaButton}>
          Ver Pedido en Admin
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const title: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' };
const subtitle: React.CSSProperties = { color: '#64748b', margin: '0 0 24px 0' };
const sectionTitle: React.CSSProperties = { color: '#0f172a', margin: '24px 0 16px 0', fontSize: '18px', fontWeight: 'bold' };

const alertBox: React.CSSProperties = { backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', marginBottom: '24px' };
const alertText: React.CSSProperties = { margin: '4px 0', color: '#92400e', fontSize: '14px' };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9' };
const tableHeaderText: React.CSSProperties = { padding: '12px', color: '#475569', fontSize: '12px', margin: '0' };
const tableRow: React.CSSProperties = { borderBottom: '1px solid #e2e8f0' };
const cellText: React.CSSProperties = { padding: '12px', margin: '0', fontSize: '14px', color: '#334155' };

const customerBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginTop: '24px' };
const customerTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' };
const customerText: React.CSSProperties = { color: '#475569', margin: '4px 0', fontSize: '14px' };

const ctaSection: React.CSSProperties = { textAlign: 'center' as const, marginTop: '32px' };
const ctaButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#3b82f6', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
