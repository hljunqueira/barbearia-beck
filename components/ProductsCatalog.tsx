'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import type { Product, ProductCategory } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';

type ProductTab = 'cosmetics' | 'beverages' | 'all';

interface ProductsCatalogProps {
  products: Product[];
  limit?: number;
  showViewAll?: boolean;
  defaultTab?: ProductTab;
  allowCategoryFilter?: boolean;
  allowSearch?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  pomada: 'Pomadas',
  oleo: 'Óleos',
  balm: 'Balms',
  kit: 'Kits & Cuidados',
  cerveja: 'Cervejas',
  energetico: 'Energéticos',
  refrigerante: 'Refrigerantes',
  agua: 'Água',
  destilado: 'Destilados',
};

export function ProductsCatalog({
  products,
  limit,
  showViewAll = false,
  defaultTab = 'cosmetics',
  allowCategoryFilter = false,
  allowSearch = false,
}: ProductsCatalogProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<ProductTab>(defaultTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cosmeticsCount = useMemo(
    () => products.filter((p) => p.productType !== 'beverage').length,
    [products]
  );

  const beveragesCount = useMemo(
    () => products.filter((p) => p.productType === 'beverage').length,
    [products]
  );

  // Filtra produtos de acordo com a aba, busca e categoria
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de aba principal
      if (activeTab === 'cosmetics' && product.productType === 'beverage') {
        return false;
      }
      if (activeTab === 'beverages' && product.productType !== 'beverage') {
        return false;
      }

      // Filtro de categoria
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Filtro de busca textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchCat = product.category.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery]);

  // Categorias disponíveis para a aba atual
  const availableCategories = useMemo(() => {
    const tabProducts = products.filter((p) => {
      if (activeTab === 'cosmetics') return p.productType !== 'beverage';
      if (activeTab === 'beverages') return p.productType === 'beverage';
      return true;
    });

    const catSet = new Set<string>();
    tabProducts.forEach((p) => catSet.add(p.category));
    return Array.from(catSet);
  }, [products, activeTab]);

  // Se limite estiver ativo (ex: Home), aplica o slice
  const displayedProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

  if (!products || products.length === 0) {
    return (
      <div className="p-12 text-center text-xs font-mono text-brand-cream/50 border border-white/5 rounded-lg bg-black/40">
        Nenhum produto cadastrado no momento.
      </div>
    );
  }

  return (
    <div>
      {/* Abas Principais: Cabelo & Barba / Bebidas & Bar / Todos */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        <button
          type="button"
          onClick={() => {
            setActiveTab('cosmetics');
            setSelectedCategory('all');
          }}
          className={`px-5 py-2.5 rounded font-display text-xs uppercase tracking-wider font-semibold transition-all duration-200 border ${
            activeTab === 'cosmetics'
              ? 'bg-brand-gold text-brand-black border-brand-gold shadow-gold/20'
              : 'bg-[#141414] text-brand-cream/70 border-white/10 hover:border-brand-gold/40 hover:text-brand-cream'
          }`}
        >
          <span>Cabelo &amp; Barba</span>
          <span
            className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
              activeTab === 'cosmetics'
                ? 'bg-brand-black/20 text-brand-black font-bold'
                : 'bg-white/5 text-brand-gold'
            }`}
          >
            {cosmeticsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('beverages');
            setSelectedCategory('all');
          }}
          className={`px-5 py-2.5 rounded font-display text-xs uppercase tracking-wider font-semibold transition-all duration-200 border ${
            activeTab === 'beverages'
              ? 'bg-brand-gold text-brand-black border-brand-gold shadow-gold/20'
              : 'bg-[#141414] text-brand-cream/70 border-white/10 hover:border-brand-gold/40 hover:text-brand-cream'
          }`}
        >
          <span>Bebidas &amp; Bar</span>
          <span
            className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
              activeTab === 'beverages'
                ? 'bg-brand-black/20 text-brand-black font-bold'
                : 'bg-white/5 text-brand-gold'
            }`}
          >
            {beveragesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('all');
          }}
          className={`px-5 py-2.5 rounded font-display text-xs uppercase tracking-wider font-semibold transition-all duration-200 border ${
            activeTab === 'all'
              ? 'bg-brand-gold text-brand-black border-brand-gold shadow-gold/20'
              : 'bg-[#141414] text-brand-cream/70 border-white/10 hover:border-brand-gold/40 hover:text-brand-cream'
          }`}
        >
          <span>Todos os Itens</span>
          <span
            className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
              activeTab === 'all'
                ? 'bg-brand-black/20 text-brand-black font-bold'
                : 'bg-white/5 text-brand-gold'
            }`}
          >
            {products.length}
          </span>
        </button>
      </div>

      {/* Barra de Busca & Subcategorias (Quando ativados para catálogo completo) */}
      {(allowSearch || (allowCategoryFilter && availableCategories.length > 1)) && (
        <div className="mb-8 max-w-2xl mx-auto space-y-4">
          {allowSearch && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cream/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, marca ou categoria..."
                className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-xs text-brand-cream placeholder:text-brand-cream/40 focus:border-brand-gold focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream/40 hover:text-brand-cream transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {allowCategoryFilter && availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition border ${
                  selectedCategory === 'all'
                    ? 'border-brand-gold/60 text-brand-gold bg-brand-gold/10 font-semibold'
                    : 'border-white/5 text-brand-cream/60 hover:text-brand-cream bg-white/5'
                }`}
              >
                Todas as categorias
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono transition border ${
                    selectedCategory === cat
                      ? 'border-brand-gold/60 text-brand-gold bg-brand-gold/10 font-semibold'
                      : 'border-white/5 text-brand-cream/60 hover:text-brand-cream bg-white/5'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grade de Produtos */}
      {displayedProducts.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-brand-cream/50 border border-white/5 rounded-lg bg-black/40">
          Nenhum item encontrado nesta seleção.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>
      )}

      {/* Botão Ver Todos (Exibido na Home para direcionar para /produtos) */}
      {showViewAll && (
        <div className="mt-14 flex flex-col items-center justify-center gap-3">
          <Link
            href="/produtos"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded border border-brand-gold/50 bg-[#141414] text-brand-cream hover:bg-brand-gold hover:text-brand-black transition-all duration-300 font-display text-xs uppercase tracking-[0.2em] font-semibold group shadow-lg shadow-black/50 hover:shadow-brand-gold/20"
          >
            <span>Ver Catálogo Completo &amp; Bar</span>
            <ArrowRight
              size={14}
              className="text-brand-gold group-hover:text-brand-black transition-transform group-hover:translate-x-1"
            />
          </Link>
          <p className="text-[11px] font-mono text-brand-cream/50">
            {products.length} itens disponíveis para consumo no local ou retirada
          </p>
        </div>
      )}

      {/* Modal Amplo e Sóbrio de Detalhes do Produto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
