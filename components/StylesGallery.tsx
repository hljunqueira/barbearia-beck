import Image from 'next/image';
import { SectionHeading } from '@/components/SectionHeading';
import { whatsappLink } from '@/lib/site';

interface GalleryItem {
  id: string;
  title: string;
  categoryLabel: string;
  image: string;
}

const ITEMS: GalleryItem[] = [
  {
    id: 'fade',
    title: 'Degradê Navalhado (Skin Fade)',
    categoryLabel: 'Corte',
    image: '/images/gallery/fade-navalhado.jpg',
  },
  {
    id: 'barba',
    title: 'Barba Terapia Tradicional',
    categoryLabel: 'Barba & Ritual',
    image: '/images/gallery/barba-ritual.jpg',
  },
  {
    id: 'platinado',
    title: 'Platinado Global & Matização',
    categoryLabel: 'Química',
    image: '/images/gallery/platinado.jpg',
  },
  {
    id: 'classico',
    title: 'Corte Social & Pompadour Clássico',
    categoryLabel: 'Clássico',
    image: '/images/gallery/corte-classico.webp',
  },
];

export const StylesGallery = () => {
  return (
    <section
      id="galeria"
      data-testid="styles-gallery-section"
      className="relative scroll-mt-20 py-24 lg:py-32"
    >
      <div className="container relative">
        <SectionHeading
          eyebrow="Portfólio"
          title={
            <>
              O padrão de acabamento{' '}
              <span className="bg-gold-gradient bg-clip-text text-transparent">Beck Barbearia</span>
            </>
          }
          description="Trabalhos executados na nossa cadeira. Da navalha afiada ao degradê moderno."
        />

        {/* Grid de Fotos Limpo */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={whatsappLink(`Olá! Vi o estilo "${item.title}" no site e gostaria de fazer esse corte.`)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-brand-graphite/60 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-gold/60 hover:shadow-gold"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-black">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-80" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">
                    {item.categoryLabel}
                  </span>
                  <h3 className="mt-1 font-display text-sm font-semibold leading-snug text-brand-cream">
                    {item.title}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StylesGallery;
