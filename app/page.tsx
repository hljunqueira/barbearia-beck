import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, Coffee, Flame, Scissors, ArrowRight } from 'lucide-react';
import { getPlanRules, getPlans } from '@/app/actions/getPlans';
import { getServices } from '@/app/actions/getServices';
import { getProducts } from '@/app/actions/getProducts';
import { getSiteContent, getAboutContent } from '@/app/actions/siteContentActions';
import { listBarbersAction } from '@/app/actions/barberActions';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';
import HeroParallax from '@/components/HeroParallax';
import { PromotionBanner } from '@/components/PromotionBanner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServicesMarquee } from '@/components/ServicesMarquee';
import { SectionHeading } from '@/components/SectionHeading';
import { PlanCard } from '@/components/PlanCard';
import { PlanRules } from '@/components/PlanRules';
import { ProductsCatalog } from '@/components/ProductsCatalog';
import { ReviewsSection } from '@/components/ReviewsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { ServicePriceList } from '@/components/ServicePriceList';
import { OpeningHours } from '@/components/OpeningHours';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

const DEFAULT_EXPERIENCE_ICONS = [Scissors, Flame, Coffee, CalendarCheck];

const FALLBACK_EXPERIENCE_ITEMS = [
  {
    title: 'Barbeiros especialistas',
    text: 'Técnica clássica e tendências atuais, executadas com precisão.',
  },
  {
    title: 'Toalha quente & navalha',
    text: 'O ritual tradicional de barba, do jeito que tem que ser.',
  },
  {
    title: 'Conforto na espera',
    text: 'Sofá, TV e bebida gelada enquanto chega a sua vez.',
  },
  {
    title: 'Ordem de chegada & Clube',
    text: 'Sem burocracia: chegou, sentou, é seu. E sem fechar ao meio-dia.',
  },
];

/**
 * Página inicial — Server Component oficial da Beck Barbearia.
 * Conectado 100% ao PostgreSQL Supabase. Zero mocks em memória.
 */
const App = async () => {
  const [plans, planRules, services, products, siteContent, aboutContent, barbers] = await Promise.all([
    getPlans(),
    getPlanRules(),
    getServices(),
    getProducts(),
    getSiteContent(),
    getAboutContent(),
    listBarbersAction().catch(() => []),
  ]);

  const activeBarbers = barbers.filter((b) => b.active);

  const experienceList =
    siteContent?.experienceItemsJson && siteContent.experienceItemsJson.length > 0
      ? siteContent.experienceItemsJson
      : FALLBACK_EXPERIENCE_ITEMS;

  const fullAddress = `${siteContent?.addressStreet || 'Avenida Barriga Verde, 300'}, ${siteContent?.addressDistrict || 'Centro'} - ${siteContent?.addressCity || 'Balneário Arroio do Silva'}/${siteContent?.addressState || 'SC'}`;

  return (
    <>
      {/* Banner de Campanhas & Cupons de Topo */}
      <PromotionBanner />

      <Navbar
        logoUrl={siteContent?.logoUrl}
        whatsappNumber={siteContent?.whatsappNumber}
      />

      <main className="relative bg-brand-black text-brand-cream">
        {/* Hero com parallax e logotipo dinâmico do CMS */}
        <HeroParallax
          bgImage={siteContent?.heroImage}
          logoUrl={siteContent?.logoUrl}
        />

        {/* Faixa Marquee */}
        <ServicesMarquee />

        {/* A Experiência Beck */}
        <section
          id="experiencia"
          data-testid="experience-section"
          className="relative scroll-mt-20 overflow-hidden py-24 lg:py-32"
        >
          <div className="container grid items-center gap-16 lg:grid-cols-2">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded border border-brand-gold/20 shadow-card">
                <Image
                  src={siteContent?.experiencePhoto || aboutContent?.founderPhoto || '/images/hero-bg-2.webp'}
                  alt="Beck Barbearia — Tradição e Excelência"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden rounded border border-brand-gold/40 bg-brand-black px-8 py-6 shadow-gold md:block lg:-right-8">
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
                    {siteContent?.experienceTitle || 'Mais que um corte, um ritual'}
                  </>
                }
                description={
                  siteContent?.experienceDescription ||
                  'Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença. Aqui, cada visita é um momento seu.'
                }
              />

              <ul className="mt-12 grid gap-8 sm:grid-cols-2">
                {experienceList.map((item, index) => {
                  const IconComponent = DEFAULT_EXPERIENCE_ICONS[index % DEFAULT_EXPERIENCE_ICONS.length] || Scissors;

                  return (
                    <li key={`${item.title}-${index}`} className="flex gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-brand-gold/40 bg-brand-graphite text-brand-gold">
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-cream">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-brand-cream/60">{item.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* Seção Institucional: História & Barbearia (Integrada) */}
        {aboutContent && (
          <section
            id="sobre"
            data-testid="about-section"
            className="relative scroll-mt-20 border-t border-white/5 bg-[#0e0e0e] py-20 lg:py-28"
          >
            <div className="container">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span className="font-mono text-xs uppercase tracking-widest text-brand-gold block font-semibold">
                  Nossa Identidade &amp; História
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase text-brand-cream leading-tight">
                  {aboutContent.title || 'Tradição, Navalha & Respeito ao Cavalheiro'}
                </h2>
                <p className="text-sm sm:text-base text-brand-cream/70 leading-relaxed font-sans">
                  {aboutContent.subtitle}
                </p>
              </div>

              <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-3">
                  <h3 className="font-display text-sm font-bold uppercase text-brand-gold tracking-wider">
                    Como Nascemos
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed whitespace-pre-line">
                    {aboutContent.storyText}
                  </p>
                </div>

                <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase text-brand-gold tracking-wider">
                      Nosso Manifesto
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed whitespace-pre-line">
                      {aboutContent.manifestoText}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    {aboutContent.founderPhoto && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-brand-gold/40 shrink-0 bg-black">
                        <Image
                          src={aboutContent.founderPhoto}
                          alt={aboutContent.founderName || 'Fundador'}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-display text-xs font-bold uppercase text-brand-cream">
                        {aboutContent.founderName}
                      </p>
                      <p className="text-[11px] font-mono text-brand-gold">
                        {aboutContent.founderRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipe & Mestres Barbeiros */}
              {activeBarbers.length > 0 && (
                <div className="mt-16 pt-12 border-t border-white/10 max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-gold block font-semibold">
                      Mestres da Navalha
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-brand-cream mt-1">
                      Nossa Equipe de Barbeiros
                    </h3>
                    <p className="text-xs text-brand-cream/60 mt-1">
                      Conheça os profissionais por trás de cada atendimento de respeito.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {activeBarbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="rounded border border-white/10 bg-[#141414] p-5 hover:border-brand-gold/40 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-gold/30 bg-black shrink-0 flex items-center justify-center">
                              {barber.photoUrl && barber.photoUrl !== '/images/barber-1.webp' ? (
                                <Image
                                  src={barber.photoUrl}
                                  alt={barber.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="font-display text-lg font-bold text-brand-gold">
                                  {barber.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold block">
                                {barber.role}
                              </span>
                              <h4 className="font-display text-base font-bold text-brand-cream truncate">
                                {barber.name}
                              </h4>
                              {barber.phone && (
                                <p className="text-[11px] font-mono text-brand-cream/50 mt-0.5">
                                  {barber.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {barber.bio && (
                            <p className="mt-4 pt-3 border-t border-white/5 text-xs text-brand-cream/70 leading-relaxed line-clamp-4 font-light">
                              {barber.bio}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <BrandButton
                            href={whatsappLink(
                              `Olá, ${barber.name}! Vi seu perfil na Beck Barbearia e gostaria de agendar um horário.`,
                              barber.phone ?? undefined
                            )}
                            size="sm"
                            className="text-[11px] py-1.5 px-3"
                          >
                            <WhatsAppIcon size={14} className="text-[#25D366] shrink-0" />
                            <span>WhatsApp</span>
                          </BrandButton>

                          <Link
                            href="/sobre"
                            className="text-[11px] font-mono text-brand-cream/60 hover:text-brand-gold transition underline"
                          >
                            Ver Trajetória Completa &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
              <ServicePriceList services={services} />
              <OpeningHours
                hours={siteContent?.hoursJson || undefined}
                walkInTitle={siteContent?.walkInTitle}
                walkInSubtitle={siteContent?.walkInSubtitle}
                mapsUrl={siteContent?.mapsUrl}
                fullAddressText={fullAddress}
              />
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
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  whatsappNumber={siteContent?.whatsappNumber}
                />
              ))}
            </div>

            <PlanRules
              rules={planRules.rules}
              notice={{
                title: siteContent?.noticeTitle || planRules.notice.title,
                text: siteContent?.noticeText || planRules.notice.text,
              }}
            />

            <p className="mt-12 text-center font-display text-xs uppercase tracking-[0.3em] text-brand-gold/70">
              {siteContent?.heroSubtitle || SITE.slogans.attitude}
            </p>
          </div>
        </section>

        {/* Catálogo de Produtos Oficiais */}
        <section
          id="produtos"
          data-testid="products-section"
          className="relative scroll-mt-20 border-t border-white/5 bg-brand-black py-24 lg:py-32"
        >
          <div className="container relative">
            <SectionHeading
              eyebrow="Linha Exclusiva"
              title={
                <>
                  Produtos para{' '}
                  <span className="bg-gold-gradient bg-clip-text text-transparent">cabelo e barba</span>
                </>
              }
              description="Pomadas de alta fixação, óleos nutritivos com fragrâncias nobres e balms para manter seu alinhamento em casa."
            />

            <div className="mt-16">
              <ProductsCatalog products={products} />
            </div>
          </div>
        </section>

        {/* Prova Social / Avaliações */}
        <ReviewsSection
          googleRating={siteContent?.googleRating}
          googleReviewsCount={siteContent?.googleReviewsCount}
          reviews={siteContent?.reviewsJson || undefined}
          mapsUrl={siteContent?.mapsUrl}
        />
      </main>

      <Footer
        logoUrl={siteContent?.logoUrl}
        whatsappNumber={siteContent?.whatsappNumber}
        whatsappDisplay={siteContent?.whatsappDisplay}
        addressText={fullAddress}
        mapsUrl={siteContent?.mapsUrl}
        instagramUrl={siteContent?.instagramUrl}
        hours={siteContent?.hoursJson || undefined}
      />
      <FloatingWhatsApp whatsappNumber={siteContent?.whatsappNumber} />
    </>
  );
};

export default App;
