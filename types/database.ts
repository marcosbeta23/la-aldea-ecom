// Database types matching Supabase schema

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  brand: string | null;
  price_display: string;
  price_numeric: number;
  stock: number;
  images: string[];
  specs: Record<string, string> | null;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
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
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
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
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
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
        Insert: Omit<DiscountCoupon, 'id' | 'created_at'>;
        Update: Partial<Omit<DiscountCoupon, 'id' | 'created_at'>>;
      };
      wishlist_items: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, 'id' | 'created_at' | 'products'>;
        Update: Partial<Omit<WishlistItem, 'id' | 'created_at' | 'products'>>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, 'id' | 'created_at'>;
        Update: Partial<Omit<Address, 'id' | 'created_at'>>;
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
