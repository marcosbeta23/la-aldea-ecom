// app/admin/reviews/page.tsx
import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Star, Check, Eye, Clock } from 'lucide-react';
import ReviewActions from './ReviewActions';

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'pending';

  let query = supabaseAdmin
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter === 'pending') {
    query = query.eq('is_approved', false);
  } else if (filter === 'approved') {
    query = query.eq('is_approved', true);
  }

  const { data: reviews } = await query as { data: any[] | null };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = await supabaseAdmin
    .from('product_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('is_approved', false) as { count: number | null };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reseñas</h1>
        <p className="text-slate-500">
          {pendingCount.count || 0} reseñas pendientes de moderación
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/reviews?filter=pending"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="inline h-4 w-4 mr-1" />
            Pendientes ({pendingCount.count || 0})
          </Link>
          <Link
            href="/admin/reviews?filter=approved"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Check className="inline h-4 w-4 mr-1" />
            Aprobadas
          </Link>
          <Link
            href="/admin/reviews?filter=all"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="inline h-4 w-4 mr-1" />
            Todas
          </Link>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Comentario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {((reviews || []) as Review[]).map((review) => (
                <tr key={review.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {review.customer_name}
                      </p>
                      {review.customer_email && (
                        <p className="text-xs text-slate-500">{review.customer_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-md truncate">
                      {review.comment || 'Sin comentario'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {review.is_approved ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ReviewActions
                      reviewId={review.id}
                      isApproved={review.is_approved}
                    />
                  </td>
                </tr>
              ))}

              {(!reviews || reviews.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay reseñas {filter && filter !== 'all' ? `(${filter === 'pending' ? 'pendientes' : 'aprobadas'})` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
