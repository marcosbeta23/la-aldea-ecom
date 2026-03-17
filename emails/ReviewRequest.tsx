// emails/ReviewRequest.tsx
import { Section, Text, Link} from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';
interface ReviewRequestProps {
  orderId: string;
  customerName?: string;
  items?: { product_name: string; product_id: string }[];
}

export function ReviewRequest({ orderId, customerName, items }: ReviewRequestProps) {
  return (
    <Layout>
      <Section>
        <Text style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 12 }}>
          {customerName ? `¡Gracias, ${customerName.split(' ')[0]}!` : '¡Gracias por tu compra!'}
        </Text>
        <Text style={{ fontSize: 16, margin: 0, marginBottom: 8 }}>
          ¿Cómo resultó tu experiencia con La Aldea?
        </Text>
        {items && items.length > 0 && (
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            Nos encantaría saber tu opinión sobre:{' '}
            <strong>{items.map(i => i.product_name).join(', ')}</strong>
          </Text>
        )}
        <Link
          href={`https://laaldeatala.com.uy/pedido/${orderId}#review`}
          style={{
            display: 'inline-block',
            background: '#1e293b',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            marginTop: 12,
          }}
        >
          Dejar mi reseña →
        </Link>
        <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 24 }}>
          Tu opinión ayuda a otros clientes en Uruguay a elegir mejor.
        </Text>
      </Section>
    </Layout>
  );
}