import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Define type for relationship priority
type RelationshipType = 'upgrade' | 'accessory' | 'similar';

// Type for relation record from DB
interface RelationRecord {
  related_product_id: string;
  relationship_type: string;
}

// Type for product record from DB
interface ProductRecord {
  id: string;
  [key: string]: unknown;
}

// GET /api/products/related?id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Fetch related product IDs
    const { data: relationsData, error: relationsError } = await supabaseAdmin
      .from('related_products')
      .select('related_product_id, relationship_type')
      .eq('product_id', productId) as { data: any[] | null; error: any };

    if (relationsError) {
      console.error('Get relations error:', relationsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch related products' },
        { status: 500 }
      );
    }

    // Cast to proper type
    const relations = (relationsData || []) as unknown as RelationRecord[];

    if (relations.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch actual products
    const relatedIds = relations.map((r) => r.related_product_id);
    
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', relatedIds)
      .eq('is_active', true) as { data: any[] | null; error: any };

    if (productsError) {
      console.error('Get products error:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Cast to proper type
    const products = (productsData || []) as unknown as ProductRecord[];

    // Sort by relationship type priority: upgrade > accessory > similar
    const typePriority: Record<RelationshipType, number> = { 
      upgrade: 1, 
      accessory: 2, 
      similar: 3 
    };
    
    const sortedProducts = products?.sort((a, b) => {
      const relA = relations.find((r) => r.related_product_id === a.id);
      const relB = relations.find((r) => r.related_product_id === b.id);
      const typeA = (relA?.relationship_type as RelationshipType) || 'similar';
      const typeB = (relB?.relationship_type as RelationshipType) || 'similar';
      return (typePriority[typeA] || 3) - (typePriority[typeB] || 3);
    });

    // Add relationship type to each product for frontend use
    const productsWithRelationType = sortedProducts?.map((product) => {
      const relation = relations.find((r) => r.related_product_id === product.id);
      return {
        ...product,
        relationship_type: relation?.relationship_type || 'similar',
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: productsWithRelationType || [] 
    });
  } catch (error) {
    console.error('Get related products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}
