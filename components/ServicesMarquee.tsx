const SERVICES = [
  'Corte',
  'Barba',
  'Corte + Barba',
  'Luzes',
  'Platinado',
  'Chegou, sentou, é seu!',
  'Sem fechar ao meio-dia',
  'Clube da Barba',
] as const;

/** Faixa dourada com os serviços em rolagem contínua (CSS puro). */
export const ServicesMarquee = () => (
  <div
    aria-hidden
    className="relative overflow-hidden border-y border-brand-gold/25 bg-brand-charcoal py-4"
  >
    <div className="flex w-max animate-marquee whitespace-nowrap">
      {[...SERVICES, ...SERVICES].map((service, index) => (
        <span
          key={`${service}-${index}`}
          className="flex items-center gap-10 pr-10 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-gold/90"
        >
          {service}
          <span className="text-brand-gold/40">&#10022;</span>
        </span>
      ))}
    </div>
  </div>
);

export default ServicesMarquee;
