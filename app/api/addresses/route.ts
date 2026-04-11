import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import type { Database } from '@/types/database';

type AddressRow = Database['public']['Tables']['addresses']['Row'];
type AddressInsert = Database['public']['Tables']['addresses']['Insert'];

type AddressWriteResponse = {
  data: AddressRow | null;
  error: { message: string } | null;
};

const addressesWriteBridge = supabaseAdmin as unknown as {
  from: (table: 'addresses') => {
    update: (values: Pick<AddressRow, 'is_default'>) => {
      eq: (column: 'customer_email', value: string) => Promise<{ error: { message: string } | null }>;
    };
    insert: (values: AddressInsert) => {
      select: (columns: string) => {
        single: () => Promise<AddressWriteResponse>;
      };
    };
  };
};

// Zod schema for address validation
const AddressSchema = z.object({
  customer_email: z.string().email('Invalid email address'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  street_address: z.string().min(5, 'Address must be at least 5 characters').max(200),
  city: z.string().min(2, 'City is required').max(100),
  department: z.string().min(2, 'Department is required').max(50),
  postal_code: z.string().max(10).optional(),
  additional_info: z.string().max(200).optional(),
  is_default: z.boolean().optional().default(false),
});

// GET /api/addresses?email=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { data: addresses, error } = await supabaseAdmin
      .from('addresses')
      .select('id, customer_email, customer_name, street_address, city, department, postal_code, additional_info, is_default, created_at, updated_at')
      .eq('customer_email', email.toLowerCase())
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
      .returns<AddressRow[]>();

    if (error) {
      console.error('Get addresses error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: addresses || [] });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validation = AddressSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const {
      customer_email,
      customer_name,
      street_address,
      city,
      department,
      postal_code,
      additional_info,
      is_default,
    } = validation.data;

    // If setting as default, unset other defaults first
    if (is_default) {
      const { error: unsetError } = await addressesWriteBridge
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_email', customer_email.toLowerCase());
      
      if (unsetError) {
        console.error('Error unsetting default addresses:', unsetError);
      }
    }

    const { data, error } = await addressesWriteBridge
      .from('addresses')
      .insert({
        customer_email: customer_email.toLowerCase(),
        customer_name,
        street_address,
        city,
        department,
        postal_code: postal_code || null,
        additional_info: additional_info || null,
        is_default: is_default || false,
      })
      .select('id, customer_email, customer_name, street_address, city, department, postal_code, additional_info, is_default, created_at, updated_at')
      .single();

    if (error) {
      console.error('Create address error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Address saved successfully',
    });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save address' },
      { status: 500 }
    );
  }
}
