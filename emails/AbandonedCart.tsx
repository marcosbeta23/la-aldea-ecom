import {
  Text,
  Section,
  Link,
  Hr,
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
      ? `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  return (
    <Layout preview={`${customerName}, dejaste productos en tu carrito`}>
      <Text style={greeting}>
        Hola {customerName},
      </Text>

      <Text style={paragraph}>
        Notamos que dejaste productos en tu carrito. No te preocupes, los guardamos para vos.
      </Text>

      {/* Items */}
      <Section style={itemsContainer}>
        <Text style={sectionTitle}>Tu carrito</Text>
        {items.map((item, index) => (
          <div key={index} style={itemRow}>
            <Text style={itemName}>
              {item.product_name} <span style={itemQty}>x{item.quantity}</span>
            </Text>
            <Text style={itemPrice}>{formatPrice(item.unit_price * item.quantity)}</Text>
          </div>
        ))}
        <Hr style={divider} />
        <div style={totalRow}>
          <Text style={totalLabel}>Subtotal</Text>
          <Text style={totalValue}>{formatPrice(subtotal)}</Text>
        </div>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Link href={checkoutUrl} style={ctaButton}>
          Completar tu compra
        </Link>
      </Section>

      <Text style={paragraph}>
        Si tenés alguna duda sobre tu pedido, no dudes en contactarnos por WhatsApp al{' '}
        <Link href="https://wa.me/59892744725" style={link}>092 744 725</Link>.
      </Text>

      <Text style={footerNote}>
        Si ya completaste tu compra, podés ignorar este email.
      </Text>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
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
};

const sectionTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const itemRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #e2e8f0',
};

const itemName: React.CSSProperties = {
  fontSize: '14px',
  color: '#334155',
  margin: '0',
};

const itemQty: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
};

const itemPrice: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#cbd5e1',
  margin: '12px 0',
};

const totalRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const totalLabel: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const totalValue: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
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
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
};

const footerNote: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};
