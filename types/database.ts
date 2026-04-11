// Database types matching Supabase schema

// Shipping types for products
export type ProductShippingType = 'dac' | 'freight' | 'pickup_only';

// Availability / pricing type
export type ProductAvailabilityType = 'regular' | 'on_request';

export interface Product {
  id: string;
  sku: string;
  slug: string | null;
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
  show_price_on_request: boolean; // Show price even if availability_type is 'on_request'
  // Shipping configuration
  shipping_type: ProductShippingType; // 'dac' = standard courier, 'freight' = large items, 'pickup_only' = no shipping
  weight_kg: number | null; // For shipping calculation
  requires_quote: boolean; // If true, shipping cost needs manual quote
  // Featured & Discount fields
  is_featured: boolean; // Show in homepage featured section
  featured_order: number | null; // Order position in homepage carousel (lower = first)
  original_price: string | null; // Original price text before discount
  original_price_numeric: number | null; // Original price for calculations
  discount_percentage: number | null; // e.g., 20 for 20% off
  discount_ends_at: string | null; // When discount expires
}

// Order source / sales channel
export type OrderSource = 'online';

// Payment methods
export type PaymentMethod = 'mercadopago' | 'transfer' | 'efectivo' | 'credito';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'MercadoPago',
  transfer: 'Transferencia',
  efectivo: 'Efectivo',
  credito: 'Crédito',
};

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  address_id: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_department: string | null;
  shipping_type: 'pickup' | 'dac' | 'freight';
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  currency: string; // Payment currency: 'UYU' or 'USD'
  exchange_rate_used: number | null; // USD/UYU rate at time of order
  status: OrderStatus;
  payment_method: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  coupon_code: string | null;
  notes: string | null;
  meta: Record<string, unknown> | null;
  order_source: OrderSource;
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
  currency: string; // Original product currency
  unit_price_converted: number | null; // Price in payment currency (null if same)
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
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number | null;
  max_uses: number | null;
  current_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: Record<string, unknown> | null;
  created_at: string | null;
  last_login: string | null;
  is_active: boolean | null;
}

export interface OrderLog {
  id: string;
  order_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  details: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string | null;
}

export interface CheckoutAttempt {
  id: string;
  email: string;
  phone: string | null;
  customer_name: string | null;
  items: unknown;
  subtotal: number;
  currency: string | null;
  created_at: string | null;
  recovered: boolean | null;
  recovery_email_sent_at: string | null;
  order_id: string | null;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  category: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface MonthlyRevenueSnapshot {
  id: string;
  month: string;
  revenue_uyu: number;
  revenue_usd: number;
  order_count: number;
  created_at: string | null;
}

export interface SearchAnalytics {
  id: string;
  query: string;
  results_count: number;
  clicked_product_id: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SearchSynonym {
  id: string;
  term: string;
  maps_to: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SearchProductResult {
  id: string;
  slug: string | null;
  sku: string;
  name: string;
  category: string[];
  brand: string | null;
  price_numeric: number;
  currency: string;
  images: string[] | null;
  availability_type: string;
  similarity: number | null;
}

export interface SearchSemanticResult {
  id: string;
  similarity: number;
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

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  breadcrumb_label: string | null;
  category: string | null;
  keywords: string[] | null;
  related_categories: Array<Record<string, unknown>> | null;
  related_articles: string[] | null;
  sections: Array<Record<string, unknown>> | null;
  is_published: boolean;
  date_published: string | null;
  date_modified: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'order_items'>>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
        Relationships: [];
      };
      order_logs: {
        Row: OrderLog;
        Insert: Omit<OrderLog, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderLog, 'id' | 'created_at'>>;
        Relationships: [];
      };
      product_reviews: {
        Row: ProductReview;
        Insert: Omit<ProductReview, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductReview, 'id' | 'created_at'>>;
        Relationships: [];
      };
      discount_coupons: {
        Row: DiscountCoupon;
        Insert: Omit<DiscountCoupon, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DiscountCoupon, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      wishlist_items: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, 'id' | 'created_at' | 'products'>;
        Update: Partial<Omit<WishlistItem, 'id' | 'created_at' | 'products'>>;
        Relationships: [];
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      inventory_log: {
        Row: InventoryLog;
        Insert: Omit<InventoryLog, 'id' | 'created_at'>;
        Update: Partial<Omit<InventoryLog, 'id' | 'created_at'>>;
        Relationships: [];
      };
      related_products: {
        Row: RelatedProduct;
        Insert: Omit<RelatedProduct, 'id' | 'created_at'>;
        Update: Partial<Omit<RelatedProduct, 'id' | 'created_at'>>;
        Relationships: [];
      };
      partners: {
        Row: Partner;
        Insert: Omit<Partner, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      guides: {
        Row: Guide;
        Insert: Omit<Guide, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Guide, 'id' | 'created_at' | 'updated_at'> >;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'created_at' | 'last_login'>;
        Update: Partial<Omit<AdminUser, 'id' | 'email'>>;
        Relationships: [];
      };
      checkout_attempts: {
        Row: CheckoutAttempt;
        Insert: Omit<CheckoutAttempt, 'id' | 'created_at' | 'recovered' | 'recovery_email_sent_at' | 'order_id'>;
        Update: Partial<Omit<CheckoutAttempt, 'id' | 'created_at'>>;
        Relationships: [];
      };
      quote_requests: {
        Row: QuoteRequest;
        Insert: Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      monthly_revenue_snapshots: {
        Row: MonthlyRevenueSnapshot;
        Insert: Omit<MonthlyRevenueSnapshot, 'id' | 'created_at'>;
        Update: Partial<Omit<MonthlyRevenueSnapshot, 'id' | 'created_at'>>;
        Relationships: [];
      };
      search_analytics: {
        Row: SearchAnalytics;
        Insert: {
          query: string;
          results_count: number;
          clicked_product_id?: string | null;
          source?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          query?: string;
          results_count?: number;
          clicked_product_id?: string | null;
          source?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
      search_synonyms: {
        Row: SearchSynonym;
        Insert: Omit<SearchSynonym, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SearchSynonym, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
    };
    Functions: {
      reserve_stock_for_order: {
        Args: {
          p_order_id: string;
          p_reservation_hours: number;
        };
        Returns: {
          success: boolean;
          expires_at: string | null;
          failed_products: Array<{ name?: string }> | null;
        };
      };
      release_expired_reservations: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      purge_old_data: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      generate_monthly_snapshot: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      search_products_fuzzy: {
        Args: {
          search_query: string;
          similarity_threshold: number;
          result_limit: number;
        };
        Returns: SearchProductResult[];
      };
      search_products_semantic: {
        Args: {
          query_embedding: string;
          similarity_threshold: number;
          result_limit: number;
        };
        Returns: SearchSemanticResult[];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
