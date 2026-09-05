'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  Scissors, 
  ExternalLink,
  Crown
} from 'lucide-react';

const DEMO_SUBSCRIBERS = [
  {
    name: 'Carlos Eduardo Ramos',
    phone: '48991234567',
    plan: 'Corte + Barba',
    planBadge: 'Black',
    avatarBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    name: 'Rodrigo Silveira',
    phone: '48998765432',
    plan: 'Cabelo',
    planBadge: 'Cabelo',
    avatarBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Marcos Vinicius Lima',
    phone: '48984112233',
    plan: 'Barba',
    planBadge: 'Barba',
    avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
];

export const NavPortals = () => {
  const [openMenu, setOpenMenu] = useState<'subscriber' | 'admin' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLoginAsSubscriber = (phone: string) => {
    localStorage.setItem('beck_subscriber_phone', phone);
    setOpenMenu(null);
    window.location.href = `/assinante?phone=${phone}`;
  };

  const handleLoginAsAdmin = () => {
    sessionStorage.setItem('beck_admin_auth', 'true');
    setOpenMenu(null);
    window.location.href = '/admin?demo=true';
  };

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {/* MENU 1: Área do Assinante */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === 'subscriber' ? null : 'subscriber')}
          className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
            openMenu === 'subscriber'
              ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
              : 'border-white/10 bg-brand-graphite/60 text-brand-cream/90 hover:border-brand-gold/50 hover:text-brand-gold'
          }`}
          aria-expanded={openMenu === 'subscriber'}
          aria-label="Abrir menu Área do Assinante com contas demo"
        >
          <User size={13} className="text-brand-gold" />
          <span>Área do Assinante</span>
          <span className="rounded bg-brand-gold/20 px-1 py-0.2 text-[9px] text-brand-gold font-mono">Demo</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${openMenu === 'subscriber' ? 'rotate-180 text-brand-gold' : 'text-brand-cream/40'}`}
          />
        </button>

        {openMenu === 'subscriber' && (
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-sm border border-brand-gold/30 bg-[#121212]/95 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-brand-gold" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                  Portal do Assinante
                </span>
              </div>
              <span className="text-[10px] text-brand-cream/40 font-mono">Seg a Qua</span>
            </div>

            <p className="text-[11px] text-brand-cream/60 mb-2 leading-tight">
              Selecione uma conta demo para entrar automaticamente:
            </p>

            <div className="space-y-1.5 mb-2.5">
              {DEMO_SUBSCRIBERS.map((sub) => (
                <button
                  key={sub.phone}
                  type="button"
                  onClick={() => handleLoginAsSubscriber(sub.phone)}
                  className="w-full flex items-center justify-between rounded border border-white/5 bg-white/[0.03] p-2 text-left transition hover:border-brand-gold/40 hover:bg-brand-gold/10 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded flex items-center justify-center border text-xs font-bold shrink-0 ${sub.avatarBg}`}>
                      {sub.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-brand-cream truncate group-hover:text-brand-gold transition-colors">
                        {sub.name}
                      </p>
                      <p className="text-[10px] text-brand-cream/50">
                        {sub.plan}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded shrink-0">
                    Entrar ⚡
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <Link
                href="/assinante"
                onClick={() => setOpenMenu(null)}
                className="text-[11px] text-brand-cream/70 hover:text-brand-gold flex items-center gap-1 transition"
              >
                <span>Tela inicial de login</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* MENU 2: Portal Barbearia (Admin) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === 'admin' ? null : 'admin')}
          className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
            openMenu === 'admin'
              ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
              : 'border-white/10 bg-brand-graphite/60 text-brand-cream/90 hover:border-brand-gold/50 hover:text-brand-gold'
          }`}
          aria-expanded={openMenu === 'admin'}
          aria-label="Abrir menu Portal Barbearia com conta demo"
        >
          <ShieldCheck size={13} className="text-brand-gold" />
          <span>Portal Barbearia</span>
          <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-brand-cream/70 font-mono">Admin</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${openMenu === 'admin' ? 'rotate-180 text-brand-gold' : 'text-brand-cream/40'}`}
          />
        </button>

        {openMenu === 'admin' && (
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-sm border border-brand-gold/30 bg-[#121212]/95 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Scissors size={14} className="text-brand-gold" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                  Painel da Barbearia
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Gestão Clube</span>
            </div>

            <p className="text-[11px] text-brand-cream/60 mb-2.5 leading-tight">
              Acesse o painel para gerenciar os planos, assinantes e agendamentos semanais da barbearia:
            </p>

            <button
              type="button"
              onClick={handleLoginAsAdmin}
              className="w-full flex items-center justify-between rounded border border-brand-gold/40 bg-brand-gold/10 p-2.5 text-left transition hover:bg-brand-gold/20 group mb-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-brand-gold text-brand-black flex items-center justify-center font-bold text-xs shrink-0">
                  ADM
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-cream group-hover:text-brand-gold transition-colors">
                    Acesso Rápido Admin Demo
                  </p>
                  <p className="text-[10px] text-brand-cream/60">
                    PIN <code className="text-brand-gold">beck2026</code> pré-autenticado
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-brand-black bg-brand-gold font-bold px-2 py-1 rounded shrink-0">
                Acessar ⚡
              </span>
            </button>

            <div className="space-y-1 text-[10px] text-brand-cream/50 bg-white/[0.02] p-2 rounded border border-white/5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                <span>Gestão completa de 4 assinantes demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                <span>Agenda Seg a Qua com aprovação/conclusão</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                <span>Cadastro de novos membros do clube</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <Link
                href="/admin"
                onClick={() => setOpenMenu(null)}
                className="text-[11px] text-brand-cream/70 hover:text-brand-gold flex items-center gap-1 transition"
              >
                <span>Tela inicial de senha</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
