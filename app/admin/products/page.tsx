import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Search,
  Edit2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const search = typeof params.search === 'string' ? params.search : '';
  const perPage = 20;
  
  // Build query
  let query = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  
  const { data: products, count } = await query;
  
  const totalPages = Math.ceil((count || 0) / perPage);
  
  const formatCurrency = (value: number) => 
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">{count || 0} productos en total</p>
        </div>
        
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Nuevo producto
        </Link>
      </div>
      
      {/* Search */}
      <form className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
      
      {/* Products Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(products || []).map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{product.name}</p>
                        {product.brand && (
                          <p className="text-sm text-slate-500">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(product.price_numeric)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.stock <= 5 && product.stock > 0 && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        product.stock === 0 
                          ? 'text-red-600' 
                          : product.stock <= 5 
                            ? 'text-amber-600' 
                            : 'text-slate-900'
                      }`}>
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/productos/${product.sku}`}
                        target="_blank"
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver en tienda"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay productos {search ? 'que coincidan con la búsqueda' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ''}`}
                className={`p-2 rounded-lg border ${
                  page <= 1 
                    ? 'border-slate-200 text-slate-300 pointer-events-none' 
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <Link
                href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ''}`}
                className={`p-2 rounded-lg border ${
                  page >= totalPages 
                    ? 'border-slate-200 text-slate-300 pointer-events-none' 
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
