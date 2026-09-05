import Image from 'next/image';
import { SectionDivider, type DividerMotif } from '@/components/SectionDivider';

interface VisualTransitionBannerProps {
  motif: DividerMotif;
  title: string;
  tagline: string;
  badge: string;
  bgImage?: string;
}

export const VisualTransitionBanner = ({
  motif,
  title,
  tagline,
  badge,
  bgImage = '/images/hero-bg.webp',
}: VisualTransitionBannerProps) => {
  return (
    <div className="relative overflow-hidden border-y border-brand-gold/30 bg-brand-charcoal py-12 sm:py-16">
      {/* Imagem de fundo com opacidade sutil e vinheta */}
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/75 to-brand-black" />
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center">
        <SectionDivider motif={motif} subtitle={badge} withGlow className="my-0 py-2" />

        <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-wider text-brand-cream sm:text-2xl md:text-3xl">
          {title}
        </h3>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-brand-cream/65 sm:text-sm">
          {tagline}
        </p>
      </div>
    </div>
  );
};

export default VisualTransitionBanner;
