import { CalendarCheck, CalendarRange, CircleDollarSign, Lock, type LucideIcon } from 'lucide-react';
import type { PlanRule, PlanRuleIcon } from '@/types';

const ICONS: Record<PlanRuleIcon, LucideIcon> = {
  calendar: CalendarCheck,
  payment: CircleDollarSign,
  lock: Lock,
  weekdays: CalendarRange,
};

interface PlanRulesProps {
  rules: readonly PlanRule[];
  notice: { readonly title: string; readonly text: string };
}

/** Bloco "Como funciona" + aviso de validade (flyer do Clube). */
export const PlanRules = ({ rules, notice }: PlanRulesProps) => (
  <div data-testid="plan-rules" className="mx-auto mt-16 max-w-5xl">
    <p className="mb-6 flex items-center justify-center gap-4 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-gold">
      <span className="h-px w-8 bg-brand-gold/60" />
      Como funciona
      <span className="h-px w-8 bg-brand-gold/60" />
    </p>

    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {rules.map((rule) => {
        const Icon = ICONS[rule.icon];

        return (
          <li
            key={rule.id}
            className="rounded-lg border border-white/10 bg-brand-graphite/70 p-5 text-center transition-colors hover:border-brand-gold/40"
          >
            <Icon className="mx-auto h-6 w-6 text-brand-gold" />
            <h4 className="mt-3 font-display text-xs font-semibold uppercase tracking-wider text-brand-cream">
              {rule.title}
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-cream/55">{rule.description}</p>
          </li>
        );
      })}
    </ul>

    <div
      data-testid="plan-validity-notice"
      className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-red-500/60 bg-red-950/30 px-6 py-5 text-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.45)] sm:flex-row sm:justify-center sm:gap-5 sm:text-left"
    >
      <CalendarCheck className="h-8 w-8 shrink-0 text-red-400" />
      <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-cream sm:text-base">
        <span className="text-red-400">{notice.title}:</span> {notice.text}
      </p>
    </div>
  </div>
);

export default PlanRules;
