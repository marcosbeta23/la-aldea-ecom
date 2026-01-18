// API request/response types

import type {
  Product,
  Order,
  ProductReview,
  DiscountCoupon,
} from './database';
import type { CartItem, CustomerInfo } from './cart';

// ============ Generic API Response ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============ Orders API ============
export interface CreateOrderRequest {
  customer: CustomerInfo;
  items: CartItem[];
  couponCode?: string;
  shippingCost?: number;
}

export interface CreateOrderResponse {
  order_id: string;
  order_number: string;
  init_point: string; // MercadoPago checkout URL
  preference_id: string; // MercadoPago preference ID
}

export interface OrderWithItems extends Omit<Order, 'order_items'> {
  order_items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
  }>;
}

// ============ MercadoPago Webhook ============
export interface MercadoPagoWebhook {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface MercadoPagoPayment {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'in_process';
  status_detail: string;
  payment_type_id: string;
  payment_method_id: string;
  external_reference: string; // order.id
  transaction_amount: number;
  currency_id: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

// ============ Reviews API ============
export interface CreateReviewRequest {
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewsResponse {
  reviews: ProductReview[];
  average_rating: number;
  total_reviews: number;
}

// ============ Coupons API ============
export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discount_amount?: number;
  coupon?: DiscountCoupon;
  error?: string;
}

// ============ Wishlist API ============
export interface AddToWishlistRequest {
  customer_email: string;
  product_id: string;
}

export interface WishlistResponse {
  id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

// ============ Addresses API ============
export interface AddressRequest {
  customer_email: string;
  customer_name: string;
  street_address: string;
  city: string;
  department: string;
  postal_code?: string;
  additional_info?: string;
  is_default?: boolean;
}

// ============ Products API ============
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RelatedProductsResponse {
  products: Product[];
  relationship_types: Record<string, 'similar' | 'accessory' | 'upgrade'>;
}

// ============ Contact/Leads API ============
export interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source?: string; // e.g., 'contact_form', 'product_inquiry'
  product_sku?: string; // if inquiry about specific product
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  lead_id?: string;
}
