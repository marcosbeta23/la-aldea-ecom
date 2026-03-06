// lib/validators.ts
// Zod schemas for input validation across all API routes
import { z } from 'zod';

// Schema for creating orders
export const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string()
      .transform(val => val.replace(/[\s\-().]/g, ''))
      .pipe(z.string().regex(
        /^(\+598)?[0-9]{8,9}$/,
        'Invalid Uruguay phone number (must be 8-9 digits)'
      )),
    // Optional shipping fields (for future use)
    shipping_address: z.string().max(200, 'Address too long').optional(),
    shipping_city: z.string().max(100, 'City name too long').optional(),
    shipping_department: z.string().max(50, 'Department name too long').optional(),
    shipping_type: z.enum(['standard', 'express', 'pickup', 'delivery']).optional().default('standard'),
    shipping_cost: z.number().min(0, 'Shipping cost cannot be negative').optional().default(0),
    notes: z.string().max(500, 'Notes too long').optional(),
    payment_method: z.enum(['mercadopago', 'transfer']).optional().default('mercadopago'),
    payment_currency: z.enum(['UYU', 'USD']).optional().default('UYU'),
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

// ── Client-side checkout form schema ─────────────────────────────────

export const CheckoutFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'El teléfono es requerido'),
  shippingMethod: z.enum(['pickup', 'delivery']),
  address: z.string().max(200, 'Dirección muy larga').optional().or(z.literal('')),
  city: z.string().max(100, 'Ciudad muy larga').optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional().or(z.literal('')),
  invoiceType: z.enum(['consumer_final', 'invoice_rut']),
  invoiceTaxId: z.string().optional().or(z.literal('')),
  invoiceBusinessName: z.string().max(200, 'Razón social muy larga').optional().or(z.literal('')),
  paymentMethod: z.enum(['mercadopago', 'transfer']),
  paymentCurrency: z.enum(['UYU', 'USD']),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: 'Debés aceptar los términos y condiciones' }) }),
}).superRefine((data, ctx) => {
  // Shipping address required when delivery is selected
  if (data.shippingMethod === 'delivery') {
    if (!data.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La dirección es requerida para envío', path: ['address'] });
    }
    if (!data.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La ciudad es requerida', path: ['city'] });
    }
  }
  // Department is always required (for data gathering, even pickup orders)
  if (!data.department?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El departamento es requerido', path: ['department'] });
  }
  // RUT fields required when invoice_rut is selected
  if (data.invoiceType === 'invoice_rut') {
    const digits = (data.invoiceTaxId || '').replace(/\D/g, '');
    if (!digits) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El RUT es requerido para factura con crédito fiscal', path: ['invoiceTaxId'] });
    } else if (digits.length !== 12) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RUT inválido (debe tener 12 dígitos)', path: ['invoiceTaxId'] });
    }
    if (!data.invoiceBusinessName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La razón social es requerida', path: ['invoiceBusinessName'] });
    }
  }
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

// ── Counter Sale (Ventas Mostrador) schema ──────────────────────────

export const CounterSaleSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(200, 'Descripción muy larga'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.enum(['UYU', 'USD']).default('UYU'),
  customer_name: z.string().max(100, 'Nombre muy largo').optional().default('Cliente mostrador'),
  customer_phone: z.string().max(20).optional().default(''),
  payment_method: z.enum(['efectivo', 'credito', 'transfer']),
  notes: z.string().max(500, 'Notas muy largas').optional().default(''),
});

export type CounterSaleInput = z.infer<typeof CounterSaleSchema>;

// ── Category normalization ──────────────────────────────────────────

import { KNOWN_CATEGORIES as CATEGORIES_LIST, getAllSubcategoryValues } from './categories';

const KNOWN_CATEGORIES = CATEGORIES_LIST;
const ALL_KNOWN = [...KNOWN_CATEGORIES, ...getAllSubcategoryValues()];

/** Normalize a category string: match known categories/subcategories case-insensitively, or title-case it */
export function normalizeCategory(cat: string): string {
  const trimmed = cat.trim();
  if (!trimmed) return '';
  const match = ALL_KNOWN.find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (match) return match;
  return trimmed.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
