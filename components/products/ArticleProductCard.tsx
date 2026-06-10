import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import type { Product } from "@/types/database";
import { ShoppingCart } from "lucide-react";

interface ArticleProductCardProps {
  slug: string;
}

export default async function ArticleProductCard({ slug }: ArticleProductCardProps) {
  // Fetch the product directly in the server component
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug.trim())
    .single();

  const product = data as unknown as Product;

  if (error || !product || !product.is_active) {
    return null; // Fail gracefully if product doesn't exist or is inactive
  }
  
  // Format price
  const formattedPrice =
    typeof product.price_numeric === "number" && product.price_numeric > 0
      ? new Intl.NumberFormat("es-UY", {
          style: "currency",
          currency: product.currency || "UYU",
          maximumFractionDigits: 0,
        }).format(product.price_numeric)
      : null;

  // Use the first image or a fallback
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "/assets/images/placeholder.webp";

  return (
    <div className="my-8">
      <Link 
        href={`/productos/${product.slug}`}
        className="group flex flex-col sm:flex-row items-center gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
      >
        <div className="relative w-full sm:w-48 h-48 bg-slate-50 rounded-xl overflow-hidden shrink-0">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            {product.brand && (
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">
                {product.brand}
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {product.description || `Adquiri ${product.name} de ${product.brand} en La Aldea.`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
            <div>
              {formattedPrice ? (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-900">{formattedPrice}</span>
                  <span className="text-sm text-slate-500 font-medium mb-1 line-through">
                     {product.original_price_numeric && product.original_price_numeric > product.price_numeric && 
                        new Intl.NumberFormat("es-UY", {
                          style: "currency",
                          currency: product.currency || "UYU",
                          maximumFractionDigits: 0,
                        }).format(product.original_price_numeric)
                     }
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-slate-900">Consultar Precio</span>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 bg-blue-600 group-hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0">
              <ShoppingCart className="h-5 w-5" />
              Ver Producto
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
