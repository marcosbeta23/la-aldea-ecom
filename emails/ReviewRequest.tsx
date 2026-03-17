// emails/ReviewRequest.tsx
import { Section, Text, Link, Row, Column, Hr } from '@react-email/components';
import * as React from 'react';
import Layout from './components/Layout';

interface ReviewRequestProps {
  orderId: string;
}

export function ReviewRequest({ orderId }: ReviewRequestProps) {
  return (
    <Layout>
      <Section>
        <Text style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 12 }}>¡Gracias por tu compra!</Text>
        <Text style={{ fontSize: 16, margin: 0, marginBottom: 20 }}>
          ¿Cómo resultó tu experiencia? Nos encantaría saber tu opinión.
        </Text>
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
          Deja tu reseña aquí
        </Link>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 24 }}>
          Tu opinión ayuda a otros clientes y nos permite mejorar.
        </Text>
      </Section>
    </Layout>
  );
}