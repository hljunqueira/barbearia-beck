'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Product, ProductCategory } from '@/types';
import { BrandButton } from '@/components/BrandButton';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    category: ProductCategory;
    description: string;
    priceInCents: number;
    compareAtPriceInCents?: number | null;
    imageUrl: string;
    inStock: boolean;
    stockQuantity: number;
    minStockAlert: number;
    showOnHome: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function ProductModal({
  isOpen,
  product,
  onClose,
  onSave,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('pomada');
  const [description, setDescription] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [comparePriceStr, setComparePriceStr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [minStockAlert, setMinStockAlert] = useState(2);
  const [showOnHome, setShowOnHome] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description || '');
      setPriceStr((product.priceInCents / 100).toFixed(2).replace('.', ','));
      setComparePriceStr(
        product.compareAtPriceInCents
          ? (product.compareAtPriceInCents / 100).toFixed(2).replace('.', ',')
          : ''
      );
      setImageUrl(product.imageUrl || '');
      setInStock(product.inStock ?? true);
      setStockQuantity(product.stockQuantity ?? 10);
      setMinStockAlert(product.minStockAlert ?? 2);
      setShowOnHome(product.showOnHome ?? true);
    } else {
      setName('');
      setCategory('pomada');
      setDescription('');
      setPriceStr('');
      setComparePriceStr('');
      setImageUrl('/images/pomada.webp');
      setInStock(true);
      setStockQuantity(10);
      setMinStockAlert(2);
      setShowOnHome(true);
    }
    setError(null);
  }, [product, isOpen]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const parseMoneyToCents = (val: string): number => {
    const clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Informe um nome válido para o produto.');
      return;
    }

    const priceInCents = parseMoneyToCents(priceStr);
    if (priceInCents <= 0) {
      setError('O preço de venda deve ser maior que zero.');
      return;
    }

    const compareAtPriceInCents = comparePriceStr.trim()
      ? parseMoneyToCents(comparePriceStr)
      : null;

    if (!imageUrl.trim()) {
      setError('Envie uma foto para o produto.');
      return;
    }

    setSaving(true);
    try {
      const res = await onSave({
        id: product?.id,
        name: name.trim(),
        category,
        description: description.trim(),
        priceInCents,
        compareAtPriceInCents,
        imageUrl: imageUrl.trim(),
        inStock: stockQuantity > 0 && inStock,
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        showOnHome,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao salvar produto.');
        setSaving(false);
      } else {
        setSaving(false);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Falha inesperada ao salvar.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop 100% Sólido/Opaco */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !saving && onClose()}
      />

      {/* Container do Modal 4-Grid */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10 custom-scrollbar">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Gestão de Catálogo & Estoque
            </p>
            <h2 className="font-display text-lg font-bold text-brand-cream uppercase tracking-wide">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GRID 4 COLUNAS: Informações Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nome (ocupa 2 colunas) */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pomada Matte Efeito Seco 100g"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              >
                <option value="pomada">Pomada</option>
                <option value="oleo">Óleo</option>
                <option value="balm">Balm</option>
                <option value="kit">Kit / Barba</option>
              </select>
            </div>

            {/* Exibir na Home Switch */}
            <div className="flex flex-col justify-end">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Visibilidade
              </label>
              <label className="flex items-center gap-2 bg-black/70 border border-white/15 rounded px-3 py-2 cursor-pointer hover:border-brand-gold/50 transition">
                <input
                  type="checkbox"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="rounded border-white/20 bg-black text-brand-gold focus:ring-0 h-4 w-4"
                />
                <span className="text-xs text-brand-cream font-medium">Exibir na Home</span>
              </label>
            </div>
          </div>

          {/* GRID 4 COLUNAS: Preços & Controle de Estoque Numérico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Preço de Venda */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="text"
                required
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="45,00"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Preço Comparativo De/Por */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Preço De/Por (R$)
              </label>
              <input
                type="text"
                value={comparePriceStr}
                onChange={(e) => setComparePriceStr(e.target.value)}
                placeholder="55,00 (opcional)"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Quantidade em Estoque */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Estoque (Unidades) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stockQuantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value, 10) || 0;
                  setStockQuantity(q);
                  if (q === 0) setInStock(false);
                  else setInStock(true);
                }}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Alerta de Estoque Mínimo */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Aviso Mínimo *
              </label>
              <input
                type="number"
                min={1}
                required
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>
          </div>

          {/* GRID: Descrição & Upload Real da Foto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Descrição Completa */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Descrição & Benefícios *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a fixação, acabamento, fragrância e modo de uso para o cliente na Landing Page..."
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
              />
            </div>

            {/* Upload de Foto Real via Supabase */}
            <div>
              <ImageUploadField
                label="Foto do Produto (Supabase Storage)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                aspectRatio="square"
                helpText="Selecione uma imagem de alta resolução. O arquivo será otimizado e persistido no bucket beck-media."
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/60 hover:text-brand-cream hover:bg-white/5 rounded border border-white/10 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <BrandButton type="submit" disabled={saving} className="px-5 py-2 text-xs">
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Salvando...</span>
                </span>
              ) : (
                <span>{product ? 'Salvar Alterações' : 'Criar Produto'}</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
