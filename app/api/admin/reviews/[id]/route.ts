// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ReviewUpdate = Pick<Database['public']['Tables']['product_reviews']['Row'], 'is_approved'>;

const reviewWriteBridge = supabaseAdmin as unknown as {
  from: (table: 'product_reviews') => {
    update: (values: ReviewUpdate) => {
      eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>;
    };
    delete: () => {
      eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};


// PATCH - Approve/reject review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const { is_approved } = body;

    if (typeof is_approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid is_approved value' },
        { status: 400 }
      );
    }

    const { error } = await reviewWriteBridge
      .from('product_reviews')
      .update({ is_approved })
      .eq('id', id);

    if (error) {
      console.error('Update review error:', error);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const { id } = await params;

  try {
    const { error } = await reviewWriteBridge
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete review error:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
