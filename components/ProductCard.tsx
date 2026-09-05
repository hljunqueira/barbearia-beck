import Image from 'next/image';
import { ShoppingBag, Star } from 'lucide-react';
import type { Product, ProductCategory } from '@/types';
import { cn } from '@/lib/utils';
import { discountPercent, formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { BrandButton } from '@/components/BrandButton';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  pomada: 'Pomada',
  oleo: 'Óleo',
  balm: 'Balm',
  kit: 'Kit',
};

interface ProductCardProps {
  product: Product;
}

const Rating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1" aria-label={`Avaliação ${value} de 5`}>
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={cn(
          'h-3.5 w-3.5',
          index < Math.round(value) ? 'fill-brand-gold text-brand-gold' : 'text-brand-cream/20',
        )}
      />
    ))}
    <span className="ml-1 text-xs text-brand-cream/50">{value.toFixed(1)}</span>
  </div>
);

export const ProductCard = ({ product }: ProductCardProps) => {
  const hasDiscount =
    product.compareAtPriceInCents !== null && product.compareAtPriceInCents > product.priceInCents;

  // TODO(karfex): substituir por checkout do produto (product.karfexProductId)
  const buyHref = whatsappLink(`Olá! Tenho interesse no produto ${product.name}.`);

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-brand-graphite/80 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-gold"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite via-brand-graphite/10 to-transparent" />

        <span className="absolute left-4 top-4 rounded-sm border border-brand-gold/40 bg-brand-black/70 px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold backdrop-blur">
          {CATEGORY_LABEL[product.category]}
        </span>

        {hasDiscount && product.compareAtPriceInCents !== null && (
          <span className="absolute right-4 top-4 rounded-sm bg-gold-gradient px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-brand-black">
            -{discountPercent(product.compareAtPriceInCents, product.priceInCents)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <Rating value={product.rating} />

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-brand-cream">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-cream/60">
          {product.description}
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-brand-cream">
            {formatBRL(product.priceInCents)}
          </span>
          {hasDiscount && product.compareAtPriceInCents !== null && (
            <span className="text-sm text-brand-cream/40 line-through">
              {formatBRL(product.compareAtPriceInCents)}
            </span>
          )}
        </div>

        <div className="mt-5">
          <BrandButton
            href={buyHref}
            variant="outline"
            size="full"
            data-testid={`product-cta-${product.slug}`}
          >
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </BrandButton>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
