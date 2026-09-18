'use client';

import Image from 'next/image';
import type { Product, ProductCategory } from '@/types';
import { discountPercent, formatBRL } from '@/lib/format';
import { BrandButton } from '@/components/BrandButton';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  pomada: 'Pomada',
  oleo: 'Óleo',
  balm: 'Balm',
  kit: 'Kit',
  cerveja: 'Cerveja',
  refrigerante: 'Refrigerante',
  energetico: 'Energético',
  agua: 'Água',
  destilado: 'Destilado',
};

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard = ({ product, onOpenDetail }: ProductCardProps) => {
  const hasDiscount =
    product.compareAtPriceInCents !== null &&
    product.compareAtPriceInCents !== undefined &&
    product.compareAtPriceInCents > product.priceInCents;

  const isAvailable =
    product.inStock &&
    (product.stockQuantity === undefined || product.stockQuantity > 0);

  const handleClick = () => {
    if (onOpenDetail) onOpenDetail(product);
  };

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      onClick={handleClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#141414] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 cursor-pointer"
    >
      {/* Imagem do Produto */}
      <div className="relative aspect-square overflow-hidden bg-black/40">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

        {/* Categoria */}
        <span className="absolute left-3 top-3 rounded border border-brand-gold/40 bg-black/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-gold backdrop-blur-sm">
          {CATEGORY_LABEL[product.category] || product.category}
        </span>

        {/* Badge Desconto */}
        {hasDiscount && product.compareAtPriceInCents && (
          <span className="absolute right-3 top-3 rounded bg-brand-gold px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-black">
            -{discountPercent(product.compareAtPriceInCents, product.priceInCents)}%
          </span>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                isAvailable
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-950/80 text-red-400 border border-red-500/30'
              }`}
            >
              {isAvailable ? 'Em Estoque' : 'Esgotado'}
            </span>

            {product.volumeMl && (
              <span className="text-[10px] font-mono text-brand-gold/80 font-medium">
                {product.volumeMl}
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-bold leading-snug text-brand-cream group-hover:text-brand-gold transition">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-cream/60 font-sans">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && product.compareAtPriceInCents && (
              <span className="text-[11px] text-brand-cream/40 line-through font-mono">
                {formatBRL(product.compareAtPriceInCents)}
              </span>
            )}
            <span className="font-display text-xl font-bold text-brand-gold">
              {formatBRL(product.priceInCents)}
            </span>
          </div>

          <BrandButton
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="text-xs px-3 py-1.5"
          >
            Ver Detalhes
          </BrandButton>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
