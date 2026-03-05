import { Section, Text, Link, Row, Column, Hr } from '@react-email/components';
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
    <Layout preview={`NUEVO PEDIDO ${orderNumber} - ${customerName} - ${formatPrice(total)}`}>
      {/* Alert Banner */}
      <Section style={alertBanner}>
        <Text style={alertEmoji}>{'\uD83D\uDD14'}</Text>
        <Text style={alertTitle}>Nuevo Pedido Recibido</Text>
        <Text style={alertOrderNumber}>{orderNumber}</Text>
      </Section>

      {/* Quick Summary — top-level info employees need immediately */}
      <Section style={quickSummary}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Cliente</Text>
            <Text style={summaryValue}>{customerName}</Text>
          </Column>
          <Column style={{ width: '50%' }} align="right">
            <Text style={summaryLabel}>Total</Text>
            <Text style={summaryTotal}>{formatPrice(total)}</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: '#e2e8f0', margin: '12px 0' }} />
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Estado</Text>
            <Text style={summaryStatus}>{status}</Text>
          </Column>
          <Column style={{ width: '50%' }} align="right">
            <Text style={summaryLabel}>Productos</Text>
            <Text style={summaryValue}>{items.length} {items.length === 1 ? 'item' : 'items'} ({items.reduce((sum, i) => sum + i.quantity, 0)} unidades)</Text>
          </Column>
        </Row>
      </Section>

      {/* Products Table */}
      <Text style={sectionTitle}>Productos del pedido</Text>
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
              <Text style={cellBold}>{formatPrice(item.subtotal)}</Text>
            </Column>
          </Row>
        ))}
        {/* Total row */}
        <Row style={totalRow}>
          <Column style={{ width: '75%' }}>
            <Text style={totalRowLabel}>TOTAL</Text>
          </Column>
          <Column style={{ width: '25%' }} align="right">
            <Text style={totalRowValue}>{formatPrice(total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Details */}
      <Section style={customerBox}>
        <Text style={customerTitle}>Datos del cliente</Text>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={customerLabel}>Nombre</Text>
            <Text style={customerValue}>{customerName}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={customerLabel}>Email</Text>
            <Text style={customerValue}>{customerEmail || 'No proporcionado'}</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: '#e2e8f0', margin: '8px 0' }} />
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={customerLabel}>Telefono</Text>
            <Text style={customerValue}>
              {customerPhone || 'No proporcionado'}
            </Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={customerLabel}>Direccion</Text>
            <Text style={customerValue}>{shippingAddress || 'No proporcionada'}</Text>
          </Column>
        </Row>
      </Section>

      {/* Quick Actions */}
      <Section style={actionsSection}>
        <Text style={actionsTitle}>Acciones rapidas</Text>
        <Row>
          <Column align="center" style={{ width: '50%' }}>
            <Link href={`https://laaldeatala.com.uy/admin/orders/${orderId}`} style={adminButton}>
              Ver en Admin
            </Link>
          </Column>
          <Column align="center" style={{ width: '50%' }}>
            {customerPhone ? (
              <Link
                href={`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${customerName}! Recibimos tu pedido ${orderNumber} en La Aldea.`)}`}
                style={whatsappButton}
              >
                WhatsApp Cliente
              </Link>
            ) : (
              <Link
                href={`mailto:${customerEmail || ''}`}
                style={emailButton}
              >
                Email Cliente
              </Link>
            )}
          </Column>
        </Row>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const alertBanner: React.CSSProperties = { backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px 20px', marginBottom: '24px', borderRadius: '0 8px 8px 0' };
const alertEmoji: React.CSSProperties = { fontSize: '28px', margin: '0 0 4px 0' };
const alertTitle: React.CSSProperties = { color: '#92400e', margin: '0', fontSize: '18px', fontWeight: '700' };
const alertOrderNumber: React.CSSProperties = { color: '#b45309', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' };

const quickSummary: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' };
const summaryLabel: React.CSSProperties = { color: '#94a3b8', margin: '0', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const summaryValue: React.CSSProperties = { color: '#0f172a', margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600' };
const summaryTotal: React.CSSProperties = { color: '#16a34a', margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700', textAlign: 'right' as const };
const summaryStatus: React.CSSProperties = { color: '#2563eb', margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600', textTransform: 'uppercase' as const };

const sectionTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' };
const tableHeaderText: React.CSSProperties = { padding: '10px 12px', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0' };
const tableRowEven: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const tableRowOdd: React.CSSProperties = { borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' };
const cellText: React.CSSProperties = { padding: '10px 12px', margin: '0', fontSize: '14px', color: '#334155' };
const cellBold: React.CSSProperties = { padding: '10px 12px', margin: '0', fontSize: '14px', color: '#0f172a', fontWeight: '600' };
const totalRow: React.CSSProperties = { backgroundColor: '#0f172a' };
const totalRowLabel: React.CSSProperties = { padding: '12px', margin: '0', fontSize: '14px', color: '#ffffff', fontWeight: '700' };
const totalRowValue: React.CSSProperties = { padding: '12px', margin: '0', fontSize: '16px', color: '#ffffff', fontWeight: '700' };

const customerBox: React.CSSProperties = { marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const customerTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' };
const customerLabel: React.CSSProperties = { color: '#94a3b8', margin: '0', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const customerValue: React.CSSProperties = { color: '#334155', margin: '4px 0 0 0', fontSize: '14px' };

const actionsSection: React.CSSProperties = { marginTop: '24px', textAlign: 'center' as const };
const actionsTitle: React.CSSProperties = { color: '#64748b', margin: '0 0 16px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '1px' };
const adminButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' };
const emailButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#64748b', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' };
