'use client';

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), {
  ssr: false,
});

const FloatingWhatsApp = dynamic(() => import("@/components/common/FloatingWhatsApp"), {
  ssr: false,
});

export default function ClientLayoutElements() {
  return (
    <>
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
