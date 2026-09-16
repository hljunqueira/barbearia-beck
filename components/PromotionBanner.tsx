'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { PromotionCampaign } from '@/types';
import { getPromotionCampaignAction } from '@/app/actions/marketingActions';

export function PromotionBanner() {
  const [campaign, setCampaign] = useState<PromotionCampaign | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const data = await getPromotionCampaignAction();
        if (data && data.active) {
          const isClosed = sessionStorage.getItem(`beck_banner_dismiss_${data.id}`);
          if (!isClosed) {
            setCampaign(data);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar banner promocional:', err);
      }
    }
    loadCampaign();
  }, []);

  if (!campaign || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (campaign?.id) {
      sessionStorage.setItem(`beck_banner_dismiss_${campaign.id}`, 'true');
    }
  };

  return (
    <div className="relative bg-[#18150e] border-b border-brand-gold/30 px-4 py-2 text-center text-xs z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 text-brand-cream pr-8">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-black/60 px-2 py-0.5 rounded border border-brand-gold/30 shrink-0">
          {campaign.title || 'Destaque'}
        </span>
        <p className="font-sans text-xs text-brand-cream/90 truncate">
          {campaign.bannerText}
        </p>
        {campaign.couponCode && (
          <span className="font-mono text-[10px] uppercase font-bold text-brand-black bg-brand-gold px-2 py-0.5 rounded shrink-0">
            Cupom: {campaign.couponCode}
          </span>
        )}
        <Link
          href="#produtos"
          className="font-mono text-[11px] uppercase tracking-wider text-brand-gold hover:text-brand-cream underline shrink-0 font-bold ml-1 transition"
        >
          Ver Produtos →
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-cream/50 hover:text-brand-cream transition"
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  );
}
