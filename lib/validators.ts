// lib/validators.ts
// Zod schemas for input validation across all API routes
import { z } from 'zod';

// Schema for creating orders
export const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(
      /^(\+598)?[0-9]{8,9}$/,
      'Invalid Uruguay phone number (must be 8-9 digits)'
    ),
    // Optional shipping fields (for future use)
    shipping_address: z.string().max(200, 'Address too long').optional(),
    shipping_city: z.string().max(100, 'City name too long').optional(),
    shipping_department: z.string().max(50, 'Department name too long').optional(),
    shipping_type: z.enum(['standard', 'express', 'pickup']).optional().default('standard'),
    shipping_cost: z.number().min(0, 'Shipping cost cannot be negative').optional().default(0),
    notes: z.string().max(500, 'Notes too long').optional(),
    payment_method: z.enum(['mercadopago', 'transfer']).optional().default('mercadopago'),
    // Invoice/Billing fields
    invoice_type: z.enum(['consumer_final', 'invoice_rut']).optional().default('consumer_final'),
    invoice_tax_id: z.string().regex(/^\d{12}$/, 'Invalid RUT (must be 12 digits)').optional(),
    invoice_business_name: z.string().max(200, 'Business name too long').optional(),
  }),
  items: z.array(
    z.object({
      id: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 units per product'),
    })
  ).min(1, 'Cart cannot be empty'),
  couponCode: z.string().max(50).optional(),
}).refine((data) => {
  // If invoice_rut is selected, invoice_tax_id and invoice_business_name are required
  if (data.customer.invoice_type === 'invoice_rut') {
    return data.customer.invoice_tax_id && data.customer.invoice_business_name;
  }
  return true;
}, {
  message: 'RUT and business name are required for invoice with RUT',
  path: ['customer', 'invoice_tax_id'],
});

// Schema for creating reviews
export const CreateReviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  customer_email: z.string().email('Invalid email address').optional(),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment too long (max 1000 characters)').optional(),
});

// Schema for validating coupons
export const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code required').max(50, 'Coupon code too long'),
  subtotal: z.number().positive('Subtotal must be positive'),
});

// Schema for contact/quote requests
export const QuoteRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(
    /^(\+598)?[0-9]{8,9}$/,
    'Invalid Uruguay phone number'
  ),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  category: z.enum(['general', 'quote', 'wholesale', 'custom']).optional(),
});

// Type exports for TypeScript
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;
export type QuoteRequestInput = z.infer<typeof QuoteRequestSchema>;
