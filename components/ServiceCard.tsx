'use client';

import Image from 'next/image';
import { Clock, Eye, Images } from 'lucide-react';
import type { Service } from '@/types';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { BrandButton } from '@/components/BrandButton';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onOpenGallery?: () => void;
  className?: string;
}

export const ServiceCard = ({ service, onOpenGallery, className }: ServiceCardProps) => {
  const isPopular = Boolean(service.popular);
  const contactMessage = `Olá! Gostaria de agendar o serviço de *${service.name}* na Beck Barbearia.`;
  const whatsappUrl = whatsappLink(contactMessage);
  const previewImage = service.gallery?.[0]?.url ?? service.image ?? '/images/gallery/fade-navalhado.jpg';
  const photosCount = service.gallery?.length ?? 1;

  return (
    <article
      data-testid={`service-card-${service.slug}`}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-300 sm:p-6',
        'border bg-gradient-to-b backdrop-blur-sm',
        isPopular
          ? 'border-brand-gold/70 from-brand-graphite via-brand-black to-brand-black shadow-[0_8px_30px_rgba(201,162,39,0.15)] ring-1 ring-brand-gold/30 hover:border-brand-gold hover:shadow-[0_12px_40px_rgba(201,162,39,0.25)]'
          : 'border-white/10 from-brand-graphite/70 to-brand-black/90 shadow-card hover:border-brand-gold/50 hover:shadow-gold',
        className,
      )}
    >
      {/* Luz ambiente de fundo */}
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl transition-opacity duration-300',
          isPopular
            ? 'bg-brand-gold/25 opacity-100'
            : 'bg-brand-gold/10 opacity-40 group-hover:opacity-100',
        )}
      />

      {/* Linha dourada superior */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity',
          isPopular ? 'bg-gold-line opacity-100' : 'bg-gold-line opacity-40 group-hover:opacity-100',
        )}
      />

      <div>
        {/* Foto do corte com gatilho de galeria interativa ao clicar */}
        <div
          onClick={onOpenGallery}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenGallery?.();
            }
          }}
          aria-label={`Ver fotos de ${service.name}`}
          className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-brand-black transition-all duration-300 group-hover:border-brand-gold/60 focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <Image
            src={previewImage}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-black/20 to-transparent" />

          {/* Badges superiores na imagem */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-brand-black/70 px-2.5 py-1 text-[11px] font-medium text-brand-cream/90 backdrop-blur-md">
              <Clock className="h-3 w-3 text-brand-gold" />
              <span>{service.durationMinutes} min</span>
            </div>

            {service.badge && (
              <span className="rounded-full bg-gold-gradient px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-brand-black shadow-md">
                {service.badge}
              </span>
            )}
          </div>

          {/* Botão de Ver Fotos no rodapé da imagem */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/40 bg-brand-black/80 px-3 py-1.5 text-xs font-semibold text-brand-gold backdrop-blur-md transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-black group-hover:scale-105">
              <Images className="h-3.5 w-3.5" />
              <span>Ver Fotos ({photosCount})</span>
            </span>

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-black/70 text-brand-cream/80 backdrop-blur-md transition-transform group-hover:scale-110">
              <Eye className="h-3.5 w-3.5 text-brand-gold" />
            </span>
          </div>
        </div>

        {/* Título & Descrição */}
        <div className="mt-5">
          <h3
            onClick={onOpenGallery}
            className="cursor-pointer font-display text-xl font-bold uppercase tracking-wider text-brand-cream transition-colors group-hover:text-brand-gold sm:text-2xl"
          >
            {service.name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-brand-cream/70 sm:text-sm">
            {service.description}
          </p>
        </div>
      </div>

      {/* Rodapé do Card: Preço + Botão Oficial WhatsApp */}
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-brand-cream/50">
            Valor do serviço
          </span>
          <span className="font-display text-2xl font-black tracking-tight text-brand-gold sm:text-3xl">
            {formatBRL(service.priceInCents)}
          </span>
        </div>

        <BrandButton
          href={whatsappUrl}
          variant={isPopular ? 'gold' : 'outline'}
          size="full"
          className="w-full text-xs font-bold tracking-wider"
          data-testid={`service-cta-${service.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={18} className="text-[#25D366] shrink-0" />
          <span>Falar no WhatsApp</span>
        </BrandButton>
      </div>
    </article>
  );
};

export default ServiceCard;
