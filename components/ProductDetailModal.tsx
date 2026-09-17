'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Product, ProductCategory } from '@/types';
import { formatBRL, discountPercent } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { BrandButton } from '@/components/BrandButton';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  pomada: 'Pomada Modeladora',
  oleo: 'Óleo Nutritivo',
  balm: 'Balm Hidratante',
  kit: 'Kit Exclusivo',
  cerveja: 'Cerveja Especial',
  refrigerante: 'Refrigerante',
  energetico: 'Energético',
  agua: 'Água Mineral',
  destilado: 'Destilado / Dose',
};

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const hasDiscount =
    product.compareAtPriceInCents !== null &&
    product.compareAtPriceInCents !== undefined &&
    product.compareAtPriceInCents > product.priceInCents;

  const isAvailable =
    product.inStock &&
    (product.stockQuantity === undefined || product.stockQuantity > 0);

  const buyHref = whatsappLink(
    `Olá! Tenho interesse no produto ${product.name} (${formatBRL(product.priceInCents)}). Está disponível para retirada na barbearia?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop 100% Sólido */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Container do Modal Amplo */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 sm:p-8 text-brand-cream z-10 custom-scrollbar">
        {/* Fechar no canto superior */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition z-20"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Coluna da Imagem */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/60 border border-white/10">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />

            {hasDiscount && product.compareAtPriceInCents && (
              <span className="absolute top-3 left-3 bg-brand-gold text-brand-black px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider rounded">
                -{discountPercent(product.compareAtPriceInCents, product.priceInCents)}% OFF
              </span>
            )}
          </div>

          {/* Coluna de Informações Detalhadas */}
          <div className="flex flex-col justify-between h-full space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono tracking-widest text-brand-gold uppercase">
                  {CATEGORY_LABEL[product.category] || product.category}
                </span>
                <span className="text-white/20">•</span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                    isAvailable
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-950/80 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isAvailable ? 'Em Estoque na Barbearia' : 'Esgotado'}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-cream leading-snug">
                {product.name}
              </h2>

              {/* Preço de Venda */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-2xl sm:text-3xl font-bold text-brand-gold">
                  {formatBRL(product.priceInCents)}
                </span>
                {hasDiscount && product.compareAtPriceInCents && (
                  <span className="text-sm text-brand-cream/40 line-through font-mono">
                    {formatBRL(product.compareAtPriceInCents)}
                  </span>
                )}
              </div>

              {/* Quantidade em estoque para transparência */}
              {product.stockQuantity !== undefined && product.stockQuantity > 0 && (
                <p className="text-[11px] font-mono text-brand-cream/50 mt-1">
                  Estoque imediato: {product.stockQuantity} unidade{product.stockQuantity > 1 ? 's' : ''}
                </p>
              )}

              {/* Descrição Completa */}
              <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-brand-cream/60">
                  Detalhes do Produto & Aplicação
                </p>
                <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Ação de Compra / Reserva */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {isAvailable ? (
                <BrandButton
                  href={buyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="full"
                  className="py-3 text-xs uppercase tracking-wider font-bold"
                >
                  Reservar via WhatsApp
                </BrandButton>
              ) : (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded text-center">
                  <p className="text-xs text-red-300 font-mono">
                    Produto temporariamente indisponível para pronta-entrega.
                  </p>
                </div>
              )}
              <p className="text-[10px] text-center text-brand-cream/40 font-mono">
                Retirada presencial na Beck Barbearia ou entrega combinada via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
