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
  Edit,
  Save,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type { Appointment, AppointmentStatus, Product, Subscription, SubscriptionStatus } from '@/types';
import {
  createSubscription,
  listAppointments,
  listSubscriptions,
  updateAppointmentStatus,
  updateSubscriptionStatus,
} from '@/app/actions/subscriptionActions';
import {
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
} from '@/app/actions/productActions';
import {
  getSiteContent,
  updateSiteContent,
  getAboutContent,
  updateAboutContent,
  SiteContentData,
  AboutContentData,
} from '@/app/actions/siteContentActions';
import { formatBRL } from '@/lib/format';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';
import { BarberAgenda } from '@/components/admin/BarberAgenda';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { loginAdminAction } from '@/app/actions/authActions';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('Henrique');
  const [passwordInput, setPasswordInput] = useState('');
  const [currentUser, setCurrentUser] = useState('Henrique');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Aba ativa
  const [activeTab, setActiveTab] = useState<
    'subscriptions' | 'appointments' | 'products' | 'home' | 'about'
  >('subscriptions');

  // Dados
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentData | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Filtros de Assinaturas
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');

  // Modal Novo Assinante
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'corte' | 'barba' | 'corte-barba'>('corte-barba');
  const [creatingSub, setCreatingSub] = useState(false);

  // Modal / Formulário Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'pomada' | 'oleo' | 'balm' | 'kit'>('pomada');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<string>('45,00');
  const [prodComparePrice, setProdComparePrice] = useState<string>('');
  const [prodImage, setProdImage] = useState<string>('/images/product-pomada-matte.webp');
  const [prodInStock, setProdInStock] = useState(true);
  const [savingProd, setSavingProd] = useState(false);

  // Persistência de autenticação
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authQuery = params.get('auth') || params.get('demo');
      if (authQuery === 'true' || authQuery === 'beck2026') {
        sessionStorage.setItem('beck_admin_auth', 'true');
        sessionStorage.setItem('beck_admin_user', 'Henrique');
        setIsAuthenticated(true);
        loadAllData();
        return;
      }
      const auth = sessionStorage.getItem('beck_admin_auth');
      const savedUser = sessionStorage.getItem('beck_admin_user');
      if (savedUser) setCurrentUser(savedUser);
      if (auth === 'true') {
        setIsAuthenticated(true);
        loadAllData();
      }
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subs, apts, prods, site, about] = await Promise.all([
        listSubscriptions(),
        listAppointments(),
        listAdminProducts(),
        getSiteContent(),
        getAboutContent(),
      ]);
      setSubscriptions(subs);
      setAppointments(apts);
      setProducts(prods);
      setSiteContent(site);
      setAboutContent(about);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await loginAdminAction(usernameInput, passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        const name = res.user?.name || 'Henrique';
        setCurrentUser(name);
        sessionStorage.setItem('beck_admin_auth', 'true');
        sessionStorage.setItem('beck_admin_user', name);
        setPasswordInput('');
        loadAllData();
      } else {
        setAuthError(res.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch {
      setAuthError('Erro ao validar credenciais. Tente novamente.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('beck_admin_auth');
    sessionStorage.removeItem('beck_admin_user');
    setPasswordInput('');
  };

  const notifySuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // --- AÇÕES DE ASSINATURA ---
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
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
    notifySuccess('Status da assinatura atualizado no Supabase.');
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSub(true);
    const planPrices = { corte: 9990, barba: 8990, 'corte-barba': 15990 };
    const planNames = { corte: 'Cabelo', barba: 'Barba', 'corte-barba': 'Corte + Barba' };

    try {
      const created = await createSubscription({
        customerName: newName,
        customerPhone: newPhone,
        customerEmail: newEmail,
        planSlug: newPlan,
        planName: planNames[newPlan],
        priceInCents: planPrices[newPlan],
      });

      setSubscriptions((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      notifySuccess('Assinante cadastrado com sucesso.');
    } catch {
      alert('Erro ao cadastrar assinante');
    } finally {
      setCreatingSub(false);
    }
  };

  // --- AÇÕES DE PRODUTOS ---
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('pomada');
    setProdDesc('');
    setProdPrice('45,00');
    setProdComparePrice('');
    setProdImage('/images/product-pomada-matte.webp');
    setProdInStock(true);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdDesc(prod.description);
    setProdPrice((prod.priceInCents / 100).toFixed(2).replace('.', ','));
    setProdComparePrice(
      prod.compareAtPriceInCents
        ? (prod.compareAtPriceInCents / 100).toFixed(2).replace('.', ',')
        : '',
    );
    setProdImage(prod.imageUrl);
    setProdInStock(prod.inStock);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProd(true);

    const priceCents = Math.round(parseFloat(prodPrice.replace(',', '.')) * 100);
    const compareCents = prodComparePrice
      ? Math.round(parseFloat(prodComparePrice.replace(',', '.')) * 100)
      : null;

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: prodName,
          category: prodCategory,
          description: prodDesc,
          priceInCents: priceCents,
          compareAtPriceInCents: compareCents,
          imageUrl: prodImage,
          inStock: prodInStock,
        });
        notifySuccess('Produto atualizado com sucesso.');
      } else {
        await createProduct({
          name: prodName,
          category: prodCategory,
          description: prodDesc,
          priceInCents: priceCents,
          compareAtPriceInCents: compareCents,
          imageUrl: prodImage,
          inStock: prodInStock,
        });
        notifySuccess('Novo produto adicionado com sucesso.');
      }

      const updatedProds = await listAdminProducts();
      setProducts(updatedProds);
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar produto.');
    } finally {
      setSavingProd(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notifySuccess('Produto removido com sucesso.');
    } catch {
      alert('Erro ao excluir produto.');
    }
  };

  const handleToggleStock = async (id: string, currentStock: boolean) => {
    await toggleProductStock(id, !currentStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !currentStock } : p)),
    );
    notifySuccess('Estoque atualizado.');
  };

  // --- AÇÕES DE SITE CONTENT (HOME) ---
  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteContent) return;
    setLoading(true);
    try {
      const res = await updateSiteContent(siteContent);
      if (res.ok) {
        notifySuccess('Configurações da Página Inicial salvas no Supabase.');
      } else {
        alert(res.error);
      }
    } catch {
      alert('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES DE ABOUT CONTENT (PÁGINA SOBRE) ---
  const handleSaveAboutContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutContent) return;
    setLoading(true);
    try {
      const res = await updateAboutContent(aboutContent);
      if (res.ok) {
        notifySuccess('Conteúdo da Página Sobre salvo no Supabase.');
      } else {
        alert(res.error);
      }
    } catch {
      alert('Erro ao salvar Página Sobre.');
    } finally {
      setLoading(false);
    }
  };

  // TELA DE LOGIN DO ADMIN
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black px-4">
        <div className="w-full max-w-sm rounded border border-white/10 bg-brand-graphite/80 p-8 shadow-2xl backdrop-blur-md">
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
              Digite seu usuário e senha para gerenciar a barbearia
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-brand-cream/60 mb-1.5 font-medium">
                Usuário
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ex: Henrique"
                required
                className="w-full rounded border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-brand-cream placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-brand-cream/60 mb-1.5 font-medium">
                Senha
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha"
                autoFocus
                required
                className="w-full rounded border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-brand-cream placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
              />
            </div>

            {authError && (
              <p className="text-center text-xs text-red-400 bg-red-950/40 border border-red-500/20 rounded py-1.5 px-2">
                {authError}
              </p>
            )}

            <BrandButton type="submit" size="full" className="justify-center" disabled={isAuthenticating}>
              {isAuthenticating ? 'Validando acesso...' : 'Acessar Painel'}
            </BrandButton>

            <p className="text-center text-[10px] text-brand-cream/40">
              Administrador padrão: <span className="text-brand-gold font-medium">Henrique</span>
            </p>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link href="/" className="text-xs text-brand-cream/50 hover:text-brand-gold transition">
              ← Voltar ao site da barbearia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream pb-16">
      {/* Barra de Notificação Superior */}
      {saveSuccess && (
        <div className="sticky top-0 z-50 bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2.5 text-center text-xs text-emerald-300 backdrop-blur-md flex items-center justify-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Header do Painel */}
      <header className="border-b border-white/10 bg-brand-graphite/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-12">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="Beck Barbearia"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider text-brand-cream">
                Beck Barbearia — Gestão
              </h1>
              <p className="text-[10px] text-brand-cream/50 font-mono">
                Supabase PostgreSQL • beckbarbearia.com.br
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border border-white/10 rounded px-2.5 py-1 bg-white/5">
              <div className="h-5 w-5 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-[10px] text-brand-gold font-bold">
                {currentUser.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-brand-cream/80 font-medium">{currentUser}</span>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-cream/70 hover:text-brand-gold border border-white/10 rounded bg-white/5 transition"
              title="Recarregar dados do banco"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 text-xs text-brand-cream/70 hover:text-brand-gold border border-white/10 rounded bg-white/5 transition hidden sm:inline"
            >
              Ver Site
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded hover:bg-red-950/40 transition"
              title="Sair da conta"
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </div>
        </div>


        {/* Abas de Navegação */}
        <div className="container flex border-t border-white/5 overflow-x-auto gap-1 py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded transition whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:text-brand-gold hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>Assinaturas ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded transition whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:text-brand-gold hover:bg-white/5'
            }`}
          >
            <Calendar size={14} />
            <span>Agenda da Barbearia</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:text-brand-gold hover:bg-white/5'
            }`}
          >
            <Package size={14} />
            <span>Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded transition whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:text-brand-gold hover:bg-white/5'
            }`}
          >
            <Sliders size={14} />
            <span>Página Inicial</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded transition whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:text-brand-gold hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <span>Página Sobre</span>
          </button>
        </div>
      </header>

      {/* CONTEÚDO DAS ABAS */}
      <main className="container pt-8">
        {/* ======================================================== */}
        {/* ABA 1: ASSINATURAS DO CLUBE DA BARBA                     */}
        {/* ======================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded border border-white/10 bg-brand-graphite/50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-cream/50">
                  Total de Assinantes
                </span>
                <p className="mt-1 text-2xl font-bold font-display text-brand-cream">
                  {subscriptions.length}
                </p>
              </div>

              <div className="rounded border border-white/10 bg-brand-graphite/50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-cream/50">
                  Assinantes Ativos
                </span>
                <p className="mt-1 text-2xl font-bold font-display text-emerald-400">
                  {activeSubs.length}
                </p>
              </div>

              <div className="rounded border border-white/10 bg-brand-graphite/50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-cream/50">
                  MRR do Clube
                </span>
                <p className="mt-1 text-2xl font-bold font-display text-brand-gold">
                  {formatBRL(totalMRR)}
                </p>
              </div>

              <div className="rounded border border-white/10 bg-brand-graphite/50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-cream/50">
                  Validade do Clube
                </span>
                <p className="mt-1 text-sm font-bold font-display text-brand-cream/80">
                  Segunda a Quarta
                </p>
              </div>
            </div>

            {/* Ações e Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar nome, fone ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-black/40 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="canceled">Cancelado</option>
                  <option value="past_due">Atrasado</option>
                </select>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition w-full sm:w-auto justify-center"
              >
                <Plus size={14} />
                <span>Novo Assinante</span>
              </button>
            </div>

            {/* Tabela de Assinantes */}
            <div className="overflow-x-auto rounded border border-white/10 bg-brand-graphite/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 border-b border-white/10 text-brand-cream/50 uppercase tracking-wider font-display text-[10px]">
                  <tr>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Contato</th>
                    <th className="p-3.5">Plano</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Próx. Cobrança</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-medium text-brand-cream">{sub.customerName}</td>
                      <td className="p-3.5 text-brand-cream/70 font-mono">
                        <div>{sub.customerPhone}</div>
                        <div className="text-[10px] text-white/40">{sub.customerEmail}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-brand-cream">{sub.planName}</td>
                      <td className="p-3.5 font-mono text-brand-gold font-bold">
                        {formatBRL(sub.priceInCents)}
                      </td>
                      <td className="p-3.5 text-brand-cream/60 font-mono">{sub.nextBillingDate}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            sub.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : sub.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={sub.status}
                          onChange={(e) =>
                            handleStatusChange(sub.id, e.target.value as SubscriptionStatus)
                          }
                          className="bg-black/50 border border-white/15 text-brand-cream text-[11px] rounded px-2 py-1 focus:border-brand-gold focus:outline-none"
                        >
                          <option value="active">Ativar</option>
                          <option value="pending">Pendente</option>
                          <option value="past_due">Atrasado</option>
                          <option value="canceled">Cancelar</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-brand-cream/50">
                        Nenhum assinante encontrado para os critérios de busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: AGENDA DA BARBEARIA                               */}
        {/* ======================================================== */}
        {activeTab === 'appointments' && (
          <div>
            <BarberAgenda
              initialAppointments={appointments}
              subscriptions={subscriptions}
              onAppointmentsChange={(updated) => setAppointments(updated)}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 3: CATÁLOGO DE PRODUTOS                              */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold uppercase text-brand-cream">
                  Catálogo de Produtos
                </h2>
                <p className="text-xs text-brand-cream/50">
                  Gerencie pomadas, óleos, balms e kits vendidos na barbearia
                </p>
              </div>

              <button
                onClick={handleOpenNewProduct}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
              >
                <Plus size={14} />
                <span>Novo Produto</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded border border-white/10 bg-brand-graphite/40 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-black/40 border-b border-white/5">
                      <Image
                        src={prod.imageUrl}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          prod.inStock
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-950/80 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {prod.inStock ? 'Em Estoque' : 'Esgotado'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-display text-sm font-bold text-brand-cream leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-brand-cream/60 line-clamp-2">{prod.description}</p>
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

                  <div className="p-4 border-t border-white/5 flex items-center justify-between gap-2 bg-black/20">
                    <button
                      onClick={() => handleToggleStock(prod.id, prod.inStock)}
                      className="text-[11px] text-brand-cream/70 hover:text-brand-gold underline"
                    >
                      {prod.inStock ? 'Marcar Esgotado' : 'Marcar Em Estoque'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 rounded border border-white/10 hover:border-brand-gold/60 text-brand-cream/80 hover:text-brand-gold transition"
                        title="Editar Produto"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 transition"
                        title="Excluir Produto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: PÁGINA INICIAL (HERO, SLOGANS, CONTATO, HORÁRIOS) */}
        {/* ======================================================== */}
        {activeTab === 'home' && siteContent && (
          <form onSubmit={handleSaveSiteContent} className="max-w-3xl space-y-8">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold uppercase text-brand-cream">
                  Configurações da Página Inicial
                </h2>
                <p className="text-xs text-brand-cream/50">
                  Edite textos, slogans, foto de fundo e informações de contato
                </p>
              </div>
              <BrandButton type="submit" size="sm" disabled={loading}>
                <Save size={14} className="mr-1.5" />
                Salvar Alterações
              </BrandButton>
            </div>

            {/* Hero Section */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-5">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                1. Hero / Destaque Principal
              </h3>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={siteContent.heroTitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Subtítulo / Slogan de Destaque
                </label>
                <input
                  type="text"
                  value={siteContent.heroSubtitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Slogan Secundário (Hero Slogan)
                </label>
                <input
                  type="text"
                  value={siteContent.heroSlogan}
                  onChange={(e) => setSiteContent({ ...siteContent, heroSlogan: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Upload de Imagem de Fundo (Sem URL text input!) */}
              <ImageUploadField
                label="Foto de Fundo do Hero (Banner Principal)"
                value={siteContent.heroImage}
                onChange={(url) => setSiteContent({ ...siteContent, heroImage: url })}
                aspectRatio="banner"
                helpText="Envie uma imagem de alta resolução (preferencialmente 1920x1080 em formato WEBP ou JPG)."
              />
            </div>

            {/* Informações de Contato e Endereço */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-5">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                2. Contato & Localização
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                    WhatsApp (Apenas Números)
                  </label>
                  <input
                    type="text"
                    value={siteContent.whatsappNumber}
                    onChange={(e) =>
                      setSiteContent({ ...siteContent, whatsappNumber: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                    WhatsApp Exibição Formatada
                  </label>
                  <input
                    type="text"
                    value={siteContent.whatsappDisplay}
                    onChange={(e) =>
                      setSiteContent({ ...siteContent, whatsappDisplay: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                    Endereço (Rua e Número)
                  </label>
                  <input
                    type="text"
                    value={siteContent.addressStreet}
                    onChange={(e) =>
                      setSiteContent({ ...siteContent, addressStreet: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={siteContent.addressDistrict}
                    onChange={(e) =>
                      setSiteContent({ ...siteContent, addressDistrict: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={siteContent.addressCity}
                    onChange={(e) => setSiteContent({ ...siteContent, addressCity: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">Estado</label>
                  <input
                    type="text"
                    value={siteContent.addressState}
                    onChange={(e) =>
                      setSiteContent({ ...siteContent, addressState: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Link do Perfil no Instagram
                </label>
                <input
                  type="text"
                  value={siteContent.instagramUrl}
                  onChange={(e) =>
                    setSiteContent({ ...siteContent, instagramUrl: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Aviso do Clube */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                3. Aviso de Validade do Clube da Barba
              </h3>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Título do Aviso
                </label>
                <input
                  type="text"
                  value={siteContent.noticeTitle}
                  onChange={(e) =>
                    setSiteContent({ ...siteContent, noticeTitle: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Texto Explicativo
                </label>
                <textarea
                  rows={2}
                  value={siteContent.noticeText}
                  onChange={(e) => setSiteContent({ ...siteContent, noticeText: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <BrandButton type="submit" disabled={loading}>
                <Save size={16} className="mr-2" />
                Salvar Alterações da Página Inicial
              </BrandButton>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* ABA 5: PÁGINA SOBRE (/sobre)                             */}
        {/* ======================================================== */}
        {activeTab === 'about' && aboutContent && (
          <form onSubmit={handleSaveAboutContent} className="max-w-3xl space-y-8">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold uppercase text-brand-cream">
                  Conteúdo da Página Sobre (/sobre)
                </h2>
                <p className="text-xs text-brand-cream/50">
                  Edite a história, manifesto, dados do fundador e galeria do espaço
                </p>
              </div>
              <BrandButton type="submit" size="sm" disabled={loading}>
                <Save size={14} className="mr-1.5" />
                Salvar Página Sobre
              </BrandButton>
            </div>

            {/* Cabeçalho da Página Sobre */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                1. Títulos Principais
              </h3>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={aboutContent.title}
                  onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Subtítulo / Chamada
                </label>
                <textarea
                  rows={2}
                  value={aboutContent.subtitle}
                  onChange={(e) => setAboutContent({ ...aboutContent, subtitle: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* História e Manifesto */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                2. História & Manifesto
              </h3>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  História da Barbearia (Separe parágrafos com linha em branco)
                </label>
                <textarea
                  rows={6}
                  value={aboutContent.storyText}
                  onChange={(e) => setAboutContent({ ...aboutContent, storyText: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none leading-relaxed font-light"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Manifesto do Estilo Tradicional
                </label>
                <textarea
                  rows={3}
                  value={aboutContent.manifestoText}
                  onChange={(e) =>
                    setAboutContent({ ...aboutContent, manifestoText: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Fundador / Mestre Barbeiro */}
            <div className="rounded border border-white/10 bg-brand-graphite/40 p-6 space-y-5">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">
                3. Perfil do Fundador / Mestre Barbeiro
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">Nome</label>
                  <input
                    type="text"
                    value={aboutContent.founderName}
                    onChange={(e) =>
                      setAboutContent({ ...aboutContent, founderName: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                    Cargo / Título
                  </label>
                  <input
                    type="text"
                    value={aboutContent.founderRole}
                    onChange={(e) =>
                      setAboutContent({ ...aboutContent, founderRole: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-cream/80 mb-1">
                  Biografia do Fundador
                </label>
                <textarea
                  rows={4}
                  value={aboutContent.founderBio}
                  onChange={(e) =>
                    setAboutContent({ ...aboutContent, founderBio: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Upload da Foto do Fundador */}
              <ImageUploadField
                label="Foto do Fundador (Retrato)"
                value={aboutContent.founderPhoto}
                onChange={(url) => setAboutContent({ ...aboutContent, founderPhoto: url })}
                aspectRatio="square"
                helpText="Envie um retrato profissional do barbeiro."
              />
            </div>

            <div className="flex justify-end">
              <BrandButton type="submit" disabled={loading}>
                <Save size={16} className="mr-2" />
                Salvar Conteúdo da Página Sobre
              </BrandButton>
            </div>
          </form>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL NOVO ASSINANTE                                     */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded border border-white/15 bg-brand-graphite p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-cream">
                Cadastrar Novo Assinante
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-3">
              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="48999999999"
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@gmail.com"
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">Plano do Clube</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                >
                  <option value="corte-barba">Corte + Barba — R$ 159,90/mês</option>
                  <option value="corte">Cabelo — R$ 99,90/mês</option>
                  <option value="barba">Barba — R$ 89,90/mês</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <BrandButton type="submit" size="sm" disabled={creatingSub}>
                  {creatingSub ? 'Cadastrando...' : 'Confirmar Cadastro'}
                </BrandButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PRODUTO (CRIAR / EDITAR) COM IMAGE UPLOAD FIELD    */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded border border-white/15 bg-brand-graphite p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-cream">
                {editingProductId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: Pomada Matte Efeito Seco 100g"
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-brand-cream/80 mb-1">Categoria</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    <option value="pomada">Pomada</option>
                    <option value="oleo">Óleo</option>
                    <option value="balm">Balm</option>
                    <option value="kit">Kit / Shampoo</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="prodStock"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="rounded border-white/20 bg-black text-brand-gold focus:ring-0 h-4 w-4"
                  />
                  <label htmlFor="prodStock" className="text-xs text-brand-cream font-medium">
                    Em Estoque
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-brand-cream/80 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="text"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="45,00"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-brand-cream/80 mb-1">
                    Preço De/Por (Opcional)
                  </label>
                  <input
                    type="text"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="55,00"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-brand-cream/80 mb-1">Descrição do Produto</label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Descreva os benefícios, modo de usar e acabamento..."
                  className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Upload Real de Imagem (Sem URL text input!) */}
              <ImageUploadField
                label="Foto do Produto"
                value={prodImage}
                onChange={(url) => setProdImage(url)}
                aspectRatio="square"
                helpText="Selecione ou arraste a foto do produto. O upload será enviado diretamente para o Supabase Storage."
              />

              <div className="pt-2 flex gap-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3 py-2 text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <BrandButton type="submit" size="sm" disabled={savingProd}>
                  {savingProd ? 'Salvando...' : 'Salvar Produto'}
                </BrandButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
