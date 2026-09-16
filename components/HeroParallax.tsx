'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DESKTOP_QUERY = '(min-width: 769px)';
const MOBILE_QUERY = '(max-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface HeroParallaxProps {
  bgImage?: string;
  logoUrl?: string;
}

/**
 * Hero Imponente & Minimalista — Estilo La Mafia / Fellow Barber.
 * Foco exclusivo na presença visual da marca: Imagem de fundo atmosférica + Logo centralizada.
 * Zero textos ou botões concorrendo com a identidade visual.
 */
export const HeroParallax = ({
  bgImage = '/images/hero-bg.webp',
  logoUrl = '/images/logo-removebg-preview.png',
}: HeroParallaxProps) => {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // 1) Entrada suave da logo
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-logo', { autoAlpha: 0, y: 30, scale: 0.95, duration: 1.4 })
        .from('.hero-scroll', { autoAlpha: 0, duration: 0.8 }, '-=0.5');

      // 2) Parallax no scroll desktop
      const mm = gsap.matchMedia(container.current ?? undefined);

      mm.add(
        {
          isDesktop: DESKTOP_QUERY,
          isMobile: MOBILE_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};
          if (!isDesktop || reduceMotion) return;

          const scrollTrigger: ScrollTrigger.Vars = {
            trigger: container.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          };

          // Fundo desliza suavemente para criar profundidade
          gsap.to('.hero-layer-bg', { yPercent: 20, scale: 1.1, ease: 'none', scrollTrigger });

          // Brilho dourado se dissipa
          gsap.to('.hero-layer-glow', { yPercent: 40, opacity: 0.1, ease: 'none', scrollTrigger });

          // Logo sobe e desaparece com elegância
          gsap.to('.hero-logo-wrap', {
            yPercent: -25,
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: { ...scrollTrigger, end: '75% top' },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      data-testid="hero-section"
      aria-label="Apresentação Beck Barbearia"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-brand-black"
    >
      {/* Camada 1 — Imagem de fundo cinematográfica */}
      <div className="hero-layer-bg absolute inset-x-0 -inset-y-[12%] will-change-transform">
        <Image
          src={bgImage || '/images/hero-bg.webp'}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/75 via-brand-black/45 to-brand-black" />
      </div>

      {/* Camada 2 — Brilho dourado sutil e vinheta */}
      <div className="hero-layer-glow pointer-events-none absolute inset-0 bg-hero-vignette will-change-transform" />

      {/* Textura de grão sutil */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />

      {/* Camada 3 — Presença central da Logo (100% limpa, sem textos ao redor) */}
      <div className="hero-logo-wrap relative z-10 flex w-full flex-col items-center px-6 py-20 text-center will-change-transform">
        <div className="hero-logo relative aspect-[536/466] w-[300px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] sm:w-[420px] md:w-[480px] lg:w-[540px]">
          <Image
            src={logoUrl || '/images/logo-removebg-preview.png'}
            alt="Beck Barbearia"
            fill
            priority
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 480px, 540px"
            className="object-contain"
          />
        </div>

        {/* Indicador sutil de rolagem */}
        <a
          href="#experiencia"
          aria-label="Rolar para os serviços"
          className="hero-scroll absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em] text-brand-cream/40 transition-colors hover:text-brand-gold"
        >
          <span className="sr-only">Rolar para baixo</span>
          <ChevronDown className="h-5 w-5 animate-bounce text-brand-gold/70" />
        </a>
      </div>
    </section>
  );
};

export default HeroParallax;
