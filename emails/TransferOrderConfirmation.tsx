import { Section, Text, Link, Row, Column, Hr } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';
import { WHATSAPP_PHONE } from '../lib/constants';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface TransferOrderConfirmationProps {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  currency?: string;
  orderId: string;
  appUrl?: string;
}

function formatPrice(price: number, currency = 'UYU'): string {
  const prefix = currency === 'USD' ? 'U$S' : 'UYU';
  return `${prefix} ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
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

const BANK_DETAILS: Record<string, { banco: string; cuenta: string; titular: string; rut: string; moneda: string }> = {
  UYU: {
    banco: 'BROU',
    cuenta: '001234567-00001',
    titular: 'La Aldea',
    rut: '21 123456 0001 19',
    moneda: 'Pesos Uruguayos (UYU)',
  },
  USD: {
    banco: 'BROU',
    cuenta: '001234567-00002',
    titular: 'La Aldea',
    rut: '21 123456 0001 19',
    moneda: 'Dólares Americanos (USD)',
  },
};

export default function TransferOrderConfirmation({
  orderNumber,
  createdAt,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  subtotal,
  discountAmount,
  total,
  currency = 'UYU',
  orderId,
  appUrl = 'https://laaldeatala.com.uy',
}: TransferOrderConfirmationProps) {
  const bank = BANK_DETAILS[currency] || BANK_DETAILS.UYU;
  const whatsappNumber = WHATSAPP_PHONE;
  const whatsappText = encodeURIComponent(
    `Hola! Acabo de realizar una transferencia para el pedido ${orderNumber}. Adjunto el comprobante.`
  );

  return (
    <Layout preview={`Pedido ${orderNumber} registrado - transferencia pendiente`}>
      {/* PEDIDO REGISTRADO Badge */}
      <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
        <Text style={badge}>PEDIDO REGISTRADO</Text>
      </Section>

      <Text style={greeting}>Hola {customerName},</Text>
      <Text style={title}>Tu pedido fue registrado!</Text>
      <Text style={subtitle}>
        Recibimos tu pedido. Para confirmarlo, realizá la transferencia bancaria con los datos
        que te detallamos a continuación y envianos el comprobante por WhatsApp.
      </Text>

      {/* Order Info Box */}
      <Section style={infoBox}>
        <Row>
          <Column>
            <Text style={infoLabel}>Numero de pedido</Text>
          </Column>
          <Column align="right">
            <Text style={infoValue}>{orderNumber}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={infoLabel}>Fecha</Text>
          </Column>
          <Column align="right">
            <Text style={infoText}>{formatDate(createdAt)}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={infoLabel}>Estado</Text>
          </Column>
          <Column align="right">
            <Text style={statusPending}>Pendiente de Pago</Text>
          </Column>
        </Row>
      </Section>

      {/* Bank Transfer Details */}
      <Section style={bankBox}>
        <Text style={bankTitle}>🏦 Datos para la Transferencia</Text>
        <Text style={bankSubtitle}>Realizá la transferencia en {bank.moneda}:</Text>
        <Row>
          <Column style={{ width: '40%' }}>
            <Text style={bankLabel}>Banco</Text>
          </Column>
          <Column>
            <Text style={bankValue}>{bank.banco}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '40%' }}>
            <Text style={bankLabel}>Cuenta</Text>
          </Column>
          <Column>
            <Text style={bankValue}>{bank.cuenta}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '40%' }}>
            <Text style={bankLabel}>Titular</Text>
          </Column>
          <Column>
            <Text style={bankValue}>{bank.titular}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '40%' }}>
            <Text style={bankLabel}>RUT</Text>
          </Column>
          <Column>
            <Text style={bankValue}>{bank.rut}</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
        <Row>
          <Column style={{ width: '40%' }}>
            <Text style={bankLabel}>Monto a transferir</Text>
          </Column>
          <Column>
            <Text style={bankAmount}>{formatPrice(total, currency)}</Text>
          </Column>
        </Row>
      </Section>

      {/* WhatsApp CTA */}
      <Section style={whatsappSection}>
        <Text style={whatsappTitle}>📱 Envianos tu comprobante</Text>
        <Text style={whatsappText2}>
          Una vez realizada la transferencia, envianos el comprobante por WhatsApp para confirmar tu pedido mas rapido.
        </Text>
        <Link
          href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
          style={whatsappButton}
        >
          Enviar Comprobante por WhatsApp
        </Link>
      </Section>

      {/* Products */}
      <Text style={sectionTitle}>Detalle del pedido</Text>
      <Section>
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
        {items.map((item, i) => (
          <Row key={i} style={i % 2 === 0 ? tableRowEven : tableRowOdd}>
            <Column style={{ width: '50%' }}>
              <Text style={tableCellText}>{item.product_name}</Text>
            </Column>
            <Column style={{ width: '15%' }} align="center">
              <Text style={tableCellText}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '17%' }} align="right">
              <Text style={tableCellText}>{formatPrice(item.unit_price, currency)}</Text>
            </Column>
            <Column style={{ width: '18%' }} align="right">
              <Text style={tableCellText}>{formatPrice(item.subtotal, currency)}</Text>
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
                <Text style={totalsValue}>{formatPrice(subtotal, currency)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={discountLabel}>Descuento:</Text>
              </Column>
              <Column align="right">
                <Text style={discountValue}>-{formatPrice(discountAmount, currency)}</Text>
              </Column>
            </Row>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
          </>
        )}
        <Row>
          <Column>
            <Text style={totalLabel}>Total a transferir:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{formatPrice(total, currency)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Info */}
      <Section style={customerBox}>
        <Text style={customerTitle}>Tus datos</Text>
        <Text style={customerText}><strong>Nombre:</strong> {customerName}</Text>
        <Text style={customerText}><strong>Email:</strong> {customerEmail}</Text>
        {customerPhone && <Text style={customerText}><strong>Telefono:</strong> {customerPhone}</Text>}
        {shippingAddress && <Text style={customerText}><strong>Direccion:</strong> {shippingAddress}</Text>}
      </Section>

      {/* Warning Note */}
      <Section style={warningBox}>
        <Text style={warningText}>
          ⏳ Tu pedido quedara reservado mientras aguardamos la confirmacion de la transferencia.
          Una vez verificado el pago, recibirás un email de confirmacion con todos los detalles.
        </Text>
      </Section>

      {/* View Order CTA */}
      <Section style={ctaSection}>
        <Link href={`${appUrl}/pendiente?order_id=${orderId}`} style={ctaButton}>
          Ver Estado del Pedido
        </Link>
      </Section>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const badge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#eff6ff',
  color: '#1e40af',
  border: '2px solid #3b82f6',
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

const infoBox: React.CSSProperties = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' };
const infoLabel: React.CSSProperties = { color: '#64748b', margin: '4px 0', fontSize: '14px' };
const infoValue: React.CSSProperties = { color: '#0f172a', fontWeight: '700', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const infoText: React.CSSProperties = { color: '#334155', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const statusPending: React.CSSProperties = { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline', textAlign: 'right' as const };

const bankBox: React.CSSProperties = { backgroundColor: '#1e3a5f', borderRadius: '12px', padding: '24px', marginBottom: '24px', color: '#ffffff' };
const bankTitle: React.CSSProperties = { color: '#ffffff', margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' };
const bankSubtitle: React.CSSProperties = { color: '#93c5fd', margin: '0 0 16px 0', fontSize: '14px' };
const bankLabel: React.CSSProperties = { color: '#93c5fd', margin: '6px 0', fontSize: '14px' };
const bankValue: React.CSSProperties = { color: '#ffffff', margin: '6px 0', fontSize: '14px', fontWeight: '500' };
const bankAmount: React.CSSProperties = { color: '#fbbf24', margin: '6px 0', fontSize: '18px', fontWeight: '700' };

const whatsappSection: React.CSSProperties = { backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' as const, border: '1px solid #bbf7d0' };
const whatsappTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' };
const whatsappText2: React.CSSProperties = { color: '#475569', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' };
const whatsappButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#25d366', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };

const tableHeader: React.CSSProperties = { backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' };
const tableHeaderText: React.CSSProperties = { padding: '10px 12px', color: '#475569', fontSize: '11px', textTransform: 'uppercase' as const, fontWeight: '600', letterSpacing: '0.5px', margin: '0' };
const tableRowEven: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const tableRowOdd: React.CSSProperties = { borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' };
const tableCellText: React.CSSProperties = { padding: '10px 12px', margin: '0', fontSize: '14px', color: '#334155' };

const totalsBox: React.CSSProperties = { backgroundColor: '#0f172a', borderRadius: '12px', padding: '20px', color: '#ffffff', marginTop: '16px' };
const totalsLabel: React.CSSProperties = { color: '#94a3b8', margin: '4px 0', fontSize: '14px' };
const totalsValue: React.CSSProperties = { color: '#ffffff', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const discountLabel: React.CSSProperties = { color: '#4ade80', margin: '4px 0', fontSize: '14px' };
const discountValue: React.CSSProperties = { color: '#4ade80', margin: '4px 0', fontSize: '14px', textAlign: 'right' as const };
const totalLabel: React.CSSProperties = { fontSize: '18px', fontWeight: '700', margin: '4px 0', color: '#ffffff' };
const totalValue: React.CSSProperties = { fontSize: '20px', fontWeight: '700', margin: '4px 0', textAlign: 'right' as const, color: '#fbbf24' };

const customerBox: React.CSSProperties = { marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const customerTitle: React.CSSProperties = { color: '#0f172a', margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700' };
const customerText: React.CSSProperties = { color: '#475569', margin: '4px 0', fontSize: '14px', lineHeight: '1.5' };

const warningBox: React.CSSProperties = { marginTop: '24px', padding: '16px 20px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' };
const warningText: React.CSSProperties = { color: '#92400e', margin: '0', fontSize: '14px', lineHeight: '1.5' };

const ctaSection: React.CSSProperties = { marginTop: '32px', textAlign: 'center' as const };
const ctaButton: React.CSSProperties = { display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };
