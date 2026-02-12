// app/admin/reviews/ReviewActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Trash2 } from 'lucide-react';

export default function ReviewActions({
  reviewId,
  isApproved,
}: {
  reviewId: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      router.refresh();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Error al aprobar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: false }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      router.refresh();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error al rechazar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error al eliminar la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {!isApproved && (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title="Aprobar"
        >
          <Check className="h-4 w-4" />
        </button>
      )}

      {isApproved && (
        <button
          onClick={handleReject}
          disabled={loading}
          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
          title="Desaprobar"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
