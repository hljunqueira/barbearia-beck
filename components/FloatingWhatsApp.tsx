'use client';

import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { SITE, whatsappLink } from '@/lib/site';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export const FloatingWhatsApp = ({ whatsappNumber }: FloatingWhatsAppProps) => {
  const phone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : SITE.whatsappNumber;
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    'Olá! Gostaria de tirar uma dúvida sobre o atendimento na Beck Barbearia.',
  )}`;

  return (
    <aside aria-label="Atendimento rápido WhatsApp" className="fixed bottom-6 right-6 z-40">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        data-testid="floating-whatsapp-btn"
        className="group flex items-center gap-3 rounded-full border border-brand-gold/60 bg-brand-black/90 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(201,162,39,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-108 hover:border-brand-gold hover:shadow-gold-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
        aria-label="Falar com o barbeiro no WhatsApp"
      >
        {/* Ponto indicador de status online */}
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>

        {/* Texto exibido no hover (desktop) ou permanente em telas médias */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xs font-bold uppercase tracking-wider text-brand-cream transition-all duration-300 group-hover:max-w-xs sm:max-w-xs">
          Falar com Barbeiro
        </span>

        {/* Ícone oficial do WhatsApp */}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
          <WhatsAppIcon size={18} className="text-white fill-white" />
        </span>
      </a>
    </aside>
  );
};

export default FloatingWhatsApp;
