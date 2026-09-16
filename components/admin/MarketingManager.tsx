'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Megaphone, Tag } from 'lucide-react';
import type { Coupon, PromotionCampaign } from '@/types';
import {
  listCouponsAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  getPromotionCampaignAction,
  updatePromotionCampaignAction,
} from '@/app/actions/marketingActions';
import { CouponModal } from '@/components/admin/CouponModal';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';
import { BrandButton } from '@/components/BrandButton';
import { formatBRL } from '@/lib/format';

export function MarketingManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [campaign, setCampaign] = useState<PromotionCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Banner de Campanha
  const [campaignTitle, setCampaignTitle] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [campaignActive, setCampaignActive] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Modal de Cupom
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Exclusão Segura
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponsData, campaignData] = await Promise.all([
        listCouponsAction(),
        getPromotionCampaignAction(),
      ]);
      setCoupons(couponsData);
      if (campaignData) {
        setCampaign(campaignData);
        setCampaignTitle(campaignData.title);
        setBannerText(campaignData.bannerText);
        setCouponCode(campaignData.couponCode || '');
        setCampaignActive(campaignData.active);
      }
    } catch (err) {
      console.error('Erro ao carregar marketing:', err);
      showFeedback('Erro ao carregar dados de marketing.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenNewCoupon = () => {
    setEditingCoupon(null);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (data: any) => {
    if (data.id) {
      const res = await updateCouponAction(data.id, data);
      if (res.ok) {
        showFeedback('Cupom atualizado com sucesso!');
        loadData();
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } else {
      const res = await createCouponAction(data);
      if (res.ok) {
        showFeedback('Cupom criado com sucesso!');
        loadData();
        return { ok: true };
      }
      return { ok: false, error: res.error };
    }
  };

  const handleRequestDelete = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCouponAction(couponToDelete.id);
      if (res.ok) {
        showFeedback('Cupom excluído com sucesso.');
        loadData();
      } else {
        showFeedback(res.error || 'Erro ao excluir cupom.', true);
      }
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
    } catch (err: any) {
      showFeedback(err?.message || 'Erro ao processar exclusão.', true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);
    try {
      const res = await updatePromotionCampaignAction({
        title: campaignTitle.trim(),
        bannerText: bannerText.trim(),
        couponCode: couponCode.trim() || undefined,
        active: campaignActive,
      });

      if (res.ok) {
        showFeedback('Campanha promocional salva com sucesso!');
        loadData();
      } else {
        showFeedback(res.error || 'Erro ao salvar campanha.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar campanha.', true);
    } finally {
      setSavingCampaign(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded text-xs font-medium border ${
            feedback.isError
              ? 'bg-red-950/80 border-red-500/40 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 1: FAIXA PROMOCIONAL NO TOPO DO SITE               */}
      {/* ======================================================== */}
      <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-brand-gold" />
              <h3 className="font-display text-base font-bold uppercase text-brand-cream tracking-wide">
                Faixa Promocional no Topo do Site
              </h3>
            </div>
            <p className="text-xs text-brand-cream/50 mt-0.5">
              Exiba avisos e campanhas no topo da Landing Page para todos os visitantes
            </p>
          </div>

          <label className="flex items-center gap-2 bg-black/60 border border-white/15 rounded px-3 py-1.5 cursor-pointer hover:border-brand-gold/50 transition">
            <input
              type="checkbox"
              checked={campaignActive}
              onChange={(e) => setCampaignActive(e.target.checked)}
              className="rounded border-white/20 bg-black text-brand-gold focus:ring-0 h-4 w-4"
            />
            <span className="text-xs text-brand-cream font-medium font-mono uppercase">
              {campaignActive ? 'Banner Ativo' : 'Banner Inativo'}
            </span>
          </label>
        </div>

        <form onSubmit={handleSaveCampaign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Etiqueta / Título *
              </label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="Ex: Oferta Especial"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Mensagem do Banner *
              </label>
              <input
                type="text"
                required
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Ex: Ganhe 10% de desconto em pomadas e óleos com o cupom!"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Cupom Vinculado
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ex: BECK10 (opcional)"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-gold font-mono font-bold uppercase focus:border-brand-gold focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/5">
            <BrandButton type="submit" disabled={savingCampaign} className="px-5 py-2 text-xs">
              {savingCampaign ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Salvando Banner...</span>
                </span>
              ) : (
                <span>Salvar Configuração do Banner</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 2: CUPONS DE DESCONTO                              */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-brand-gold" />
              <h3 className="font-display text-base font-bold uppercase text-brand-cream tracking-wide">
                Cupons de Desconto ({coupons.length})
              </h3>
            </div>
            <p className="text-xs text-brand-cream/50 mt-0.5">
              Crie códigos promocionais para novos clientes, aniversariantes ou ações da barbearia
            </p>
          </div>

          <button
            onClick={handleOpenNewCoupon}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
          >
            <Plus size={14} />
            <span>Novo Cupom</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brand-cream/40 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-brand-gold" />
            <span className="text-xs font-mono">Carregando cupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 rounded bg-black/40 border border-white/5 text-center text-xs text-brand-cream/50">
            Nenhum cupom cadastrado até o momento. Clique em &quot;Novo Cupom&quot; para criar o primeiro.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 rounded border border-white/10 bg-[#141414] hover:border-brand-gold/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-bold text-brand-gold bg-black/60 border border-brand-gold/30 px-2.5 py-1 rounded tracking-wider">
                      {coupon.code}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        coupon.active
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <p className="text-xs font-display font-semibold text-brand-cream">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% de Desconto`
                      : `${formatBRL(coupon.discountValue)} de Desconto`}
                  </p>

                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-brand-cream/50 space-y-1">
                    {coupon.validUntil && (
                      <p>Válido até: {coupon.validUntil.split('T')[0]}</p>
                    )}
                    <p>Usos registrados: {coupon.usedCount || 0} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditCoupon(coupon)}
                    className="px-2.5 py-1 rounded border border-white/10 hover:border-brand-gold/50 text-brand-cream/80 hover:text-brand-gold text-[11px] font-mono uppercase flex items-center gap-1 transition"
                  >
                    <Edit2 size={12} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleRequestDelete(coupon)}
                    className="px-2.5 py-1 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 text-[11px] font-mono uppercase flex items-center gap-1 transition"
                  >
                    <Trash2 size={12} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 4-Grid de Cupons */}
      <CouponModal
        isOpen={isCouponModalOpen}
        coupon={editingCoupon}
        onClose={() => setIsCouponModalOpen(false)}
        onSave={handleSaveCoupon}
      />

      {/* Modal Seguro de Exclusão */}
      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        itemName={couponToDelete?.code || ''}
        itemType="o cupom de desconto"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
