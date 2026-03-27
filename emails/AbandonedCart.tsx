import {
  Text,
  Section,
  Link,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface AbandonedCartItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface AbandonedCartProps {
  customerName: string;
  items: AbandonedCartItem[];
  subtotal: number;
  currency?: string;
  checkoutUrl: string;
}

export default function AbandonedCart({
  customerName,
  items,
  subtotal,
  currency = 'UYU',
  checkoutUrl,
}: AbandonedCartProps) {
  const formatPrice = (price: number) =>
    currency === 'USD'
      ? `U$S ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  return (
    <Layout preview={`${customerName}, dejaste productos en tu carrito`}>
      {/* Cart Icon */}
      <Section style={{ textAlign: 'center' as const, marginBottom: '16px' }}>
        <Text style={{ fontSize: '48px', margin: '0' }}>{'\uD83D\uDED2'}</Text>
      </Section>

      <Text style={greeting}>
        Hola {customerName},
      </Text>

      <Text style={paragraph}>
        Notamos que dejaste productos en tu carrito. No te preocupes, los guardamos para vos.
      </Text>

      {/* Items */}
      <Section style={itemsContainer}>
        <Text style={sectionTitle}>Tu carrito</Text>

        {/* Table Header */}
        <Row style={tableHeader}>
          <Column style={{ width: '55%' }}>
            <Text style={tableHeaderText}>Producto</Text>
          </Column>
          <Column style={{ width: '20%' }} align="center">
            <Text style={tableHeaderText}>Cant.</Text>
          </Column>
          <Column style={{ width: '25%' }} align="right">
            <Text style={tableHeaderText}>Precio</Text>
          </Column>
        </Row>

        {/* Items */}
        {items.map((item, index) => (
          <Row key={index} style={tableRow}>
            <Column style={{ width: '55%' }}>
              <Text style={cellText}>{item.product_name}</Text>
            </Column>
            <Column style={{ width: '20%' }} align="center">
              <Text style={cellText}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '25%' }} align="right">
              <Text style={cellPrice}>{formatPrice(item.unit_price * item.quantity)}</Text>
            </Column>
          </Row>
        ))}

        <Hr style={divider} />

        {/* Total Row */}
        <Row>
          <Column>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{formatPrice(subtotal)}</Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Link href={checkoutUrl} style={ctaButton}>
          Completar tu compra
        </Link>
        <Text style={urgencyText}>
          Los productos de tu carrito tienen disponibilidad limitada.
        </Text>
      </Section>

      <Text style={paragraph}>
        Si tenes alguna duda sobre tu pedido, no dudes en contactarnos por WhatsApp al{' '}
        <Link href="https://wa.me/59892744725" style={link}>092 744 725</Link>.
      </Text>

      <Text style={footerNote}>
        Si ya completaste tu compra, podes ignorar este email.
      </Text>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0 0 24px 0',
};

const itemsContainer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px 0',
  border: '1px solid #e2e8f0',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const tableHeader: React.CSSProperties = {
  backgroundColor: '#e2e8f0',
  borderRadius: '6px',
};

const tableHeaderText: React.CSSProperties = {
  padding: '8px 10px',
  color: '#475569',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const tableRow: React.CSSProperties = {
  borderBottom: '1px solid #e2e8f0',
};

const cellText: React.CSSProperties = {
  padding: '10px',
  fontSize: '14px',
  color: '#334155',
  margin: '0',
};

const cellPrice: React.CSSProperties = {
  padding: '10px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#cbd5e1',
  margin: '12px 0',
};

const totalLabel: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0',
};

const totalValue: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#16a34a',
  margin: '0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '9999px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '700',
};

const urgencyText: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '12px',
  margin: '12px 0 0 0',
  fontWeight: '600',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '600',
};

const footerNote: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};
