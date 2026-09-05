import Image from 'next/image';
import { CalendarCheck, Coffee, Flame, Scissors } from 'lucide-react';
import { getPlanRules, getPlans } from '@/app/actions/getPlans';
import { getServices } from '@/app/actions/getServices';
import HeroParallax from '@/components/HeroParallax';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServicesMarquee } from '@/components/ServicesMarquee';
import { SectionHeading } from '@/components/SectionHeading';
import { PlanCard } from '@/components/PlanCard';
import { PlanRules } from '@/components/PlanRules';
import { ReviewsSection } from '@/components/ReviewsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { ServicePriceList } from '@/components/ServicePriceList';
import { OpeningHours } from '@/components/OpeningHours';
import { SITE } from '@/lib/site';

const EXPERIENCE_ITEMS = [
  {
    icon: Scissors,
    title: 'Barbeiros especialistas',
    text: 'Técnica clássica e tendências atuais, executadas com precisão.',
  },
  {
    icon: Flame,
    title: 'Toalha quente & navalha',
    text: 'O ritual tradicional de barba, do jeito que tem que ser.',
  },
  {
    icon: Coffee,
    title: 'Conforto na espera',
    text: 'Sofá, TV e bebida gelada enquanto chega a sua vez.',
  },
  {
    icon: CalendarCheck,
    title: 'Ordem de chegada',
    text: 'Sem burocracia: chegou, sentou, é seu. E sem fechar ao meio-dia.',
  },
] as const;

/**
 * Página inicial — Server Component.
 * Arquitetura sóbria, elegante e sem excessos (estilo La Mafia Barbearia / Fellow Barber).
 */
const App = async () => {
  const [plans, planRules, services] = await Promise.all([
    getPlans(),
    getPlanRules(),
    getServices(),
  ]);

  return (
    <>
      <Navbar />

      <main className="relative bg-brand-black text-brand-cream">
        {/* Hero 100% limpo com foto atmosférica e logo centralizada */}
        <HeroParallax />

        {/* Faixa Marquee sutil */}
        <ServicesMarquee />

        {/* A Experiência */}
        <section
          id="experiencia"
          data-testid="experience-section"
          className="relative scroll-mt-20 overflow-hidden py-24 lg:py-32"
        >
          <div className="container grid items-center gap-16 lg:grid-cols-2">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-brand-gold/20 shadow-card">
                <Image
                  src="/images/hero-bg-2.webp"
                  alt="Interior da Beck Barbearia com cadeira clássica de couro"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden rounded-lg border border-brand-gold/40 bg-brand-black px-8 py-6 shadow-gold md:block lg:-right-8">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                  Beck
                </p>
                <p className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-brand-cream">
                  Tradição &amp; Estilo
                </p>
              </div>
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="A experiência Beck"
                title={
                  <>
                    Mais que um corte,{' '}
                    <span className="bg-gold-gradient bg-clip-text text-transparent">um ritual</span>
                  </>
                }
                description="Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença. Aqui, cada visita é um momento seu."
              />

              <ul className="mt-12 grid gap-8 sm:grid-cols-2">
                {EXPERIENCE_ITEMS.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-brand-gold/40 bg-brand-graphite text-brand-gold">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-cream">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-cream/60">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Serviços & Horários */}
        <section
          id="servicos"
          data-testid="services-section"
          className="relative scroll-mt-20 border-y border-white/5 bg-brand-charcoal py-24 lg:py-32"
        >
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
          <div className="container relative">
            <SectionHeading
              eyebrow="Serviços & Horários"
              title={
                <>
                  Tabela de{' '}
                  <span className="bg-gold-gradient bg-clip-text text-transparent">serviços</span>
                </>
              }
              description="Preços transparentes e atendimento por ordem de chegada. Venha no seu horário: chegou, sentou, é seu."
            />

            <div className="mt-16 space-y-16">
              {/* Cards modernos de serviços com fotos reais e galeria ao clicar */}
              <ServicePriceList services={services} />

              {/* Painel executivo de horários de funcionamento e localização */}
              <OpeningHours />
            </div>
          </div>
        </section>

        {/* Clube da Barba */}
        <section
          id="clube"
          data-testid="plans-section"
          className="relative scroll-mt-20 border-t border-white/5 bg-brand-charcoal/40 py-24 lg:py-32"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gold-line" />

          <div className="container relative">
            <SectionHeading
              eyebrow="Clube da Barba"
              title={
                <>
                  Planos mensais para manter o{' '}
                  <span className="bg-gold-gradient bg-clip-text text-transparent">visual impecável</span>
                </>
              }
              description="Economia todo mês, atendimento prioritário e condições exclusivas. Pacotes válidos por 30 dias, com uso de segunda a quarta-feira."
            />

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <PlanRules rules={planRules.rules} notice={planRules.notice} />

            <p className="mt-12 text-center font-display text-xs uppercase tracking-[0.3em] text-brand-gold/70">
              {SITE.slogans.attitude}
            </p>
          </div>
        </section>

        {/* Prova Social / Depoimentos Google */}
        <ReviewsSection />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </>
  );
};

export default App;
