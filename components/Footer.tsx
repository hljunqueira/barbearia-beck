import Image from 'next/image';
import Link from 'next/link';
import { Clock, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { SITE, fullAddress, mapsLink, whatsappLink } from '@/lib/site';

interface FooterProps {
  logoUrl?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  addressText?: string;
  mapsUrl?: string | null;
  instagramUrl?: string;
  hours?: Array<{ days: string; time: string; open?: boolean }>;
}

export const Footer = ({
  logoUrl,
  whatsappNumber,
  whatsappDisplay,
  addressText,
  mapsUrl,
  instagramUrl,
  hours,
}: FooterProps) => {
  const phone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : SITE.whatsappNumber;
  const customWhatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre a Beck Barbearia.')}`;
  const displayPhone = whatsappDisplay || SITE.whatsappDisplay;
  const targetMapsUrl = mapsUrl || mapsLink();
  const address = addressText || fullAddress();
  const insta = instagramUrl || SITE.instagram;
  const activeHours = hours && hours.length > 0 ? hours : SITE.hours;

  return (
    <footer id="contato" data-testid="footer" className="relative scroll-mt-20 border-t border-white/5 bg-brand-black">
      <div className="h-px w-full bg-gold-line" />

      <div className="container grid gap-12 py-16 md:grid-cols-3">
        <div className="flex flex-col gap-5">
          <div className="relative h-24 w-28">
            <Image
              src={logoUrl || '/images/logo-removebg-preview.png'}
              alt={SITE.name}
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-brand-cream/60">{SITE.description}</p>
          <Link
            href={insta}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-cream/70 transition-colors hover:text-brand-gold"
          >
            <Instagram className="h-4 w-4" />
            @beckbarbearia
          </Link>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            <Clock className="h-4 w-4" />
            Horários
          </h3>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {activeHours.map((slot) => (
              <li key={slot.days} className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-brand-cream/70">{slot.days}</span>
                <span className="font-medium text-brand-cream">{slot.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            <MapPin className="h-4 w-4" />
            Contato
          </h3>
          <Link
            href={targetMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 block text-sm leading-relaxed text-brand-cream/70 transition-colors hover:text-brand-gold"
          >
            {address}
          </Link>
          <Link
            href={customWhatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-brand-cream/70 transition-colors hover:text-brand-gold"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp {displayPhone}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-brand-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/sobre" className="hover:text-brand-gold transition-colors">
              Sobre Nós
            </Link>
            <span>•</span>
            <Link href="/assinante" className="hover:text-brand-gold transition-colors">
              Portal do Assinante
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-brand-gold transition-colors">
              Painel da Barbearia
            </Link>
          </div>
          <p className="font-display uppercase tracking-[0.3em]">{SITE.slogans.attitude}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
