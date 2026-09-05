'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import type { Service } from '@/types';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';

interface ServiceGalleryModalProps {
  service: Service | null;
  onClose: () => void;
}

export const ServiceGalleryModal = ({ service, onClose }: ServiceGalleryModalProps) => {
  const [photoIndex, setPhotoIndex] = useState(0);

  // Resetar índice ao trocar de serviço
  useEffect(() => {
    setPhotoIndex(0);
  }, [service]);

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (service) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [service, onClose]);

  if (!service) return null;

  const gallery = service.gallery && service.gallery.length > 0
    ? service.gallery
    : [
        {
          url: service.image ?? '/images/hero-bg-2.webp',
          title: service.name,
          description: service.description,
        },
      ];

  const currentPhoto = gallery[photoIndex] ?? gallery[0];
  const hasMultiplePhotos = gallery.length > 1;

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const whatsappMessage = `Olá! Vi o serviço de *${service.name}* no site da Beck Barbearia e gostaria de fazer esse estilo (${currentPhoto.title}).`;
  const whatsappUrl = whatsappLink(whatsappMessage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos — ${service.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop com blur escuro */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Conteúdo do Modal */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-gold/40 bg-brand-graphite shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gold-gradient" />

        {/* Topo do Modal */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold uppercase tracking-wider text-brand-cream sm:text-lg">
                  {service.name}
                </span>
                {service.badge && (
                  <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-brand-black">
                    {service.badge}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-cream/60">
                <Clock className="h-3 w-3 text-brand-gold" />
                <span>{service.durationMinutes} min de atendimento</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar galeria"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-brand-black/60 text-brand-cream/70 transition-colors hover:border-brand-gold hover:text-brand-gold focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Área da Imagem / Foto do Corte */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-black sm:aspect-[16/10]">
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.title}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-80" />

          {/* Navegação entre fotos se houver mais de 1 */}
          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-brand-black/70 text-brand-cream shadow-lg backdrop-blur-sm transition-all hover:border-brand-gold hover:text-brand-gold hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-brand-black/70 text-brand-cream shadow-lg backdrop-blur-sm transition-all hover:border-brand-gold hover:text-brand-gold hover:scale-110"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Indicadores de bolinhas */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-brand-black/60 px-3 py-1.5 backdrop-blur-sm">
                {gallery.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoIndex(idx)}
                    aria-label={`Ir para foto ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === photoIndex ? 'w-6 bg-brand-gold' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Legenda sobreposta na imagem */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h4 className="font-display text-base font-bold uppercase tracking-wide text-brand-cream sm:text-lg">
              {currentPhoto.title}
            </h4>
            {currentPhoto.description && (
              <p className="mt-1 text-xs text-brand-cream/80 sm:text-sm">
                {currentPhoto.description}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé com Preço e Botão Oficial WhatsApp */}
        <div className="relative flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-brand-black/80 px-6 py-4 sm:flex-row">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-cream/50">
              Valor do serviço
            </span>
            <span className="font-display text-2xl font-black text-brand-gold sm:text-3xl">
              {formatBRL(service.priceInCents)}
            </span>
          </div>

          <BrandButton
            href={whatsappUrl}
            variant="gold"
            size="md"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <WhatsAppIcon size={18} className="text-[#25D366] fill-[#25D366]" />
            <span className="text-brand-black font-bold">Falar com Barbeiro no WhatsApp</span>
          </BrandButton>
        </div>
      </div>
    </div>
  );
};

export default ServiceGalleryModal;
