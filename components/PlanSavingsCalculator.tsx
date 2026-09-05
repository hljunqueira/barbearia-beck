'use client';

import { useState } from 'react';
import { Calculator, CheckCircle2, Flame, TrendingDown } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { BrandButton } from '@/components/BrandButton';
import { cn } from '@/lib/utils';

type ServiceType = 'corte' | 'barba' | 'combo';

interface OptionConfig {
  label: string;
  singlePriceInCents: number;
  clubPriceInCents: number;
  planName: string;
}

const OPTIONS: Record<ServiceType, OptionConfig> = {
  corte: {
    label: 'Corte de Cabelo',
    singlePriceInCents: 3500, // R$ 35,00
    clubPriceInCents: 7990, // R$ 79,90
    planName: 'Cortes Ilimitados',
  },
  barba: {
    label: 'Barba Alinhada',
    singlePriceInCents: 3000, // R$ 30,00
    clubPriceInCents: 6990, // R$ 69,90
    planName: 'Barbas Ilimitadas',
  },
  combo: {
    label: 'Corte + Barba',
    singlePriceInCents: 6000, // R$ 60,00
    clubPriceInCents: 14990, // R$ 149,90
    planName: 'Cortes + Barba Ilimitados',
  },
};

const FREQUENCIES = [
  { times: 2, label: '2x por mês', subtitle: 'A cada 15 dias' },
  { times: 3, label: '3x por mês', subtitle: 'A cada 10 dias' },
  { times: 4, label: '4x por mês', subtitle: '1x por semana' },
];

export const PlanSavingsCalculator = () => {
  const [selectedType, setSelectedType] = useState<ServiceType>('corte');
  const [selectedFreq, setSelectedFreq] = useState<number>(3);

  const config = OPTIONS[selectedType];
  const singleMonthlyTotal = config.singlePriceInCents * selectedFreq;
  const clubMonthlyTotal = config.clubPriceInCents;
  const monthlySavings = Math.max(0, singleMonthlyTotal - clubMonthlyTotal);
  const yearlySavings = monthlySavings * 12;
  const percentSaved = Math.round((monthlySavings / singleMonthlyTotal) * 100);

  const ctaMessage = `Olá! Calculei no site que cortando ${selectedFreq}x ao mês no ${config.planName} posso economizar ${formatBRL(monthlySavings)} por mês. Gostaria de assinar!`;

  return (
    <div
      data-testid="savings-calculator"
      className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-brand-gold/40 bg-gradient-to-b from-brand-graphite via-brand-black to-brand-graphite p-6 shadow-gold-lg sm:p-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-vignette opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-line" />

      <div className="relative text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/50 bg-brand-black/80 px-4 py-1 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">
          <Calculator className="h-3.5 w-3.5" />
          Simulador de Economia
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-brand-cream sm:text-3xl">
          Quanto você <span className="bg-gold-gradient bg-clip-text text-transparent">economiza</span> no Clube?
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-brand-cream/65">
          Veja a diferença real no bolso entre pagar avulso a cada visita e ter atendimento ilimitado de segunda a quarta.
        </p>
      </div>

      <div className="relative mt-8 grid gap-8 md:grid-cols-2 md:items-center">
        {/* Controles */}
        <div className="space-y-6">
          <div>
            <label className="block font-display text-xs font-semibold uppercase tracking-wider text-brand-gold">
              1. Escolha o serviço
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(Object.keys(OPTIONS) as ServiceType[]).map((key) => {
                const opt = OPTIONS[key];
                const active = selectedType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedType(key)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 text-center transition-all',
                      active
                        ? 'border-brand-gold bg-brand-gold/15 text-brand-gold shadow-gold'
                        : 'border-white/10 bg-brand-black/60 text-brand-cream/70 hover:border-white/30',
                    )}
                  >
                    <p className="font-display text-xs font-bold uppercase tracking-wider">
                      {key === 'combo' ? 'Corte + Barba' : key === 'corte' ? 'Corte' : 'Barba'}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-cream/50">{formatBRL(opt.singlePriceInCents)} avulso</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-display text-xs font-semibold uppercase tracking-wider text-brand-gold">
              2. Quantas vezes você visita no mês?
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {FREQUENCIES.map((freq) => {
                const active = selectedFreq === freq.times;
                return (
                  <button
                    key={freq.times}
                    type="button"
                    onClick={() => setSelectedFreq(freq.times)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 text-center transition-all',
                      active
                        ? 'border-brand-gold bg-brand-gold/15 text-brand-gold shadow-gold'
                        : 'border-white/10 bg-brand-black/60 text-brand-cream/70 hover:border-white/30',
                    )}
                  >
                    <p className="font-display text-xs font-bold uppercase tracking-wider">{freq.label}</p>
                    <p className="mt-1 text-[10px] text-brand-cream/50">{freq.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quadro Comparativo */}
        <div className="relative rounded-xl border border-brand-gold/50 bg-brand-black/90 p-6 text-center shadow-gold">
          <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5 text-left">
            <div>
              <p className="text-xs text-brand-cream/50">Pagando avulso ({selectedFreq}x):</p>
              <p className="mt-1 font-display text-lg font-semibold text-brand-cream/80 line-through">
                {formatBRL(singleMonthlyTotal)}/mês
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-gold font-semibold">No {config.planName}:</p>
              <p className="mt-1 font-display text-xl font-bold text-brand-gold">
                {formatBRL(clubMonthlyTotal)}/mês
              </p>
            </div>
          </div>

          <div className="py-6">
            {monthlySavings > 0 ? (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Economia de {percentSaved}% todo mês
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest text-brand-cream/60">Você economiza:</p>
                  <p className="mt-1 font-display text-4xl font-extrabold text-emerald-400 sm:text-5xl">
                    {formatBRL(monthlySavings)}
                    <span className="text-base font-normal text-brand-cream/60"> /mês</span>
                  </p>
                  <p className="mt-2 text-xs text-brand-cream/60">
                    Equivale a <strong className="text-brand-gold">{formatBRL(yearlySavings)}</strong> de economia no ano!
                  </p>
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="font-display text-sm font-semibold text-brand-cream">
                  Mesmo valor de 2 cortes avulsos!
                </p>
                <p className="mt-1 text-xs text-brand-cream/60">
                  A partir da 3ª ida no mês, todos os cortes saem totalmente de graça!
                </p>
              </div>
            )}
          </div>

          <BrandButton href={whatsappLink(ctaMessage)} size="full" className="w-full">
            <Flame className="h-4 w-4" />
            Garantir Minha Economia no WhatsApp
          </BrandButton>
        </div>
      </div>
    </div>
  );
};

export default PlanSavingsCalculator;
