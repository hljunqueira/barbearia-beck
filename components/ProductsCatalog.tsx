'use client';

import { useState } from 'react';
import type { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';

interface ProductsCatalogProps {
  products: Product[];
}

export function ProductsCatalog({ products }: ProductsCatalogProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-mono text-brand-cream/40 border border-white/5 rounded bg-black/40">
        Nenhum produto em destaque no momento.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetail={(prod) => setSelectedProduct(prod)}
          />
        ))}
      </div>

      {/* Modal Amplo e Sóbrio de Detalhes do Produto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
