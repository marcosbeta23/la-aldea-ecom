// Database types matching Supabase schema

// Shipping types for products
export type ProductShippingType = 'dac' | 'freight' | 'pickup_only';

// Availability / pricing type
export type ProductAvailabilityType = 'regular' | 'on_request';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string[]; // Array of categories (multi-tag system)
  brand: string | null;
  price_numeric: number;
  currency: string;
  stock: number;
  sold_count: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Availability
  availability_type: ProductAvailabilityType; // 'regular' = normal, 'on_request' = consultar
  // Shipping configuration
  shipping_type: ProductShippingType; // 'dac' = standard courier, 'freight' = large items, 'pickup_only' = no shipping
  weight_kg: number | null; // For shipping calculation
  requires_quote: boolean; // If true, shipping cost needs manual quote
  // Featured & Discount fields
  is_featured: boolean; // Show in homepage featured section
  original_price: string | null; // Original price text before discount
  original_price_numeric: number | null; // Original price for calculations
  discount_percentage: number | null; // e.g., 20 for 20% off
  discount_ends_at: string | null; // When discount expires
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_department: string | null;
  shipping_type: 'standard' | 'express' | 'pickup';
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_method: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  coupon_code: string | null;
  notes: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // MVP Order Flow - New Fields
  paid_at: string | null;
  reserved_until: string | null;
  stock_reserved: boolean;
  // Invoice/CFE fields
  invoice_number: string | null;
  invoice_type: 'consumer_final' | 'invoice_rut' | null;
  invoice_tax_id: string | null; // RUT del cliente
  invoice_business_name: string | null; // Razón social
  invoice_file_url: string | null; // URL to uploaded invoice PDF in storage
  invoiced_at: string | null;
  // Refund fields
  refund_id: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  refund_status: 'pending' | 'completed' | 'failed' | null;
  refunded_at: string | null;
  // Email tracking fields
  confirmation_email_sent_at: string | null;
  invoice_email_sent_at: string | null;
  admin_notified_at: string | null;
  // Joined data
  order_items?: OrderItem[];
}

export type OrderStatus =
  | 'draft'                     // Borrador
  | 'pending'                   // Pendiente de pago
  | 'paid'                      // Pagado - stock reservado
  | 'paid_pending_verification' // Pagado pendiente de verificación
  | 'awaiting_stock'            // Esperando stock
  | 'out_of_stock'              // Sin stock disponible
  | 'ready_to_invoice'          // Listo para facturar
  | 'invoiced'                  // Facturado
  | 'processing'                // En proceso / preparando
  | 'shipped'                   // Enviado
  | 'delivered'                 // Entregado
  | 'cancelled'                 // Cancelado
  | 'refunded';                 // Reembolsado

// Status labels for display
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  paid: 'Pagado',
  paid_pending_verification: 'Verificando Pago',
  awaiting_stock: 'Esperando Stock',
  out_of_stock: 'Sin Stock',
  ready_to_invoice: 'Para Facturar',
  invoiced: 'Facturado',
  processing: 'En Proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number; // 1-5
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  customer_email: string;
  product_id: string;
  created_at: string;
  // Joined data
  products?: Product;
}

export interface Address {
  id: string;
  customer_email: string;
  customer_name: string;
  street_address: string;
  city: string;
  department: string;
  postal_code: string | null;
  additional_info: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  previous_stock: number;
  new_stock: number;
  change_type: 'sale' | 'restock' | 'adjustment' | 'return';
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface RelatedProduct {
  id: string;
  product_id: string;
  related_product_id: string;
  relationship_type: 'similar' | 'accessory' | 'upgrade';
  created_at: string;
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'>;
        Update: Partial<Pick<Order, 'status' | 'updated_at' | 'notes' | 'shipping_address' | 'shipping_city' | 'shipping_department' | 'mp_payment_id' | 'payment_method'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      product_reviews: {
        Row: ProductReview;
        Insert: Omit<ProductReview, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductReview, 'id' | 'created_at'>>;
      };
      discount_coupons: {
        Row: DiscountCoupon;
        Insert: Omit<DiscountCoupon, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DiscountCoupon, 'id' | 'created_at' | 'updated_at'>>;
      };
      wishlist_items: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, 'id' | 'created_at' | 'products'>;
        Update: Partial<Omit<WishlistItem, 'id' | 'created_at' | 'products'>>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>;
      };
      inventory_log: {
        Row: InventoryLog;
        Insert: Omit<InventoryLog, 'id' | 'created_at'>;
        Update: Partial<Omit<InventoryLog, 'id' | 'created_at'>>;
      };
      related_products: {
        Row: RelatedProduct;
        Insert: Omit<RelatedProduct, 'id' | 'created_at'>;
        Update: Partial<Omit<RelatedProduct, 'id' | 'created_at'>>;
      };
    };
  };
}
