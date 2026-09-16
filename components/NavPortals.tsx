'use client';

import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';

export const NavPortals = () => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/assinante"
        className="flex items-center gap-1.5 rounded border border-white/10 bg-brand-graphite/60 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-brand-cream/85 transition-colors hover:border-brand-gold/60 hover:text-brand-gold"
        title="Área do Assinante do Clube da Barba"
      >
        <User size={13} className="text-brand-gold" />
        <span>Assinante</span>
      </Link>

      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded border border-white/10 bg-brand-graphite/60 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-brand-cream/85 transition-colors hover:border-brand-gold/60 hover:text-brand-gold"
        title="Acesso ao Painel da Barbearia"
      >
        <ShieldCheck size={13} className="text-brand-gold" />
        <span>Painel</span>
      </Link>
    </div>
  );
};

export default NavPortals;
