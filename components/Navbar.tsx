'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, User, ShieldCheck } from 'lucide-react';
import { BrandButton } from '@/components/BrandButton';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { NavPortals } from '@/components/NavPortals';
import { whatsappLink } from '@/lib/site';

const NAV_LINKS = [
  { label: 'Sobre', href: '/sobre' },
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Clube', href: '/#clube' },
  { label: 'Produtos', href: '/#produtos' },
  { label: 'Avaliações', href: '/#avaliacoes' },
  { label: 'Dúvidas', href: '/#duvidas' },
] as const;

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      data-testid="navbar"
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-black/95 backdrop-blur-md"
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
        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
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

        {/* Portais + CTA WhatsApp (Desktop) */}
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

      {/* Drawer Mobile Limpo e Sem Cara de IA */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0e0e0e]/98 backdrop-blur-xl px-5 py-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Navegação institucional */}
          <nav className="flex flex-col gap-3 pb-5 border-b border-white/10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream/80 hover:text-brand-gold transition py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Portais de Acesso */}
          <div className="py-5 border-b border-white/10 space-y-3">
            <Link
              href="/assinante"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded border border-white/10 bg-brand-graphite/60 hover:border-brand-gold/50 transition"
            >
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-brand-gold" />
                <div>
                  <p className="text-xs font-semibold text-brand-cream uppercase tracking-wider font-display">
                    Área do Assinante
                  </p>
                  <p className="text-[10px] text-brand-cream/50">Agendamentos de Seg a Qua</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded">
                Acessar
              </span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded border border-white/10 bg-brand-graphite/60 hover:border-brand-gold/50 transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-brand-gold" />
                <div>
                  <p className="text-xs font-semibold text-brand-cream uppercase tracking-wider font-display">
                    Painel da Barbearia
                  </p>
                  <p className="text-[10px] text-brand-cream/50">Gestão e Painel Administrativo</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase text-brand-cream/70 border border-white/20 px-2 py-0.5 rounded">
                Entrar
              </span>
            </Link>
          </div>

          {/* Botão WhatsApp */}
          <div className="pt-5">
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
