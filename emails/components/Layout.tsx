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
  Img,
  Font,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  preview?: string;
  children: React.ReactNode;
}

const BASE_URL = 'https://laaldeatala.com.uy';

export default function Layout({ preview, children }: LayoutProps) {
  return (
    <Html lang="es">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${BASE_URL}/assets/images/favicon/favicon-96x96.png`}
              width="48"
              height="48"
              alt="La Aldea"
              style={logoImg}
            />
            <Text style={headerTitle}>La Aldea</Text>
            <Text style={headerSubtitle}>Agroinsumos y Riego</Text>
          </Section>

          {/* Green accent line */}
          <Section style={accentLine} />

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerBrand}>La Aldea - Agroinsumos y Riego</Text>
            <Text style={footerAddress}>Tala, Canelones, Uruguay</Text>
            <Text style={footerContact}>Tel: 092 744 725 | la.aldeamartinbetancor@gmail.com</Text>
            <Link href={BASE_URL} style={footerLink}>
              laaldeatala.com.uy
            </Link>
            <Text style={footerLegal}>
              Este email fue enviado por La Aldea. Si recibiste este mensaje por error, por favor ignoralo.
            </Text>
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
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif",
  backgroundColor: '#f1f5f9',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
  padding: '28px 32px',
  textAlign: 'center' as const,
};

const logoImg: React.CSSProperties = {
  margin: '0 auto 12px auto',
  borderRadius: '12px',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  margin: '0',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
};

const headerSubtitle: React.CSSProperties = {
  color: '#93c5fd',
  margin: '4px 0 0 0',
  fontSize: '13px',
  fontWeight: '400',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
};

const accentLine: React.CSSProperties = {
  height: '4px',
  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
  margin: 0,
  padding: 0,
};

const content: React.CSSProperties = {
  padding: '32px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px 0',
};

const footerBrand: React.CSSProperties = {
  margin: '0 0 4px 0',
  color: '#475569',
  fontSize: '14px',
  fontWeight: '600',
};

const footerAddress: React.CSSProperties = {
  margin: '0 0 4px 0',
  color: '#94a3b8',
  fontSize: '12px',
};

const footerContact: React.CSSProperties = {
  margin: '0 0 8px 0',
  color: '#94a3b8',
  fontSize: '12px',
};

const footerLink: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
};

const footerLegal: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '11px',
  margin: '12px 0 0 0',
  lineHeight: '1.4',
};
