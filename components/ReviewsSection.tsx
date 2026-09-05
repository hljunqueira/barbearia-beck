import { ExternalLink, Star } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { mapsLink } from '@/lib/site';

const REVIEWS = [
  {
    name: 'Matheus Silveira',
    role: 'Cliente há 2 anos',
    rating: 5,
    date: 'Há 1 semana',
    comment:
      'Melhor barbearia de Arroio do Silva e região! O atendimento por ordem de chegada é rápido, sem frescura. Cerveja gelada na espera e o degradê na navalha sai impecável toda vez.',
  },
  {
    name: 'Rodrigo Becker',
    role: 'Assinante do Clube da Barba',
    rating: 5,
    date: 'Há 3 semanas',
    comment:
      'O Clube da Barba de seg a qua foi a melhor coisa que inventaram. Corto toda semana e mantenho o visual alinhado gastando uma fração do que gastava avulso. Vale cada centavo.',
  },
  {
    name: 'Carlos Eduardo Ramos',
    role: 'Cliente frequente',
    rating: 5,
    date: 'Há 1 mês',
    comment:
      'O ritual da toalha quente e navalha é de outro nível. Profissionais atenciosos, ambiente muito agradável e clássico. Recomendo de olhos fechados para quem valoriza qualidade.',
  },
] as const;

export const ReviewsSection = () => (
  <section
    id="avaliacoes"
    data-testid="reviews-section"
    className="relative scroll-mt-20 border-t border-white/5 bg-brand-charcoal py-24 lg:py-32"
  >
    <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

    <div className="container relative">
      <SectionHeading
        eyebrow="Prova Social"
        title={
          <>
            Aprovado por quem{' '}
            <span className="bg-gold-gradient bg-clip-text text-transparent">exige o melhor</span>
          </>
        }
        description="Confira o que diz quem senta na nossa cadeira toda semana. Tradição, respeito e satisfação comprovada."
      />

      {/* Badge de Destaque Google */}
      <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-4 rounded-full border border-brand-gold/40 bg-brand-black/80 px-6 py-3 shadow-gold">
        <div className="flex items-center gap-1 text-brand-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
          ))}
        </div>
        <div className="h-4 w-px bg-white/20" />
        <p className="text-xs font-medium text-brand-cream">
          <strong className="font-display text-sm font-bold text-brand-gold">4.9 / 5.0</strong> no Google Avaliações
        </p>
      </div>

      {/* Grid de Avaliações */}
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {REVIEWS.map((review) => (
          <article
            key={review.name}
            className="flex flex-col justify-between rounded-xl border border-white/10 bg-brand-graphite/80 p-8 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-gold"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-brand-gold">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <span className="text-[11px] text-brand-cream/40">{review.date}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-cream/80">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/50 bg-brand-black font-display text-xs font-bold text-brand-gold">
                {review.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                  {review.name}
                </h4>
                <p className="text-[11px] text-brand-gold/70">{review.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={mapsLink()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-brand-gold transition-colors hover:text-brand-gold-light"
        >
          Ver todas as avaliações no Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  </section>
);

export default ReviewsSection;
