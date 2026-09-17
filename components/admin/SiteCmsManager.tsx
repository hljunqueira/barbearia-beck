'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Star,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { BrandButton } from '@/components/BrandButton';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';
import { ServiceModal } from '@/components/admin/ServiceModal';
import {
  getSiteContent,
  updateSiteContent,
  getAboutContent,
  updateAboutContent,
  type SiteContentData,
  type AboutContentData,
  type ExperienceItem,
  type OpeningHourSlot,
  type GoogleReviewItem,
} from '@/app/actions/siteContentActions';
import {
  listAdminServices,
  createService,
  updateService,
  deleteService,
} from '@/app/actions/serviceActions';
import {
  listAdminPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '@/app/actions/planActions';
import type { Service, Plan, PlanFeature } from '@/types';
import { formatBRL } from '@/lib/format';

type SubTab =
  | 'identity'
  | 'experience'
  | 'services'
  | 'plans'
  | 'hours'
  | 'reviews'
  | 'contacts'
  | 'about';

export function SiteCmsManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('identity');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // ==========================================
  // ESTADOS DO SITE CONTENT (CMS)
  // ==========================================
  const [logoUrl, setLogoUrl] = useState('/images/logo-removebg-preview.png');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSlogan, setHeroSlogan] = useState('');
  const [heroImage, setHeroImage] = useState('/images/hero-bg.webp');

  // Experiência Beck
  const [experienceTitle, setExperienceTitle] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [experiencePhoto, setExperiencePhoto] = useState('/images/hero-bg-2.webp');
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([
    { title: '', text: '' },
    { title: '', text: '' },
    { title: '', text: '' },
    { title: '', text: '' },
  ]);

  // Horários e Banner
  const [walkInTitle, setWalkInTitle] = useState('');
  const [walkInSubtitle, setWalkInSubtitle] = useState('');
  const [hoursList, setHoursList] = useState<OpeningHourSlot[]>([
    { days: 'Segunda a Sexta', time: '08:00 às 19:30', open: true },
    { days: 'Sábado', time: '08:00 às 17:00', open: true },
    { days: 'Domingo', time: 'Fechado', open: false },
  ]);

  // Avaliações Google
  const [googleRating, setGoogleRating] = useState<number>(4.9);
  const [googleReviewsCount, setGoogleReviewsCount] = useState<number>(150);
  const [reviewsList, setReviewsList] = useState<GoogleReviewItem[]>([]);

  // Contatos
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeText, setNoticeText] = useState('');

  // Estados Sobre / História
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [manifestoText, setManifestoText] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [founderPhoto, setFounderPhoto] = useState('/images/hero-bg-2.webp');
  const [shopPhotos, setShopPhotos] = useState<string[]>([]);
  const [newShopPhotoUrl, setNewShopPhotoUrl] = useState('');

  // ==========================================
  // ESTADOS DE SERVIÇOS & PLANOS (CRUD)
  // ==========================================
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Modal de Serviço
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('corte');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePriceReais, setServicePriceReais] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [servicePopular, setServicePopular] = useState(false);
  const [serviceBadge, setServiceBadge] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [savingService, setSavingService] = useState(false);

  // SafeDeleteModal para Serviço
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  // Modal de Plano
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planTagline, setPlanTagline] = useState('');
  const [planPriceReais, setPlanPriceReais] = useState('');
  const [planBadge, setPlanBadge] = useState('');
  const [planHighlighted, setPlanHighlighted] = useState(false);
  const [planFeaturesText, setPlanFeaturesText] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // SafeDeleteModal para Plano
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Salvar CMS
  const [savingCms, setSavingCms] = useState(false);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [site, about, servicesData, plansData] = await Promise.all([
        getSiteContent(),
        getAboutContent(),
        listAdminServices(),
        listAdminPlans(),
      ]);

      // Site Content
      setLogoUrl(site.logoUrl || '/images/logo-removebg-preview.png');
      setHeroTitle(site.heroTitle || '');
      setHeroSubtitle(site.heroSubtitle || '');
      setHeroSlogan(site.heroSlogan || '');
      setHeroImage(site.heroImage || '/images/hero-bg.webp');

      setExperienceTitle(site.experienceTitle || '');
      setExperienceDescription(site.experienceDescription || '');
      setExperiencePhoto(site.experiencePhoto || '/images/hero-bg-2.webp');
      if (site.experienceItemsJson && site.experienceItemsJson.length > 0) {
        setExperienceItems(site.experienceItemsJson);
      }

      setWalkInTitle(site.walkInTitle || '');
      setWalkInSubtitle(site.walkInSubtitle || '');
      if (site.hoursJson && site.hoursJson.length > 0) {
        setHoursList(site.hoursJson);
      }

      setGoogleRating(site.googleRating ?? 4.9);
      setGoogleReviewsCount(site.googleReviewsCount ?? 150);
      if (site.reviewsJson && site.reviewsJson.length > 0) {
        setReviewsList(site.reviewsJson);
      }

      setWhatsappNumber(site.whatsappNumber || '');
      setWhatsappDisplay(site.whatsappDisplay || '');
      setAddressStreet(site.addressStreet || '');
      setAddressDistrict(site.addressDistrict || '');
      setAddressCity(site.addressCity || '');
      setAddressState(site.addressState || '');
      setMapsUrl(site.mapsUrl || '');
      setInstagramUrl(site.instagramUrl || '');
      setNoticeTitle(site.noticeTitle || '');
      setNoticeText(site.noticeText || '');

      // About
      setAboutTitle(about.title || '');
      setAboutSubtitle(about.subtitle || '');
      setStoryText(about.storyText || '');
      setManifestoText(about.manifestoText || '');
      setFounderName(about.founderName || '');
      setFounderRole(about.founderRole || '');
      setFounderBio(about.founderBio || '');
      setFounderPhoto(about.founderPhoto || '/images/hero-bg-2.webp');
      setShopPhotos(about.shopPhotos || []);

      // Tabela de Serviços & Planos
      setServices(servicesData);
      setPlans(plansData);
    } catch (err) {
      console.error('Erro ao carregar dados do CMS:', err);
      showFeedback('Erro ao carregar dados do painel de conteúdo.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Salvar Configurações Gerais do Site
  const handleSaveGeneralContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      const res = await updateSiteContent({
        logoUrl,
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
        heroSlogan: heroSlogan.trim(),
        heroImage,
        experienceTitle: experienceTitle.trim(),
        experienceDescription: experienceDescription.trim(),
        experiencePhoto,
        experienceItemsJson: experienceItems,
        walkInTitle: walkInTitle.trim(),
        walkInSubtitle: walkInSubtitle.trim(),
        hoursJson: hoursList,
        googleRating: Number(googleRating),
        googleReviewsCount: Number(googleReviewsCount),
        reviewsJson: reviewsList,
        whatsappNumber: whatsappNumber.replace(/\D/g, ''),
        whatsappDisplay: whatsappDisplay.trim(),
        addressStreet: addressStreet.trim(),
        addressDistrict: addressDistrict.trim(),
        addressCity: addressCity.trim(),
        addressState: addressState.trim(),
        mapsUrl: mapsUrl.trim() || null,
        instagramUrl: instagramUrl.trim(),
        noticeTitle: noticeTitle.trim(),
        noticeText: noticeText.trim(),
      });

      if (res.ok) {
        showFeedback('Configurações da Landing Page atualizadas com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao salvar alterações.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar.', true);
    } finally {
      setSavingCms(false);
    }
  };

  // Salvar Conteúdo Institucional
  const handleSaveAboutContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      const res = await updateAboutContent({
        title: aboutTitle.trim(),
        subtitle: aboutSubtitle.trim(),
        storyText: storyText.trim(),
        manifestoText: manifestoText.trim(),
        founderName: founderName.trim(),
        founderRole: founderRole.trim(),
        founderBio: founderBio.trim(),
        founderPhoto,
        shopPhotos,
      });

      if (res.ok) {
        showFeedback('Conteúdo institucional e história salvos com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao salvar conteúdo.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar.', true);
    } finally {
      setSavingCms(false);
    }
  };

  // ==========================================
  // HANDLERS: SERVIÇOS
  // ==========================================
  const handleOpenServiceModal = (service?: Service) => {
    setEditingService(service || null);
    setIsServiceModalOpen(true);
  };

  const handleSaveServiceModal = async (data: {
    id?: string;
    name: string;
    category: string;
    description: string;
    priceInCents: number;
    durationMinutes: number;
    popular: boolean;
    badge: string;
    image?: string;
    gallery: { url: string; title?: string }[];
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (data.id) {
        const res = await updateService(data.id, data);
        if (res.ok) {
          showFeedback('Serviço atualizado com sucesso!');
          const updated = await listAdminServices();
          setServices(updated);
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } else {
        const res = await createService(data);
        if (res.ok) {
          showFeedback('Novo serviço criado com sucesso!');
          const updated = await listAdminServices();
          setServices(updated);
          return { ok: true };
        }
        return { ok: false, error: res.error };
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Falha ao processar serviço.' };
    }
  };

  const handleDeleteServiceConfirm = async () => {
    if (!serviceToDelete) return;
    setIsDeletingService(true);
    try {
      const res = await deleteService(serviceToDelete.id);
      if (res.ok) {
        showFeedback('Serviço excluído com sucesso!');
        setServiceToDelete(null);
        const updated = await listAdminServices();
        setServices(updated);
      } else {
        showFeedback(res.error || 'Erro ao excluir serviço.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao excluir.', true);
    } finally {
      setIsDeletingService(false);
    }
  };

  // ==========================================
  // HANDLERS: PLANOS
  // ==========================================
  const handleOpenPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanTagline(plan.tagline);
      setPlanPriceReais((plan.priceInCents / 100).toFixed(2));
      setPlanBadge(plan.badge || '');
      setPlanHighlighted(Boolean(plan.highlighted));
      const featuresStr = plan.features.map((f) => `${f.included ? '+' : '-'} ${f.label}`).join('\n');
      setPlanFeaturesText(featuresStr);
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanTagline('');
      setPlanPriceReais('119.90');
      setPlanBadge('');
      setPlanHighlighted(false);
      setPlanFeaturesText('+ Cortes ilimitados de Seg a Qua\n+ Atendimento prioritário\n+ Toalha quente e finalização');
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      const priceCents = Math.round(parseFloat(planPriceReais.replace(',', '.')) * 100);
      if (isNaN(priceCents) || priceCents <= 0) {
        showFeedback('Informe um valor mensal válido em R$.', true);
        setSavingPlan(false);
        return;
      }

      // Converte linhas de features: + Inclusa, - Exclusa
      const parsedFeatures: PlanFeature[] = planFeaturesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          if (line.startsWith('-')) {
            return { label: line.replace(/^-\s*/, ''), included: false };
          }
          return { label: line.replace(/^\+\s*/, ''), included: true };
        });

      if (editingPlan) {
        const res = await updatePlan(editingPlan.id, {
          name: planName,
          tagline: planTagline,
          priceInCents: priceCents,
          features: parsedFeatures,
          highlighted: planHighlighted,
          badge: planBadge.trim() || null,
        });

        if (res.ok) {
          showFeedback('Plano atualizado com sucesso!');
          setIsPlanModalOpen(false);
          const updated = await listAdminPlans();
          setPlans(updated);
        } else {
          showFeedback(res.error || 'Erro ao salvar plano.', true);
        }
      } else {
        const res = await createPlan({
          name: planName,
          tagline: planTagline,
          priceInCents: priceCents,
          features: parsedFeatures,
          highlighted: planHighlighted,
          badge: planBadge.trim() || undefined,
        });

        if (res.ok) {
          showFeedback('Novo plano criado com sucesso!');
          setIsPlanModalOpen(false);
          const updated = await listAdminPlans();
          setPlans(updated);
        } else {
          showFeedback(res.error || 'Erro ao criar plano.', true);
        }
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao processar plano.', true);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlanConfirm = async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);
    try {
      const res = await deletePlan(planToDelete.id);
      if (res.ok) {
        showFeedback('Plano excluído com sucesso!');
        setPlanToDelete(null);
        const updated = await listAdminPlans();
        setPlans(updated);
      } else {
        showFeedback(res.error || 'Erro ao excluir plano.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao excluir.', true);
    } finally {
      setIsDeletingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded text-xs font-medium border ${
            feedback.isError
              ? 'bg-red-950/80 border-red-500/40 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Cabeçalho Unificado do CMS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
            Gestão Total da Landing Page
          </h2>
          <p className="text-xs text-brand-cream/50">
            Altere 100% dos textos, imagens, diferenciais, serviços, planos, horários e avaliações do site
          </p>
        </div>

        {/* Barra de Sub-abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 border border-white/10 rounded">
          <button
            type="button"
            onClick={() => setActiveSubTab('identity')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'identity'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Identidade &amp; Hero
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('experience')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'experience'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Experiência Beck
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('services')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'services'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Tabela de Serviços ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'plans'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Planos do Clube ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('hours')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'hours'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Horários &amp; Funcionamento
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('reviews')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'reviews'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Avaliações Google
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('contacts')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'contacts'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Contatos &amp; Redes
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('about')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'about'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            História &amp; Barbearia
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-brand-cream/40 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-brand-gold" />
          <span className="text-xs font-mono">Carregando conteúdos do CMS...</span>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* SUB-ABA 1: IDENTIDADE & HERO                             */}
          {/* ======================================================== */}
          {activeSubTab === 'identity' && (
            <form onSubmit={handleSaveGeneralContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Identidade Visual &amp; Hero Parallax
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Logotipo oficial da barbearia, imagem de fundo com efeito parallax e frases principais
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Upload da Logo Oficial */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-2">
                      Logotipo Oficial da Barbearia
                    </label>
                    <ImageUploadField
                      value={logoUrl}
                      onChange={setLogoUrl}
                      label="Logo oficial com fundo transparente (.png ou .webp)"
                    />
                  </div>

                  {/* Upload da Imagem Hero */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-2">
                      Imagem de Fundo Hero (Parallax)
                    </label>
                    <ImageUploadField
                      value={heroImage}
                      onChange={setHeroImage}
                      label="Foto panorâmica da barbearia (.webp)"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título Principal (H1) *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Subtítulo de Impacto *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Slogan de Atitude &amp; Posicionamento *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroSlogan}
                      onChange={(e) => setHeroSlogan(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar Identidade & Hero'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 2: EXPERIÊNCIA BECK                              */}
          {/* ======================================================== */}
          {activeSubTab === 'experience' && (
            <form onSubmit={handleSaveGeneralContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Seção: A Experiência Beck
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Apresentação dos diferenciais, foto de destaque da navalha e os 4 pilares do ritual
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título da Seção *
                    </label>
                    <input
                      type="text"
                      required
                      value={experienceTitle}
                      onChange={(e) => setExperienceTitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Foto de Destaque da Experiência
                    </label>
                    <ImageUploadField
                      value={experiencePhoto}
                      onChange={setExperiencePhoto}
                      label="Foto vertical do atendimento (.webp)"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Descrição de Apoio *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={experienceDescription}
                      onChange={(e) => setExperienceDescription(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* 4 Cards de Diferenciais */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Os 4 Diferenciais do Ritual Beck
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {experienceItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded border border-white/10 bg-black/50 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-brand-gold font-bold">
                            CARD #{idx + 1}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...experienceItems];
                              updated[idx].title = e.target.value;
                              setExperienceItems(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Descrição
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={item.text}
                            onChange={(e) => {
                              const updated = [...experienceItems];
                              updated[idx].text = e.target.value;
                              setExperienceItems(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar Experiência Beck'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 3: TABELA DE SERVIÇOS (CRUD)                     */}
          {/* ======================================================== */}
          {activeSubTab === 'services' && (
            <div className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                      Tabela de Serviços &amp; Preços
                    </h3>
                    <p className="text-[11px] text-brand-cream/50">
                      Cadastre, altere valores em R$, duração e destaques exibidos na Landing Page
                    </p>
                  </div>
                  <BrandButton
                    type="button"
                    variant="gold"
                    size="sm"
                    onClick={() => handleOpenServiceModal()}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Novo Serviço</span>
                  </BrandButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {services.map((service) => {
                    const photosCount = service.gallery?.length || (service.image ? 1 : 0);
                    const coverPhoto = service.gallery?.[0]?.url || service.image || '/images/hero-bg.webp';

                    return (
                      <div
                        key={service.id}
                        className="rounded border border-white/10 bg-black/60 overflow-hidden flex flex-col justify-between hover:border-brand-gold/40 transition"
                      >
                        <div>
                          {/* Miniatura da Foto de Capa do Corte */}
                          <div className="relative aspect-[16/10] w-full bg-black/80 border-b border-white/10">
                            <Image
                              src={coverPhoto}
                              alt={service.name}
                              fill
                              sizes="240px"
                              className="object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/80 text-brand-gold border border-brand-gold/40 backdrop-blur-sm">
                                {photosCount} {photosCount === 1 ? 'foto' : 'fotos'}
                              </span>
                            </div>
                            {service.badge && (
                              <span className="absolute top-2 right-2 text-[9px] font-mono uppercase bg-brand-gold text-brand-black font-bold px-1.5 py-0.5 rounded shadow">
                                {service.badge}
                              </span>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <h4 className="font-display text-sm font-bold uppercase text-brand-cream">
                              {service.name}
                            </h4>
                            <p className="text-xs text-brand-cream/60 line-clamp-2">{service.description}</p>
                            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                              <span className="font-display text-base font-bold text-brand-gold">
                                {formatBRL(service.priceInCents)}
                              </span>
                              <span className="text-[11px] font-mono text-brand-cream/50 flex items-center gap-1">
                                <Clock size={12} /> {service.durationMinutes} min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border-t border-white/10 flex items-center justify-between bg-black/40">
                          <button
                            type="button"
                            onClick={() => handleOpenServiceModal(service)}
                            className="text-[11px] font-mono text-brand-gold hover:underline flex items-center gap-1"
                          >
                            <Edit2 size={12} />
                            <span>Editar &amp; Fotos</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setServiceToDelete(service)}
                            className="p-1.5 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded transition"
                            title="Excluir Serviço"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 4: PLANOS DO CLUBE (CRUD + WHATSAPP)             */}
          {/* ======================================================== */}
          {activeSubTab === 'plans' && (
            <div className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                      Planos Mensais do Clube da Barba
                    </h3>
                    <p className="text-[11px] text-brand-cream/50">
                      Planos e assinaturas são contratados via WhatsApp diretamente com a barbearia
                    </p>
                  </div>
                  <BrandButton
                    type="button"
                    variant="gold"
                    size="sm"
                    onClick={() => handleOpenPlanModal()}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Novo Plano</span>
                  </BrandButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-6 rounded-lg border flex flex-col justify-between ${
                        plan.highlighted
                          ? 'border-brand-gold/60 bg-[#181818] shadow-gold'
                          : 'border-white/10 bg-black/60'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-display text-base font-bold uppercase text-brand-cream">
                              {plan.name}
                            </h4>
                            <p className="text-xs text-brand-cream/60">{plan.tagline}</p>
                          </div>
                          {plan.badge && (
                            <span className="text-[10px] font-mono uppercase bg-brand-gold text-brand-black font-bold px-2 py-0.5 rounded">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="font-display text-3xl font-bold text-brand-cream">
                            {formatBRL(plan.priceInCents)}
                          </span>
                          <span className="text-xs text-brand-cream/50 font-mono"> /mês</span>
                        </div>

                        <div className="border-t border-white/10 pt-3 space-y-2">
                          <p className="text-[10px] font-mono uppercase text-brand-gold font-bold">
                            Benefícios:
                          </p>
                          <ul className="text-xs space-y-1 text-brand-cream/80">
                            {plan.features.map((feat, i) => (
                              <li
                                key={i}
                                className={`flex items-center gap-2 ${
                                  feat.included ? 'text-brand-cream' : 'text-brand-cream/40 line-through'
                                }`}
                              >
                                {feat.included ? (
                                  <Check size={12} className="text-brand-gold shrink-0" />
                                ) : (
                                  <X size={12} className="text-brand-cream/40 shrink-0" />
                                )}
                                <span>{feat.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400">
                          Negociação no WhatsApp ativa
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPlanModal(plan)}
                            className="p-1.5 text-brand-cream/70 hover:text-brand-gold border border-white/10 hover:border-brand-gold/40 rounded transition"
                            title="Editar Plano"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanToDelete(plan)}
                            className="p-1.5 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded transition"
                            title="Excluir Plano"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 5: HORÁRIOS & FUNCIONAMENTO                      */}
          {/* ======================================================== */}
          {activeSubTab === 'hours' && (
            <form onSubmit={handleSaveGeneralContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Horários de Atendimento &amp; Banner de Chegada
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Defina os blocos de horário por dia e as mensagens de atendimento por ordem de chegada
                  </p>
                </div>

                {/* Banner Chegou, Sentou, é seu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título do Banner *
                    </label>
                    <input
                      type="text"
                      required
                      value={walkInTitle}
                      onChange={(e) => setWalkInTitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Subtítulo do Banner *
                    </label>
                    <input
                      type="text"
                      required
                      value={walkInSubtitle}
                      onChange={(e) => setWalkInSubtitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Slots de Horários */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Quadro Semanal de Funcionamento
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {hoursList.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded border border-white/10 bg-black/50 space-y-3"
                      >
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Dias da Semana
                          </label>
                          <input
                            type="text"
                            required
                            value={slot.days}
                            onChange={(e) => {
                              const updated = [...hoursList];
                              updated[idx].days = e.target.value;
                              setHoursList(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Horário
                          </label>
                          <input
                            type="text"
                            required
                            value={slot.time}
                            onChange={(e) => {
                              const updated = [...hoursList];
                              updated[idx].time = e.target.value;
                              setHoursList(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-brand-cream/80 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={slot.open}
                            onChange={(e) => {
                              const updated = [...hoursList];
                              updated[idx].open = e.target.checked;
                              setHoursList(updated);
                            }}
                            className="rounded border-white/20 text-brand-gold focus:ring-brand-gold bg-black"
                          />
                          <span>Exibir como dia aberto</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar Horários'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 6: AVALIAÇÕES GOOGLE                             */}
          {/* ======================================================== */}
          {activeSubTab === 'reviews' && (
            <form onSubmit={handleSaveGeneralContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Prova Social &amp; Avaliações do Google
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Nota média, total de avaliações e depoimentos de clientes exibidos na página inicial
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Nota Média (ex: 4.9) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      required
                      value={googleRating}
                      onChange={(e) => setGoogleRating(parseFloat(e.target.value))}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Quantidade de Avaliações *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={googleReviewsCount}
                      onChange={(e) => setGoogleReviewsCount(parseInt(e.target.value, 10))}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Depoimentos */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                      Depoimentos de Clientes ({reviewsList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewsList([
                          ...reviewsList,
                          {
                            name: 'Novo Cliente',
                            role: 'Cliente frequente',
                            rating: 5,
                            date: 'Recente',
                            comment: 'Atendimento excepcional e corte preciso.',
                          },
                        ])
                      }
                      className="text-xs font-mono uppercase text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Adicionar Depoimento
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reviewsList.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded border border-white/10 bg-black/60 space-y-2.5 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reviewsList.filter((_, i) => i !== idx);
                            setReviewsList(updated);
                          }}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1"
                          title="Remover depoimento"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Nome do Cliente
                          </label>
                          <input
                            type="text"
                            required
                            value={rev.name}
                            onChange={(e) => {
                              const updated = [...reviewsList];
                              updated[idx].name = e.target.value;
                              setReviewsList(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                              Papel / Relação
                            </label>
                            <input
                              type="text"
                              value={rev.role}
                              onChange={(e) => {
                                const updated = [...reviewsList];
                                updated[idx].role = e.target.value;
                                setReviewsList(updated);
                              }}
                              className="w-full bg-black/70 border border-white/15 rounded px-2 py-1 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                              Data / Período
                            </label>
                            <input
                              type="text"
                              value={rev.date}
                              onChange={(e) => {
                                const updated = [...reviewsList];
                                updated[idx].date = e.target.value;
                                setReviewsList(updated);
                              }}
                              className="w-full bg-black/70 border border-white/15 rounded px-2 py-1 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-cream/60 mb-1">
                            Comentário
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={rev.comment}
                            onChange={(e) => {
                              const updated = [...reviewsList];
                              updated[idx].comment = e.target.value;
                              setReviewsList(updated);
                            }}
                            className="w-full bg-black/70 border border-white/15 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar Avaliações'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 7: CONTATOS & REDES                              */}
          {/* ======================================================== */}
          {activeSubTab === 'contacts' && (
            <form onSubmit={handleSaveGeneralContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Contatos Oficiais, Endereço &amp; Redes
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    O WhatsApp cadastrado aqui é utilizado diretamente para negociar planos e agendar atendimentos
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      WhatsApp (Apenas Dígitos com DDI) *
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      WhatsApp para Exibição no Rodapé *
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsappDisplay}
                      onChange={(e) => setWhatsappDisplay(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Instagram Oficial
                    </label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Link do Google Maps
                    </label>
                    <input
                      type="text"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Logradouro e Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressDistrict}
                      onChange={(e) => setAddressDistrict(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Cidade e Estado *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        className="w-3/4 bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                      />
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                        className="w-1/4 bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Aviso dos Dias do Clube */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Regra Oficial do Clube (Segunda a Quarta-feira)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        Título do Aviso *
                      </label>
                      <input
                        type="text"
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        Texto Explicativo *
                      </label>
                      <input
                        type="text"
                        required
                        value={noticeText}
                        onChange={(e) => setNoticeText(e.target.value)}
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar Contatos & Redes'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 8: HISTÓRIA & BARBEARIA                          */}
          {/* ======================================================== */}
          {activeSubTab === 'about' && (
            <form onSubmit={handleSaveAboutContent} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Seção Institucional &amp; História da Barbearia
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Origem, manifesto, dados e foto do mestre barbeiro fundador
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título da Seção Sobre *
                    </label>
                    <input
                      type="text"
                      required
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Subtítulo Institucional *
                    </label>
                    <input
                      type="text"
                      required
                      value={aboutSubtitle}
                      onChange={(e) => setAboutSubtitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      História da Barbearia *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Manifesto de Estilo *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={manifestoText}
                      onChange={(e) => setManifestoText(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Nome do Fundador *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Cargo do Fundador *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderRole}
                      onChange={(e) => setFounderRole(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Foto do Fundador
                    </label>
                    <ImageUploadField
                      value={founderPhoto}
                      onChange={setFounderPhoto}
                      label="Foto de perfil do fundador (.webp)"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Biografia Resumida do Fundador *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderBio}
                      onChange={(e) => setFounderBio(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* ======================================================== */}
                {/* FOTOS DO ESPAÇO DA BARBEARIA (ATÉ 6 FOTOS)              */}
                {/* ======================================================== */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                        Fotos do Espaço da Barbearia (Ambiente &amp; Fachada)
                      </h4>
                      <p className="text-[11px] text-brand-cream/60">
                        Adicione até 6 fotos reais do ambiente da barbearia para serem exibidas na página Sobre.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-brand-gold font-bold px-2 py-0.5 rounded bg-black/60 border border-white/10">
                      {shopPhotos.length} / 6 fotos
                    </span>
                  </div>

                  {shopPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {shopPhotos.map((photoUrl, idx) => (
                        <div key={idx} className="relative aspect-square rounded overflow-hidden border border-white/15 group bg-black/60">
                          <Image src={photoUrl} alt={`Foto espaço ${idx + 1}`} fill sizes="140px" className="object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setShopPhotos((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded bg-red-950 text-red-300 border border-red-500/40 hover:bg-red-900 transition"
                              title="Remover foto do espaço"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {shopPhotos.length < 6 ? (
                    <div className="p-3.5 rounded border border-dashed border-white/20 bg-black/30 space-y-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/80">
                        Adicionar Nova Foto do Espaço ({shopPhotos.length + 1}ª de 6)
                      </label>
                      <ImageUploadField
                        value={newShopPhotoUrl}
                        onChange={(url) => {
                          if (url) {
                            setShopPhotos((prev) => [...prev, url]);
                            setNewShopPhotoUrl('');
                          }
                        }}
                        label="Clique para upload da foto do espaço (.webp, .jpg, .png)"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 font-mono">
                      Limite de 6 fotos do espaço atingido.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <BrandButton type="submit" variant="gold" size="sm" disabled={savingCms}>
                    {savingCms ? 'Salvando...' : 'Salvar História &amp; Institucional'}
                  </BrandButton>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL DEDICADO: SERVIÇO COM GALERIA DE ATÉ 5 FOTOS       */}
      {/* ======================================================== */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        service={editingService}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveServiceModal}
      />

      {/* ======================================================== */}
      {/* MODAL 4-GRID: PLANO (CRIAR / EDITAR)                     */}
      {/* ======================================================== */}
      {isPlanModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-brand-gold/30 bg-[#141414] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
                  {editingPlan ? 'Editar Plano do Clube' : 'Novo Plano do Clube'}
                </h3>
                <p className="text-xs text-brand-cream/60">
                  Os clientes negociam e aderem ao plano diretamente pelo WhatsApp oficial
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="text-brand-cream/50 hover:text-brand-cream p-1.5 rounded hover:bg-white/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Mensalidade em R$ *
                  </label>
                  <input
                    type="text"
                    required
                    value={planPriceReais}
                    onChange={(e) => setPlanPriceReais(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Badge de Destaque
                  </label>
                  <input
                    type="text"
                    value={planBadge}
                    onChange={(e) => setPlanBadge(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Slogan do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    value={planTagline}
                    onChange={(e) => setPlanTagline(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs text-brand-cream/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planHighlighted}
                      onChange={(e) => setPlanHighlighted(e.target.checked)}
                      className="rounded border-white/20 text-brand-gold focus:ring-brand-gold bg-black"
                    />
                    <span>Plano em Destaque</span>
                  </label>
                </div>

                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70">
                      Lista de Benefícios (1 por linha) *
                    </label>
                    <span className="text-[10px] font-mono text-brand-gold">
                      Use + para item incluso e - para item não incluso
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={planFeaturesText}
                    onChange={(e) => setPlanFeaturesText(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition font-mono leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/70 hover:text-brand-cream transition"
                >
                  Cancelar
                </button>
                <BrandButton type="submit" variant="gold" size="sm" disabled={savingPlan}>
                  {savingPlan ? 'Salvando...' : editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                </BrandButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SafeDeleteModal para Serviço */}
      <SafeDeleteModal
        isOpen={Boolean(serviceToDelete)}
        title="Excluir Serviço"
        description="Tem certeza que deseja remover este serviço da tabela da barbearia? Esta ação não pode ser desfeita."
        itemName={serviceToDelete?.name || ''}
        isDeleting={isDeletingService}
        onConfirm={handleDeleteServiceConfirm}
        onClose={() => setServiceToDelete(null)}
      />

      {/* SafeDeleteModal para Plano */}
      <SafeDeleteModal
        isOpen={Boolean(planToDelete)}
        title="Excluir Plano do Clube"
        description="Tem certeza que deseja remover este plano do Clube da Barba? Os assinantes ativos permanecerão no banco de dados."
        itemName={planToDelete?.name || ''}
        isDeleting={isDeletingPlan}
        onConfirm={handleDeletePlanConfirm}
        onClose={() => setPlanToDelete(null)}
      />
    </div>
  );
}

export default SiteCmsManager;
