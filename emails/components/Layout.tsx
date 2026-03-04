import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export default function Layout({ preview, children }: LayoutProps) {
  return (
    <Html lang="es">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>La Aldea</Text>
            <Text style={headerSubtitle}>Agroinsumos y Riego - Tala, Canelones</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerBrand}>La Aldea - Agroinsumos y Riego</Text>
            <Text style={footerAddress}>Tala, Canelones, Uruguay | Tel: 099 123 456</Text>
            <Link href="https://laaldeatala.com.uy" style={footerLink}>
              laaldeatala.com.uy
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  backgroundColor: '#f8fafc',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
};

const headerSubtitle: React.CSSProperties = {
  color: '#bfdbfe',
  margin: '8px 0 0 0',
  fontSize: '14px',
};

const content: React.CSSProperties = {
  padding: '32px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  padding: '24px',
  textAlign: 'center' as const,
};

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px 0',
};

const footerBrand: React.CSSProperties = {
  margin: '0 0 8px 0',
  color: '#64748b',
  fontSize: '14px',
  fontWeight: 'bold',
};

const footerAddress: React.CSSProperties = {
  margin: '0 0 8px 0',
  color: '#94a3b8',
  fontSize: '12px',
};

const footerLink: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '12px',
};
