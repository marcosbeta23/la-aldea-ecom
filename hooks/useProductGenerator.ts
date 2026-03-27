'use client';

import { useState } from 'react';

export interface GeneratedProductContent {
    description: string;
    seo_title: string;
    keywords: string[];
}

interface UseProductGeneratorReturn {
    generate: (params: {
        name: string;
        brand?: string | null;
        sku: string;
        category?: string[];
    }) => Promise<GeneratedProductContent | null>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

export function useProductGenerator(): UseProductGeneratorReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generate(params: {
        name: string;
        brand?: string | null;
        sku: string;
        category?: string[];
    }): Promise<GeneratedProductContent | null> {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/ai/generate-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al generar');
            }

            return data.generated as GeneratedProductContent;
        } catch (err: any) {
            const msg = err.message || 'Error inesperado al contactar la IA';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }

    return {
        generate,
        loading,
        error,
        clearError: () => setError(null),
    };
}