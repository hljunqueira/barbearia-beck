'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Coupon } from '@/types';
import { BrandButton } from '@/components/BrandButton';

interface CouponModalProps {
  isOpen: boolean;
  coupon?: Coupon | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses?: number;
    validUntil?: string;
    active: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function CouponModal({
  isOpen,
  coupon,
  onClose,
  onSave,
}: CouponModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValueStr, setDiscountValueStr] = useState('10');
  const [maxUsesStr, setMaxUsesStr] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValueStr(
        coupon.discountType === 'percentage'
          ? String(coupon.discountValue)
          : (coupon.discountValue / 100).toFixed(2).replace('.', ',')
      );
      setMaxUsesStr(coupon.maxUses ? String(coupon.maxUses) : '');
      setValidUntil(coupon.validUntil ? coupon.validUntil.split('T')[0] : '');
      setActive(coupon.active);
    } else {
      setCode('');
      setDiscountType('percentage');
      setDiscountValueStr('10');
      setMaxUsesStr('');
      setValidUntil('');
      setActive(true);
    }
    setError(null);
  }, [coupon, isOpen]);

  // Fechar com ESC
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

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length < 3) {
      setError('O código do cupom deve ter pelo menos 3 caracteres.');
      return;
    }

    let calculatedDiscountValue = 0;
    if (discountType === 'percentage') {
      const p = parseFloat(discountValueStr.replace(',', '.'));
      if (isNaN(p) || p <= 0 || p > 100) {
        setError('A porcentagem de desconto deve ser entre 1% e 100%.');
        return;
      }
      calculatedDiscountValue = p;
    } else {
      const cents = parseMoneyToCents(discountValueStr);
      if (cents <= 0) {
        setError('O valor fixo de desconto deve ser maior que zero.');
        return;
      }
      calculatedDiscountValue = cents;
    }

    const maxUses = maxUsesStr.trim() ? parseInt(maxUsesStr, 10) : undefined;

    setSaving(true);
    try {
      const res = await onSave({
        id: coupon?.id,
        code: cleanCode,
        discountType,
        discountValue: calculatedDiscountValue,
        maxUses,
        validUntil: validUntil.trim() || undefined,
        active,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao salvar cupom.');
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
      {/* Backdrop 100% Sólido */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !saving && onClose()}
      />

      {/* Container do Modal 4-Grid */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Marketing &amp; Fidelização
            </p>
            <h2 className="font-display text-lg font-bold text-brand-cream uppercase tracking-wide">
              {coupon ? 'Editar Cupom de Desconto' : 'Novo Cupom de Desconto'}
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
          {/* GRID 4 COLUNAS: Linha 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Código do Cupom (col-span-2) */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Código do Cupom *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: BECK10, CLIENTEVIP"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-gold font-mono font-bold tracking-wider uppercase focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Tipo de Desconto */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Tipo de Desconto *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            {/* Valor do Desconto */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                {discountType === 'percentage' ? 'Desconto (%) *' : 'Desconto (R$) *'}
              </label>
              <input
                type="text"
                required
                value={discountValueStr}
                onChange={(e) => setDiscountValueStr(e.target.value)}
                placeholder={discountType === 'percentage' ? '15' : '20,00'}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>
          </div>

          {/* GRID 3 COLUNAS: Limite de Usos, Validade e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Limite de Usos */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Limite de Usos
              </label>
              <input
                type="number"
                min={1}
                value={maxUsesStr}
                onChange={(e) => setMaxUsesStr(e.target.value)}
                placeholder="Ilimitado"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Válido Até
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            {/* Status Ativo */}
            <div className="flex flex-col justify-end">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 bg-black/70 border border-white/15 rounded px-3 py-2 cursor-pointer hover:border-brand-gold/50 transition">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-white/20 bg-black text-brand-gold focus:ring-0 h-4 w-4"
                />
                <span className="text-xs text-brand-cream font-medium">Cupom Ativo</span>
              </label>
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
                <span>{coupon ? 'Salvar Cupom' : 'Criar Cupom'}</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
