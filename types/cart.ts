// Cart types for Zustand store

import type { Product } from './database';

export interface CartItem {
  id: string; // product id
  sku: string;
  name: string;
  price: number; // price_numeric
  quantity: number;
  image: string | null; // first image from images array
  stock: number; // current stock (for validation)
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  shippingCost: number;
  total: number;
}

export interface CartStore extends Cart {
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  setShippingCost: (cost: number) => void;

  // Computed (recalculated on changes)
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
}

// Customer info for checkout
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

// Checkout state
export interface CheckoutState {
  step: 'cart' | 'info' | 'payment' | 'confirmation';
  customer: CustomerInfo | null;
  selectedAddressId: string | null;
  paymentMethod: 'mercadopago' | 'transfer' | null;
  isProcessing: boolean;
  error: string | null;
}
