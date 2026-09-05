'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import type { Appointment, AppointmentStatus, Subscription, SubscriptionStatus } from '@/types';
import {
  createSubscription,
  listAppointments,
  listSubscriptions,
  updateAppointmentStatus,
  updateSubscriptionStatus,
} from '@/app/actions/subscriptionActions';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';
import { BarberAgenda } from '@/components/admin/BarberAgenda';

const ADMIN_PIN = 'beck2026';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Dados
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'appointments'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');

  // Modal Novo Assinante
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'corte' | 'barba' | 'corte-barba'>('corte-barba');
  const [creating, setCreating] = useState(false);

  // Persistência de autenticação simples de sessão ou via query param (?demo=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo') || params.get('auth');
      if (demo === 'true' || demo === 'beck2026') {
        sessionStorage.setItem('beck_admin_auth', 'true');
        setIsAuthenticated(true);
        loadData();
        return;
      }
      const auth = sessionStorage.getItem('beck_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
        loadData();
      }
    }
  }, []);

  const loadData = async () => {
    const [subs, apts] = await Promise.all([listSubscriptions(), listAppointments()]);
    setSubscriptions(subs);
    setAppointments(apts);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('beck_admin_auth', 'true');
      setAuthError(false);
      loadData();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('beck_admin_auth');
  };

  // Métricas
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalMRR = activeSubs.reduce((acc, curr) => acc + curr.priceInCents, 0);
  const confirmedApts = appointments.filter((a) => a.status === 'confirmed');

  // Filtro de assinaturas
  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerPhone.includes(searchQuery) ||
      s.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: SubscriptionStatus) => {
    await updateSubscriptionStatus(id, newStatus);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
  };

  const handleAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(id, newStatus);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    setCreating(true);
    const planPrices = {
      'corte-barba': 15990,
      corte: 9990,
      barba: 8990,
    };
    const planNames = {
      'corte-barba': 'Corte + Barba',
      corte: 'Cabelo',
      barba: 'Barba',
    };

    const newSub = await createSubscription({
      customerName: newName,
      customerPhone: newPhone,
      customerEmail: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@cliente.com`,
      planSlug: newPlan,
      planName: planNames[newPlan],
      priceInCents: planPrices[newPlan],
      status: 'active',
    });

    setSubscriptions((prev) => [newSub, ...prev]);
    setCreating(false);
    setIsModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  // TELA DE AUTENTICAÇÃO DO ADMIN
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black p-4 font-sans text-brand-cream selection:bg-brand-gold selection:text-brand-black">
        <div className="w-full max-w-sm rounded-2xl border border-brand-gold/40 bg-brand-graphite/90 p-8 shadow-card backdrop-blur-md">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold bg-brand-black text-brand-gold shadow-gold">
              <Lock className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-brand-cream">
              Painel Barbearia
            </h1>
            <p className="mt-1 text-xs text-brand-cream/60">
              Acesso restrito à equipe Beck Barbearia
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                Senha Master
              </label>
              <input
                type="password"
                required
                placeholder="Digite a senha (padrão: beck2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-brand-black px-4 py-2.5 text-sm text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
              />
              {authError && (
                <p className="mt-2 text-xs font-medium text-red-400">
                  Senha incorreta. Tente novamente ou use &quot;beck2026&quot;.
                </p>
              )}
            </div>

            <BrandButton type="submit" variant="gold" size="full">
              Entrar no Painel
            </BrandButton>

            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-brand-cream/50 hover:text-brand-gold">
                ← Voltar para o Site
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black font-sans text-brand-cream selection:bg-brand-gold selection:text-brand-black">
      {/* Topo do Painel */}
      <header className="border-b border-white/10 bg-brand-graphite/50 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-removebg-preview.png"
              alt="Beck Barbearia"
              width={46}
              height={40}
              className="object-contain"
            />
            <div>
              <span className="font-display text-sm font-black uppercase tracking-wider text-brand-cream">
                Beck Barbearia
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                Painel Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden font-display text-xs uppercase tracking-wider text-brand-cream/60 hover:text-brand-gold sm:inline"
            >
              Ver Site ↗
            </Link>
            <Link
              href="/assinante"
              target="_blank"
              className="hidden font-display text-xs uppercase tracking-wider text-brand-gold hover:underline sm:inline"
            >
              Portal do Assinante ↗
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-brand-black px-3 py-1.5 text-xs text-brand-cream/80 hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* CARDS DE MÉTRICAS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-gold/30 bg-brand-graphite/70 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream/70">
                Assinantes Ativos
              </span>
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-black text-brand-cream">{activeSubs.length}</p>
            <p className="mt-1 text-[11px] text-brand-cream/50">Clientes com plano em dia</p>
          </div>

          <div className="rounded-xl border border-brand-gold/30 bg-brand-graphite/70 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream/70">
                Receita Mensal (MRR)
              </span>
              <DollarSign className="h-5 w-5 text-brand-gold" />
            </div>
            <p className="mt-3 font-display text-3xl font-black text-brand-gold">
              {formatBRL(totalMRR)}
            </p>
            <p className="mt-1 text-[11px] text-brand-cream/50">Receita recorrente garantida</p>
          </div>

          <div className="rounded-xl border border-brand-gold/30 bg-brand-graphite/70 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-cream/70">
                Agendamentos da Semana
              </span>
              <CalendarCheck2 className="h-5 w-5 text-brand-gold" />
            </div>
            <p className="mt-3 font-display text-3xl font-black text-brand-cream">
              {confirmedApts.length}
            </p>
            <p className="mt-1 text-[11px] text-brand-cream/50">Segunda a Quarta-feira</p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="mt-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-brand-gold text-brand-black shadow-gold'
                  : 'bg-brand-graphite/50 text-brand-cream/70 hover:text-brand-cream'
              }`}
            >
              Assinaturas ({subscriptions.length})
            </button>
                 <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'appointments'
                  ? 'bg-brand-gold text-brand-black shadow-gold'
                  : 'bg-brand-graphite/50 text-brand-cream/70 hover:text-brand-cream'
              }`}
            >
              Agenda Profissional ({appointments.length})
            </button>
          </div>

          {activeTab === 'subscriptions' && (
            <BrandButton
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Assinante Manual</span>
            </BrandButton>
          )}
        </div>

        {/* ABA 1: GESTÃO DE ASSINATURAS */}
        {activeTab === 'subscriptions' && (
          <div className="mt-6 space-y-4">
            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-cream/40" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-brand-black py-2.5 pl-10 pr-4 text-xs text-brand-cream placeholder-brand-cream/40 focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Filtro de Status */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-gold" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-white/10 bg-brand-black px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativos</option>
                  <option value="pending">Pendentes</option>
                  <option value="canceled">Cancelados</option>
                </select>
              </div>
            </div>

            {/* Tabela de Assinaturas */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-brand-graphite/40">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-brand-black/60 font-display uppercase tracking-wider text-brand-cream/50">
                  <tr>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Contato</th>
                    <th className="px-5 py-3">Plano</th>
                    <th className="px-5 py-3">Valor</th>
                    <th className="px-5 py-3">Renovação</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-brand-black/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-brand-cream">
                        {sub.customerName}
                      </td>

                      <td className="px-5 py-4">
                        <div>{sub.customerPhone}</div>
                        <div className="text-[11px] text-brand-cream/50">{sub.customerEmail}</div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-brand-gold">{sub.planName}</td>

                      <td className="px-5 py-4 font-display font-bold text-brand-cream">
                        {formatBRL(sub.priceInCents)}
                      </td>

                      <td className="px-5 py-4 text-brand-cream/70">
                        {new Date(sub.nextBillingDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase ${
                            sub.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                              : sub.status === 'pending'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                              : 'bg-red-950/60 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {sub.status === 'active'
                            ? 'Ativo'
                            : sub.status === 'pending'
                            ? 'Pendente'
                            : 'Cancelado'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {sub.status !== 'active' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(sub.id, 'active')}
                              className="rounded border border-emerald-500/30 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/50"
                            >
                              Ativar
                            </button>
                          )}
                          {sub.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(sub.id, 'canceled')}
                              className="rounded border border-red-500/30 px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-950/50"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: AGENDA PROFISSIONAL COMPLETA COM CRUD */}
        {activeTab === 'appointments' && (
          <div className="mt-6">
            <BarberAgenda
              initialAppointments={appointments}
              subscriptions={subscriptions}
              onAppointmentsChange={(updated) => setAppointments(updated)}
            />
          </div>
        )}

        {/* MODAL: NOVO ASSINANTE MANUAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-brand-gold/40 bg-brand-graphite p-6 shadow-2xl sm:p-8 animate-in zoom-in-95">
              <h3 className="font-display text-lg font-bold uppercase text-brand-cream">
                Cadastrar Novo Assinante
              </h3>
              <p className="mt-1 text-xs text-brand-cream/60">
                Ideal para clientes que contrataram o plano no balcão via Pix ou dinheiro.
              </p>

              <form onSubmit={handleCreateSubscription} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-brand-cream/80">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Santos"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black p-2.5 text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-brand-cream/80">
                    Telefone WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(48) 99999-8888"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black p-2.5 text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-brand-cream/80">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black p-2.5 text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-brand-cream/80">
                    Plano do Clube
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black p-2.5 text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    <option value="corte-barba">Corte + Barba — R$ 159,90/mês</option>
                    <option value="corte">Cabelo — R$ 99,90/mês</option>
                    <option value="barba">Barba — R$ 89,90/mês</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded px-4 py-2 text-xs font-semibold text-brand-cream/60 hover:text-white"
                  >
                    Cancelar
                  </button>

                  <BrandButton type="submit" variant="gold" size="sm" disabled={creating}>
                    {creating ? 'Salvando...' : 'Salvar Assinante'}
                  </BrandButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
