import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BrandButton } from '@/components/BrandButton';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { getAboutContent, getSiteContent } from '@/app/actions/siteContentActions';
import { whatsappLink } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sobre a Barbearia | Beck Barbearia Tradicional',
  description:
    'Conheça a história da Beck Barbearia em Balneário Arroio do Silva/SC. Tradição, toalha quente, navalha clássica e o compromisso de respeito com o cavalheiro.',
};

export default async function SobrePage() {
  const [about, site] = await Promise.all([getAboutContent(), getSiteContent()]);

  const paragraphs = (about.storyText || '')
    .split('\n\n')
    .filter((p) => p.trim().length > 0);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-black text-brand-cream pt-24 pb-20">
        {/* Cabeçalho Editorial */}
        <section className="container max-w-4xl pt-12 pb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-brand-gold/60" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
              História & Essência
            </span>
            <span className="h-px w-8 bg-brand-gold/60" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-cream">
            {about.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-brand-cream/70 max-w-2xl mx-auto font-light leading-relaxed">
            {about.subtitle}
          </p>
        </section>

        {/* Foto de Destaque do Espaço */}
        <section className="container max-w-5xl mb-16">
          <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden rounded border border-white/10 shadow-2xl bg-brand-graphite">
            <Image
              src={about.shopPhotos?.[0] || about.founderPhoto || '/images/hero-bg.webp'}
              alt="Ambiente da Beck Barbearia"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 sm:left-10 text-xs font-display uppercase tracking-widest text-brand-cream/60">
              {site.addressStreet} — {site.addressCity}/{site.addressState}
            </div>
          </div>
        </section>

        {/* Texto da História — Layout Editorial em 2 Colunas */}
        <section className="container max-w-4xl mb-20">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4 border-l-2 border-brand-gold/40 pl-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-brand-gold">
                Nosso Manifesto
              </h2>
              <p className="mt-3 text-sm italic text-brand-cream/80 leading-relaxed font-serif">
                &ldquo;{about.manifestoText}&rdquo;
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-brand-cream/50">
                Atendimento por ordem de chegada e Clube da Barba de segunda a quarta-feira.
              </div>
            </div>

            <div className="md:col-span-8 space-y-5 text-sm sm:text-base text-brand-cream/80 leading-relaxed font-light">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Seção do Fundador / Mestre Barbeiro */}
        <section className="container max-w-4xl mb-20">
          <div className="rounded border border-white/10 bg-brand-graphite/40 p-8 sm:p-12">
            <div className="grid sm:grid-cols-12 gap-8 items-center">
              <div className="sm:col-span-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded border border-brand-gold/20 shadow-xl bg-black">
                  <Image
                    src={about.founderPhoto || '/images/hero-bg-2.webp'}
                    alt={about.founderName}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="sm:col-span-7 space-y-4">
                <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-brand-gold">
                  {about.founderRole}
                </span>

                <h3 className="font-display text-2xl font-bold uppercase text-brand-cream tracking-tight">
                  {about.founderName}
                </h3>

                <p className="text-sm text-brand-cream/70 leading-relaxed font-light">
                  {about.founderBio}
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <BrandButton
                    href={whatsappLink(`Olá, ${about.founderName}! Vi o site da Beck Barbearia e gostaria de agendar um horário.`)}
                    size="sm"
                  >
                    <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />
                    Falar no WhatsApp
                  </BrandButton>

                  <BrandButton href="/#servicos" variant="outline" size="sm">
                    Ver Tabela de Serviços
                  </BrandButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galeria de Fotos do Espaço */}
        {about.shopPhotos && about.shopPhotos.length > 1 && (
          <section className="container max-w-5xl mb-20">
            <div className="text-center mb-8">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                O Espaço
              </span>
              <h3 className="font-display text-xl font-bold uppercase text-brand-cream mt-1 tracking-tight">
                Ambiente de Cavalheiro
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {about.shopPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded border border-white/10 bg-brand-graphite group"
                >
                  <Image
                    src={photo}
                    alt={`Espaço Beck Barbearia ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bloco de Encerramento */}
        <section className="container max-w-3xl text-center pt-8 border-t border-white/10">
          <h4 className="font-display text-lg font-bold uppercase tracking-wider text-brand-cream">
            {site.heroSlogan}
          </h4>
          <p className="mt-2 text-xs text-brand-cream/60">
            {site.addressStreet} — {site.addressDistrict}, {site.addressCity}/{site.addressState}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <BrandButton href="/#clube" variant="outline" size="sm">
              Conhecer o Clube da Barba
            </BrandButton>
            <BrandButton
              href={whatsappLink('Olá! Gostaria de tirar dúvidas sobre a Beck Barbearia.')}
              size="sm"
            >
              <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />
              Entrar em Contato
            </BrandButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
