import { Check, Minus } from 'lucide-react';
import type { BillingCycle, Plan } from '@/types';
import { cn } from '@/lib/utils';
import { splitPrice } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { BrandButton } from '@/components/BrandButton';

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'mês',
  quarterly: 'trimestre',
  yearly: 'ano',
};

interface PlanCardProps {
  plan: Plan;
}

export const PlanCard = ({ plan }: PlanCardProps) => {
  const { integer, decimal } = splitPrice(plan.priceInCents);

  // TODO(karfex): substituir por createCheckoutSession({ planId: plan.karfexPlanId })
  const subscribeHref = whatsappLink(`Olá! Quero assinar o ${plan.name} da Beck Barbearia.`);

  return (
    <article
      data-testid={`plan-card-${plan.slug}`}
      className={cn(
        'relative flex h-full flex-col rounded-lg border bg-brand-graphite/80 p-8 shadow-card backdrop-blur-sm transition-all duration-500',
        plan.highlighted
          ? 'border-brand-gold/70 shadow-gold-lg lg:-translate-y-4'
          : 'border-white/10 hover:-translate-y-1 hover:border-brand-gold/40',
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-gold-gradient px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-brand-black shadow-gold">
          {plan.badge}
        </span>
      )}

      <header>
        <h3 className="font-display text-xl font-semibold uppercase tracking-wider text-brand-cream">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-cream/60">{plan.tagline}</p>
      </header>

      <div className="mt-8 flex items-end gap-1.5">
        <span className="mb-2 font-display text-sm font-semibold text-brand-gold">R$</span>
        <span className="font-display text-5xl font-bold leading-none text-brand-cream">{integer}</span>
        <span className="mb-1 font-display text-xl text-brand-cream/80">,{decimal}</span>
        <span className="mb-1 text-sm text-brand-cream/50">/{CYCLE_LABEL[plan.billingCycle]}</span>
      </div>

      <div className="my-8 h-px w-full bg-gold-line" />

      <ul className="flex flex-col gap-3.5 text-sm">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={cn(
              'flex items-start gap-3 leading-snug',
              feature.included ? 'text-brand-cream/85' : 'text-brand-cream/35 line-through',
            )}
          >
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" strokeWidth={2.5} />
            ) : (
              <Minus className="mt-0.5 h-4 w-4 shrink-0 text-brand-cream/30" />
            )}
            {feature.label}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10">
        <BrandButton
          href={subscribeHref}
          variant={plan.highlighted ? 'gold' : 'outline'}
          size="full"
          data-testid={`plan-cta-${plan.slug}`}
        >
          Assinar plano
        </BrandButton>

        <div className="mt-3 text-center">
          <a
            href="/assinante"
            className="text-[11px] font-medium text-brand-cream/60 hover:text-brand-gold transition-colors"
          >
            Já é assinante? Agendar horário →
          </a>
        </div>
      </div>
    </article>
  );
};

export default PlanCard;
