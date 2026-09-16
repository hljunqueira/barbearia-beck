'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, LogOut, Shield } from 'lucide-react';
import { BarbersManager } from '@/components/admin/BarbersManager';

export default function AdminBarbeirosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('beck_admin_auth');
      const user = sessionStorage.getItem('beck_admin_user');
      if (user) setCurrentUser(user);

      if (auth === 'true') {
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('beck_admin_auth');
    sessionStorage.removeItem('beck_admin_user');
    setIsAuthenticated(false);
    window.location.href = '/admin';
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-brand-gold">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4 text-brand-cream">
        <div className="max-w-md w-full rounded-2xl border border-brand-gold/30 bg-brand-graphite p-8 text-center shadow-card">
          <Shield className="mx-auto h-12 w-12 text-brand-gold" />
          <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-wider text-brand-cream">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-xs text-brand-cream/60">
            Você precisa estar autenticado no painel administrativo para gerenciar a equipe de barbeiros.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-block w-full rounded bg-brand-gold py-3 text-xs font-bold uppercase tracking-wider font-display text-brand-black hover:bg-brand-gold-light transition"
          >
            Fazer Login no Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black font-sans text-brand-cream selection:bg-brand-gold selection:text-brand-black">
      {/* Header do Painel */}
      <header className="border-b border-white/10 bg-brand-graphite/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-brand-cream/70 hover:text-brand-gold transition"
              title="Voltar ao Painel Geral"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Painel Geral</span>
            </Link>

            <span className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="relative h-9 w-10">
                <Image
                  src="/images/logo-removebg-preview.png"
                  alt="Beck Barbearia"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-cream">
                  Gestão de Barbeiros
                </h1>
                <p className="text-[10px] text-brand-cream/50 font-mono">
                  Beck Barbearia • Equipe
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border border-white/10 rounded px-2.5 py-1 bg-white/5">
              <div className="h-5 w-5 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-[10px] text-brand-gold font-bold">
                {currentUser.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-brand-cream/80 font-medium">{currentUser}</span>
            </div>

            <Link
              href="/admin"
              className="px-3 py-1.5 text-xs text-brand-cream/80 hover:text-brand-gold border border-white/10 rounded bg-white/5 transition"
            >
              Ver Todas as Abas
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded hover:bg-red-950/40 transition"
              title="Sair da conta"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container py-8 sm:py-10">
        <BarbersManager />
      </main>
    </div>
  );
}
