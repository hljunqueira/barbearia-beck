'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, User, ShieldCheck, Crown, Scissors, ExternalLink } from 'lucide-react';
import { BrandButton } from '@/components/BrandButton';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { NavPortals } from '@/components/NavPortals';
import { whatsappLink } from '@/lib/site';

const NAV_LINKS = [
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Clube', href: '/#clube' },
  { label: 'Avaliações', href: '/#avaliacoes' },
  { label: 'Dúvidas', href: '/#duvidas' },
] as const;

const MOBILE_DEMO_SUBSCRIBERS = [
  {
    name: 'Carlos Eduardo Ramos',
    phone: '48991234567',
    plan: 'Corte + Barba (Black)',
  },
  {
    name: 'Rodrigo Silveira',
    phone: '48998765432',
    plan: 'Cabelo',
  },
  {
    name: 'Marcos Vinicius Lima',
    phone: '48984112233',
    plan: 'Barba',
  },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileSubscriberLogin = (phone: string) => {
    localStorage.setItem('beck_subscriber_phone', phone);
    setMobileMenuOpen(false);
    window.location.href = `/assinante?phone=${phone}`;
  };

  const handleMobileAdminLogin = () => {
    sessionStorage.setItem('beck_admin_auth', 'true');
    setMobileMenuOpen(false);
    window.location.href = '/admin?demo=true';
  };

  return (
    <header
      data-testid="navbar"
      className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-brand-black/90 backdrop-blur-md"
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Beck Barbearia — início"
          className="relative h-14 w-16 transition-transform hover:scale-105"
        >
          <Image
            src="/images/logo-removebg-preview.png"
            alt="Beck Barbearia"
            fill
            sizes="64px"
            priority
            className="object-contain"
          />
        </Link>

        {/* Links de navegação desktop */}
        <nav aria-label="Navegação principal" className="hidden items-center gap-7 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cream/70 transition-colors hover:text-brand-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Portais com contas demos + CTA WhatsApp (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <NavPortals />

          <BrandButton
            href={whatsappLink('Olá! Quero mais informações sobre a Beck Barbearia.')}
            size="sm"
            data-testid="nav-cta"
          >
            <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />
            WhatsApp
          </BrandButton>
        </div>

        {/* Botão Mobile Menu Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-brand-graphite/80 text-brand-cream hover:border-brand-gold/60 hover:text-brand-gold transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Drawer / Dropdown Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0e0e0e]/98 backdrop-blur-xl px-4 py-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Navegação institucional */}
          <nav className="flex flex-col gap-3 pb-5 border-b border-white/10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream/80 hover:text-brand-gold transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Seção 1: Área do Assinante com Demo */}
          <div className="pt-4 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-brand-gold" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Área do Assinante
                </span>
              </div>
              <span className="text-[10px] bg-brand-gold/20 text-brand-gold font-mono px-1.5 py-0.5 rounded">
                Demos Seg-Qua
              </span>
            </div>
            <p className="text-[11px] text-brand-cream/60 mb-3">
              Toque para entrar como um cliente assinante:
            </p>

            <div className="space-y-1.5">
              {MOBILE_DEMO_SUBSCRIBERS.map((sub) => (
                <button
                  key={sub.phone}
                  type="button"
                  onClick={() => handleMobileSubscriberLogin(sub.phone)}
                  className="w-full flex items-center justify-between rounded border border-white/10 bg-brand-graphite/70 p-2.5 text-left active:bg-brand-gold/20"
                >
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-brand-gold" />
                    <div>
                      <p className="text-xs font-medium text-brand-cream">{sub.name}</p>
                      <p className="text-[10px] text-brand-cream/50">{sub.plan}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-1 rounded">
                    Entrar ⚡
                  </span>
                </button>
              ))}
            </div>

            <Link
              href="/assinante"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-brand-cream/70 hover:text-brand-gold"
            >
              <span>Abrir tela inicial do assinante</span>
              <ExternalLink size={11} />
            </Link>
          </div>

          {/* Seção 2: Portal Barbearia (Admin) */}
          <div className="pt-4 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scissors size={15} className="text-brand-gold" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Portal Barbearia (Admin)
                </span>
              </div>
              <span className="text-[10px] bg-white/10 text-brand-cream/70 font-mono px-1.5 py-0.5 rounded">
                PIN: beck2026
              </span>
            </div>
            <p className="text-[11px] text-brand-cream/60 mb-3">
              Gestão de assinantes, agenda semanal e novos cadastros:
            </p>

            <button
              type="button"
              onClick={handleMobileAdminLogin}
              className="w-full flex items-center justify-between rounded border border-brand-gold/50 bg-brand-gold/15 p-3 text-left active:bg-brand-gold/25"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-gold" />
                <div>
                  <p className="text-xs font-bold text-brand-cream">Acesso Rápido Admin Demo</p>
                  <p className="text-[10px] text-brand-cream/60">Entra autenticado no painel</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-brand-gold text-brand-black px-2 py-1 rounded">
                Entrar ⚡
              </span>
            </button>
          </div>

          {/* Botão WhatsApp */}
          <div className="pt-4">
            <BrandButton
              href={whatsappLink('Olá! Quero mais informações sobre a Beck Barbearia.')}
              size="full"
              className="w-full justify-center"
            >
              <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />
              Falar no WhatsApp
            </BrandButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
