'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Lock,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
  FileText,
  Sliders,
  Edit2,
  Check,
  AlertCircle,
  Tag,
  Cake,
  Phone,
  Eye,
  EyeOff,
  AlertTriangle,
  Minus,
  Beer,
} from 'lucide-react';
import type { Appointment, Product, Subscription, SubscriptionStatus, Barber } from '@/types';
import {
  listSubscriptions,
  updateSubscriptionStatus,
  createSubscription,
  updateSubscriptionDetails,
  deleteSubscriptionAction,
  listUpcomingBirthdaysAction,
  listAppointments,
} from '@/app/actions/subscriptionActions';
import {
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  toggleProductHomeVisibility,
  quickAdjustStockQuantity,
} from '@/app/actions/productActions';
import { listBarbersAction } from '@/app/actions/barberActions';
import { loginAdminAction } from '@/app/actions/authActions';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';
import { BarberAgenda } from '@/components/admin/BarberAgenda';
import { TeamManager } from '@/components/admin/TeamManager';
import { SiteCmsManager } from '@/components/admin/SiteCmsManager';
import { MarketingManager } from '@/components/admin/MarketingManager';
import { SubscriberModal } from '@/components/admin/SubscriberModal';
import { ProductModal } from '@/components/admin/ProductModal';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [currentUser, setCurrentUser] = useState('Admin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 6 Abas Mestres Unificadas
  const [activeTab, setActiveTab] = useState<
    'subscriptions' | 'appointments' | 'team' | 'products' | 'cms' | 'marketing'
  >('subscriptions');

  // Dados Globais
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [birthdays, setBirthdays] = useState<Subscription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Filtros de Assinantes
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');

  // Modal 4-Grid de Assinante (Criação e Edição)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState<Subscription | null>(null);

  // SafeDeleteModal para Assinante
  const [isDeleteSubModalOpen, setIsDeleteSubModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);
  const [isDeletingSub, setIsDeletingSub] = useState(false);

  // Modal 4-Grid de Produto (Criação e Edição)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  // SafeDeleteModal para Produto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Sub-aba de Produtos: Cosméticos vs Bar/Bebidas
  const [productSubTab, setProductSubTab] = useState<'cosmetics' | 'beverages'>('cosmetics');

  // Autenticação Persistente
  useEffect(() => {
    const auth = localStorage.getItem('beck_admin_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.username || 'Admin');
        }
      } catch {
        localStorage.removeItem('beck_admin_auth');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await loginAdminAction(usernameInput, passwordInput);
      if (res.ok && res.user) {
        setIsAuthenticated(true);
        setCurrentUser(res.user.name || res.user.username);
        localStorage.setItem(
          'beck_admin_auth',
          JSON.stringify({ authenticated: true, username: res.user.username })
        );
      } else {
        setAuthError(res.error || 'Credenciais inválidas.');
      }
    } catch {
      setAuthError('Falha na comunicação com o servidor.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('beck_admin_auth');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Carregar Dados Mestres
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [subs, apts, prods, barbs, bdays] = await Promise.all([
        listSubscriptions(),
        listAppointments(),
        listAdminProducts(),
        listBarbersAction(),
        listUpcomingBirthdaysAction(),
      ]);
      setSubscriptions(subs);
      setAppointments(apts);
      setProducts(prods);
      setBarbers(barbs);
      setBirthdays(bdays);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMasterData();
    }
  }, [isAuthenticated]);

  const notifySuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // =========================================================
  // GESTÃO DE ASSINANTES & CLIENTES
  // =========================================================
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalMRR = activeSubs.reduce((acc, curr) => acc + curr.priceInCents, 0);

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
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    notifySuccess('Status da assinatura atualizado.');
  };

  const handleOpenNewSub = () => {
    setSelectedSubForEdit(null);
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (sub: Subscription) => {
    setSelectedSubForEdit(sub);
    setIsSubModalOpen(true);
  };

  const handleSaveSubscriber = async (data: any) => {
    const planPrices = { corte: 9990, barba: 8990, 'corte-barba': 15990 };
    const planNames = { corte: 'Cabelo', barba: 'Barba', 'corte-barba': 'Corte + Barba' };

    if (selectedSubForEdit) {
      const res = await updateSubscriptionDetails(selectedSubForEdit.id, {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        planSlug: data.planSlug,
        status: data.status,
        nextBillingDate: data.nextBillingDate,
        birthDate: data.birthDate,
        notes: data.notes,
        preferredBarberId: data.preferredBarberId,
      });
      if (res.ok && res.subscription) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === selectedSubForEdit.id ? res.subscription! : s))
        );
        notifySuccess('Assinante atualizado com sucesso.');
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } else {
      try {
        const created = await createSubscription({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          planSlug: data.planSlug,
          planName: planNames[data.planSlug as 'corte' | 'barba' | 'corte-barba'],
          priceInCents: planPrices[data.planSlug as 'corte' | 'barba' | 'corte-barba'],
          birthDate: data.birthDate,
          notes: data.notes,
          preferredBarberId: data.preferredBarberId,
        });
        setSubscriptions((prev) => [created, ...prev]);
        notifySuccess('Novo assinante cadastrado.');
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err?.message || 'Erro ao cadastrar.' };
      }
    }
  };

  const handleOpenDeleteSub = (sub: Subscription) => {
    setSubToDelete(sub);
    setIsDeleteSubModalOpen(true);
  };

  const handleConfirmDeleteSub = async () => {
    if (!subToDelete) return;
    setIsDeletingSub(true);
    try {
      const res = await deleteSubscriptionAction(subToDelete.id);
      if (res.ok) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== subToDelete.id));
        notifySuccess('Assinante removido com sucesso.');
      }
    } catch {
      notifySuccess('Erro ao excluir assinante.');
    } finally {
      setIsDeletingSub(false);
      setIsDeleteSubModalOpen(false);
      setSubToDelete(null);
    }
  };

  // =========================================================
  // GESTÃO DE PRODUTOS & ESTOQUE
  // =========================================================
  const handleOpenNewProduct = () => {
    setSelectedProductForEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setSelectedProductForEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (data: any) => {
    if (data.id) {
      const res = await updateProduct(data.id, data);
      if (res.ok && res.product) {
        setProducts((prev) => prev.map((p) => (p.id === data.id ? res.product! : p)));
        notifySuccess('Produto atualizado.');
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } else {
      const res = await createProduct(data);
      if (res.ok && res.product) {
        setProducts((prev) => [res.product!, ...prev]);
        notifySuccess('Produto cadastrado com sucesso.');
        return { ok: true };
      }
      return { ok: false, error: res.error };
    }
  };

  const handleToggleProductStock = async (id: string, inStock: boolean) => {
    await toggleProductStock(id, inStock);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock } : p)));
    notifySuccess('Status de estoque alterado.');
  };

  const handleToggleProductVisibility = async (id: string, showOnHome: boolean) => {
    const res = await toggleProductHomeVisibility(id, showOnHome);
    if (res.ok) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, showOnHome } : p)));
      notifySuccess(showOnHome ? 'Produto visível na Página Inicial.' : 'Produto ocultado da Página Inicial.');
    }
  };

  const handleQuickAdjustStock = async (id: string, delta: number) => {
    const res = await quickAdjustStockQuantity(id, delta);
    if (res.ok && res.stockQuantity !== undefined) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, stockQuantity: res.stockQuantity, inStock: Boolean(res.inStock) }
            : p
        )
      );
      notifySuccess(`Estoque ${delta > 0 ? '+1' : '-1'} atualizado.`);
    }
  };

  const handleOpenDeleteProduct = (prod: Product) => {
    setProductToDelete(prod);
    setIsDeleteProductModalOpen(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      const res = await deleteProduct(productToDelete.id);
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        notifySuccess('Produto excluído com sucesso.');
      }
    } catch {
      notifySuccess('Erro ao excluir produto.');
    } finally {
      setIsDeletingProduct(false);
      setIsDeleteProductModalOpen(false);
      setProductToDelete(null);
    }
  };

  // =========================================================
  // TELA DE LOGIN
  // =========================================================
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
        <div className="w-full max-w-sm rounded border border-white/15 bg-[#141414] p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 relative h-16 w-16">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="Beck Barbearia"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <h1 className="font-display text-lg font-bold uppercase tracking-wider text-brand-cream">
              Painel Administrativo
            </h1>
            <p className="mt-1 text-xs text-brand-cream/50">
              Digite suas credenciais de acesso seguro
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-brand-cream/60 mb-1.5 font-medium font-mono">
                Usuário
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoFocus
                required
                className="w-full rounded border border-white/15 bg-black/70 px-4 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-brand-cream/60 mb-1.5 font-medium font-mono">
                Senha
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full rounded border border-white/15 bg-black/70 px-4 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
              />
            </div>

            {authError && (
              <p className="text-center text-xs text-red-400 bg-red-950/60 border border-red-500/30 rounded py-1.5 px-2 font-mono">
                {authError}
              </p>
            )}

            <BrandButton type="submit" size="full" className="justify-center py-2.5 text-xs" disabled={isAuthenticating}>
              {isAuthenticating ? 'Autenticando...' : 'Acessar Painel'}
            </BrandButton>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link href="/" className="text-xs text-brand-cream/50 hover:text-brand-gold transition font-mono">
              ← Retornar ao Site Oficial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-brand-cream pb-16">
      {/* Barra de Notificação Superior */}
      {saveSuccess && (
        <div className="sticky top-0 z-50 bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2.5 text-center text-xs text-emerald-300 backdrop-blur-md flex items-center justify-center gap-2 font-mono">
          <Check size={14} className="text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Cabeçalho Principal */}
      <header className="border-b border-white/10 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="Beck Barbearia"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
                Beck Barbearia • Gestão Central
              </h1>
              <p className="text-[11px] font-mono text-brand-cream/50">
                Operador autenticado: <strong className="text-brand-gold">{currentUser}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-mono text-brand-cream/60 hover:text-brand-gold transition px-3 py-1.5 rounded border border-white/10 hover:border-brand-gold/40"
            >
              Visualizar Site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-mono text-red-400 hover:text-red-300 transition flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500/20 hover:bg-red-950/30"
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* 6 ABAS MESTRES UNIFICADAS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto custom-scrollbar border-t border-white/5 pt-1">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>Clientes & Assinaturas ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <Calendar size={14} />
            <span>Agenda da Barbearia</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'team'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Equipe & Acessos</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <Package size={14} />
            <span>Produtos & Estoque ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'cms'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <span>Conteúdo do Site</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
              activeTab === 'marketing'
                ? 'border-brand-gold text-brand-gold font-bold bg-white/5'
                : 'border-transparent text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
            }`}
          >
            <Tag size={14} />
            <span>Marketing & Cupons</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ======================================================== */}
        {/* ABA 1: CLIENTES & ASSINATURAS (Com Aniversariantes do Mês) */}
        {/* ======================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-white/10 bg-[#141414]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50 block">
                  Assinantes Ativos
                </span>
                <p className="font-display text-2xl font-bold text-brand-cream mt-1">
                  {activeSubs.length}
                </p>
                <span className="text-[11px] font-mono text-emerald-400">
                  {subscriptions.length > 0
                    ? `${Math.round((activeSubs.length / subscriptions.length) * 100)}% de retenção`
                    : '0%'}
                </span>
              </div>

              <div className="p-4 rounded border border-white/10 bg-[#141414]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50 block">
                  Faturamento Recorrente (MRR)
                </span>
                <p className="font-display text-2xl font-bold text-brand-gold mt-1">
                  {formatBRL(totalMRR)}
                </p>
                <span className="text-[11px] font-mono text-brand-cream/50">
                  cobranças automáticas mensais
                </span>
              </div>

              <div className="p-4 rounded border border-white/10 bg-[#141414]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50 block">
                  Aniversariantes no Mês
                </span>
                <p className="font-display text-2xl font-bold text-brand-cream mt-1">
                  {birthdays.length}
                </p>
                <span className="text-[11px] font-mono text-sky-400">
                  oportunidade de fidelização
                </span>
              </div>
            </div>

            {/* WIDGET: ANIVERSARIANTES DO MÊS */}
            {birthdays.length > 0 && (
              <div className="p-4 rounded border border-brand-gold/30 bg-[#161616] space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Cake size={16} className="text-brand-gold" />
                    <h3 className="font-display text-xs font-bold uppercase text-brand-cream tracking-wide">
                      Aniversariantes do Mês ({birthdays.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-brand-gold">
                    Parabenize via WhatsApp com 1 clique
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {birthdays.map((sub) => {
                    const bdayMsg = `Olá ${sub.customerName}! Toda a equipe da Beck Barbearia deseja um feliz aniversário! Para celebrar, preparamos uma cortesia especial para o seu próximo atendimento no clube. Venha tomar um café conosco!`;
                    const bdayHref = whatsappLink(bdayMsg, sub.customerPhone);
                    return (
                      <div
                        key={sub.id}
                        className="p-3 rounded bg-black/60 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-xs font-bold text-brand-cream truncate">
                            {sub.customerName}
                          </p>
                          <p className="text-[10px] font-mono text-brand-cream/50">
                            Data: {sub.birthDate} • {sub.planName}
                          </p>
                        </div>

                        <a
                          href={bdayHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 hover:bg-emerald-900 transition shrink-0"
                          title="Enviar parabéns pelo WhatsApp"
                        >
                          <WhatsAppIcon className="h-3 w-3" />
                          <span>Parabenizar</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Barra de Filtro & Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded border border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-black/70 border border-white/10 rounded px-3 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
                >
                  <option value="all">Todos os Status ({subscriptions.length})</option>
                  <option value="active">Ativos ({activeSubs.length})</option>
                  <option value="past_due">Atrasados</option>
                  <option value="canceled">Cancelados</option>
                </select>

                <button
                  onClick={handleOpenNewSub}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
                >
                  <Plus size={13} />
                  <span>Novo Assinante</span>
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={13} className="absolute left-3 top-2.5 text-brand-cream/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, telefone ou e-mail..."
                  className="w-full bg-black/70 border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Tabela de Assinantes */}
            <div className="overflow-x-auto rounded border border-white/10 bg-[#141414]">
              <table className="w-full text-left text-xs text-brand-cream">
                <thead className="bg-black/60 font-mono text-[10px] uppercase text-brand-cream/60 border-b border-white/10">
                  <tr>
                    <th className="p-3">Membro / Cliente</th>
                    <th className="p-3">Plano</th>
                    <th className="p-3">Valor / Mês</th>
                    <th className="p-3">Próxima Cobrança</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-brand-cream/40">
                        Nenhum assinante encontrado para o filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition">
                        <td className="p-3">
                          <strong className="text-brand-cream font-sans font-semibold block">
                            {sub.customerName}
                          </strong>
                          <span className="text-[11px] text-brand-cream/50 font-mono">
                            {sub.customerPhone} • {sub.customerEmail}
                          </span>
                          {sub.birthDate && (
                            <span className="text-[10px] text-brand-gold/70 block mt-0.5">
                              Niver: {sub.birthDate}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-brand-cream font-semibold">{sub.planName}</span>
                        </td>
                        <td className="p-3 text-brand-gold font-bold">
                          {formatBRL(sub.priceInCents)}
                        </td>
                        <td className="p-3 text-brand-cream/70">
                          {sub.nextBillingDate}
                        </td>
                        <td className="p-3">
                          <select
                            value={sub.status}
                            onChange={(e) => handleStatusChange(sub.id, e.target.value as SubscriptionStatus)}
                            className={`rounded px-2 py-1 text-[10px] font-mono uppercase font-bold border ${
                              sub.status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                                : sub.status === 'past_due'
                                ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                                : 'bg-red-950/80 text-red-400 border-red-500/40'
                            }`}
                          >
                            <option value="active">Ativo</option>
                            <option value="past_due">Atrasado</option>
                            <option value="canceled">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditSub(sub)}
                              className="p-1.5 rounded border border-white/10 hover:border-brand-gold text-brand-cream/70 hover:text-brand-gold transition"
                              title="Editar Detalhes"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteSub(sub)}
                              className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 transition"
                              title="Excluir Assinante"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: AGENDA DA BARBEARIA                                */}
        {/* ======================================================== */}
        {activeTab === 'appointments' && (
          <BarberAgenda
            initialAppointments={appointments}
            subscriptions={subscriptions}
            barbers={barbers}
            onAppointmentsChange={setAppointments}
          />
        )}

        {/* ======================================================== */}
        {/* ABA 3: EQUIPE & ACESSOS (Unificada)                       */}
        {/* ======================================================== */}
        {activeTab === 'team' && (
          <TeamManager currentUsername={currentUser} />
        )}

        {/* ======================================================== */}
        {/* ABA 4: PRODUTOS & ESTOQUE                                 */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Seletor de Sub-Abas: Cosméticos vs Bebidas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProductSubTab('cosmetics')}
                  className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                    productSubTab === 'cosmetics'
                      ? 'bg-brand-gold text-brand-black shadow'
                      : 'bg-white/5 text-brand-cream/70 hover:bg-white/10 hover:text-brand-cream border border-white/10'
                  }`}
                >
                  <Package size={14} />
                  <span>💈 Cosméticos & Barbearia</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      productSubTab === 'cosmetics'
                        ? 'bg-black/30 text-brand-black'
                        : 'bg-white/10 text-brand-cream/80'
                    }`}
                  >
                    {products.filter((p) => p.productType !== 'beverage').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductSubTab('beverages')}
                  className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                    productSubTab === 'beverages'
                      ? 'bg-brand-gold text-brand-black shadow'
                      : 'bg-white/5 text-brand-cream/70 hover:bg-white/10 hover:text-brand-cream border border-white/10'
                  }`}
                >
                  <Beer size={14} />
                  <span>🍺 Bar & Frigobar</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      productSubTab === 'beverages'
                        ? 'bg-black/30 text-brand-black'
                        : 'bg-white/10 text-brand-cream/80'
                    }`}
                  >
                    {products.filter((p) => p.productType === 'beverage').length}
                  </span>
                </button>
              </div>

              <button
                onClick={handleOpenNewProduct}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
              >
                <Plus size={14} />
                <span>{productSubTab === 'beverages' ? 'Nova Bebida' : 'Novo Produto'}</span>
              </button>
            </div>

            {/* Subtítulo explicativo */}
            <div>
              <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
                {productSubTab === 'beverages'
                  ? 'Estoque do Bar & Frigobar da Barbearia'
                  : 'Catálogo de Produtos & Controle de Estoque'}
              </h2>
              <p className="text-xs text-brand-cream/50">
                {productSubTab === 'beverages'
                  ? 'Controle rápido de unidades vendidas no balcão (+/-), preços e alerta de estoque mínimo.'
                  : 'Gerencie preços, saldo em estoque físico e visibilidade na Landing Page.'}
              </p>
            </div>

            {/* Grid de Itens */}
            {(() => {
              const currentList = products.filter((prod) =>
                productSubTab === 'beverages'
                  ? prod.productType === 'beverage'
                  : prod.productType !== 'beverage'
              );

              if (currentList.length === 0) {
                return (
                  <div className="rounded border border-dashed border-white/15 p-12 text-center bg-black/30">
                    <p className="text-sm font-mono text-brand-cream/50">
                      {productSubTab === 'beverages'
                        ? 'Nenhuma bebida cadastrada no bar ou frigobar.'
                        : 'Nenhum cosmético ou produto cadastrado no catálogo.'}
                    </p>
                    <button
                      onClick={handleOpenNewProduct}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-brand-gold hover:text-brand-black text-brand-cream text-xs font-mono rounded transition"
                    >
                      <Plus size={12} />
                      <span>{productSubTab === 'beverages' ? 'Cadastrar Primeira Bebida' : 'Cadastrar Primeiro Produto'}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentList.map((prod) => {
                    const isLowStock =
                      prod.stockQuantity !== undefined &&
                      prod.minStockAlert !== undefined &&
                      prod.stockQuantity <= prod.minStockAlert;

                    const isBeverage = prod.productType === 'beverage';

                    return (
                      <div
                        key={prod.id}
                        className="rounded border border-white/10 bg-[#141414] overflow-hidden flex flex-col justify-between hover:border-brand-gold/40 transition"
                      >
                        <div>
                          {/* Foto */}
                          <div className="relative aspect-square w-full bg-black/60 border-b border-white/10">
                            <Image
                              src={prod.imageUrl}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 300px"
                              className="object-cover"
                            />

                            {/* Badges Flutuantes */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  prod.inStock
                                    ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-red-950/90 text-red-400 border border-red-500/40'
                                }`}
                              >
                                {prod.inStock ? `${prod.stockQuantity ?? 10} un. em estoque` : 'Esgotado'}
                              </span>

                              {isLowStock && prod.inStock && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <AlertTriangle size={10} />
                                  <span>Estoque Baixo</span>
                                </span>
                              )}

                              {isBeverage && prod.volumeMl && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                                  {prod.volumeMl}
                                </span>
                              )}
                            </div>

                            {/* Visibilidade / Tipo */}
                            <div className="absolute top-3 right-3">
                              {!isBeverage ? (
                                <button
                                  onClick={() => handleToggleProductVisibility(prod.id, !(prod.showOnHome ?? true))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase flex items-center gap-1 transition ${
                                    prod.showOnHome !== false
                                      ? 'bg-black/80 text-brand-gold border border-brand-gold/40'
                                      : 'bg-black/80 text-zinc-400 border border-white/10'
                                  }`}
                                  title={prod.showOnHome !== false ? 'Visível na Home' : 'Oculto na Home'}
                                >
                                  {prod.showOnHome !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                                  <span>{prod.showOnHome !== false ? 'Na Home' : 'Oculto'}</span>
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/80 text-brand-cream/70 border border-white/10">
                                  Bar & Balcão
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
                              {prod.category}
                            </span>
                            <h3 className="font-display text-sm font-bold text-brand-cream leading-snug">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-brand-cream/60 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>

                            <div className="pt-2 flex items-baseline gap-2">
                              <span className="font-display text-base font-bold text-brand-gold">
                                {formatBRL(prod.priceInCents)}
                              </span>
                              {prod.compareAtPriceInCents && (
                                <span className="text-xs text-brand-cream/40 line-through font-mono">
                                  {formatBRL(prod.compareAtPriceInCents)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rodapé de Ações */}
                        <div className="p-3 border-t border-white/5 flex items-center justify-between gap-2 bg-black/40">
                          {isBeverage ? (
                            /* Ajuste Rápido de Estoque (+/-) para Bebidas */
                            <div className="flex items-center gap-1.5 bg-black/60 rounded border border-white/10 px-2 py-1">
                              <span className="text-[10px] font-mono text-brand-cream/60 mr-1">Qtd:</span>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(prod.id, -1)}
                                disabled={(prod.stockQuantity ?? 0) <= 0}
                                className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-brand-cream disabled:opacity-30 transition"
                                title="Vendido / Consumido (-1 un)"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-xs font-mono font-bold text-brand-gold min-w-[24px] text-center">
                                {prod.stockQuantity ?? 0}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(prod.id, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-brand-cream transition"
                                title="Reposto no estoque (+1 un)"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleProductStock(prod.id, !prod.inStock)}
                              className="text-[11px] font-mono text-brand-cream/70 hover:text-brand-gold underline"
                            >
                              {prod.inStock ? 'Marcar Esgotado' : 'Marcar Em Estoque'}
                            </button>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded border border-white/10 hover:border-brand-gold text-brand-cream/80 hover:text-brand-gold transition"
                              title="Editar Produto"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteProduct(prod)}
                              className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 transition"
                              title="Excluir Produto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 5: CONTEÚDO DO SITE (Unificada Home + História)      */}
        {/* ======================================================== */}
        {activeTab === 'cms' && (
          <SiteCmsManager />
        )}

        {/* ======================================================== */}
        {/* ABA 6: MARKETING & CUPONS                                */}
        {/* ======================================================== */}
        {activeTab === 'marketing' && (
          <MarketingManager />
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAIS 4-GRID (SÓLIDOS & COMPACTOS)                      */}
      {/* ======================================================== */}

      {/* Modal Assinante */}
      <SubscriberModal
        isOpen={isSubModalOpen}
        subscriber={selectedSubForEdit}
        barbers={barbers}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleSaveSubscriber}
      />

      {/* Modal Produto */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={selectedProductForEdit}
        initialType={productSubTab === 'beverages' ? 'beverage' : 'cosmetic'}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Modal Seguro de Exclusão de Assinante */}
      <SafeDeleteModal
        isOpen={isDeleteSubModalOpen}
        itemName={subToDelete?.customerName || ''}
        itemTypeLabel="o assinante"
        onClose={() => {
          setIsDeleteSubModalOpen(false);
          setSubToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSub}
        loading={isDeletingSub}
      />

      {/* Modal Seguro de Exclusão de Produto */}
      <SafeDeleteModal
        isOpen={isDeleteProductModalOpen}
        itemName={productToDelete?.name || ''}
        itemTypeLabel="o produto"
        onClose={() => {
          setIsDeleteProductModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDeleteProduct}
        loading={isDeletingProduct}
      />
    </div>
  );
}
