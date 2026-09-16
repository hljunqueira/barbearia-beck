'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BrandButton } from '@/components/BrandButton';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import {
  getSiteContent,
  updateSiteContent,
  getAboutContent,
  updateAboutContent,
  type SiteContentData,
  type AboutContentData,
} from '@/app/actions/siteContentActions';

export function SiteCmsManager() {
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'about'>('home');
  const [loading, setLoading] = useState(true);

  // Estados Página Inicial
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSlogan, setHeroSlogan] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [savingHome, setSavingHome] = useState(false);

  // Estados Sobre / História
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [manifestoText, setManifestoText] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [founderPhoto, setFounderPhoto] = useState('');
  const [savingAbout, setSavingAbout] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [site, about] = await Promise.all([getSiteContent(), getAboutContent()]);

      // Home
      setHeroTitle(site.heroTitle || '');
      setHeroSubtitle(site.heroSubtitle || '');
      setHeroSlogan(site.heroSlogan || '');
      setHeroImage(site.heroImage || '/images/hero-bg.webp');
      setWhatsappNumber(site.whatsappNumber || '');
      setWhatsappDisplay(site.whatsappDisplay || '');
      setAddressStreet(site.addressStreet || '');
      setAddressDistrict(site.addressDistrict || '');
      setAddressCity(site.addressCity || '');
      setAddressState(site.addressState || '');
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
    } catch (err) {
      console.error('Erro ao carregar conteúdo do site:', err);
      showFeedback('Erro ao carregar conteúdos do site.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHome(true);
    try {
      const res = await updateSiteContent({
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
        heroSlogan: heroSlogan.trim(),
        heroImage: heroImage.trim(),
        whatsappNumber: whatsappNumber.replace(/\D/g, ''),
        whatsappDisplay: whatsappDisplay.trim(),
        addressStreet: addressStreet.trim(),
        addressDistrict: addressDistrict.trim(),
        addressCity: addressCity.trim(),
        addressState: addressState.trim(),
        instagramUrl: instagramUrl.trim(),
        noticeTitle: noticeTitle.trim(),
        noticeText: noticeText.trim(),
      });

      if (res.ok) {
        showFeedback('Conteúdo da Página Inicial atualizado com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao salvar página inicial.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar.', true);
    } finally {
      setSavingHome(false);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    try {
      const res = await updateAboutContent({
        title: aboutTitle.trim(),
        subtitle: aboutSubtitle.trim(),
        storyText: storyText.trim(),
        manifestoText: manifestoText.trim(),
        founderName: founderName.trim(),
        founderRole: founderRole.trim(),
        founderBio: founderBio.trim(),
        founderPhoto: founderPhoto.trim(),
      });

      if (res.ok) {
        showFeedback('Conteúdo institucional atualizado com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao salvar conteúdo institucional.', true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar.', true);
    } finally {
      setSavingAbout(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded text-xs font-medium border ${
            feedback.isError
              ? 'bg-red-950/80 border-red-500/40 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Cabeçalho Unificado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
            Conteúdo do Site & Identidade
          </h2>
          <p className="text-xs text-brand-cream/50">
            Atualize os textos, imagens de destaque, contatos e história da barbearia em tempo real
          </p>
        </div>

        {/* Sub-abas */}
        <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded">
          <button
            type="button"
            onClick={() => setActiveSubTab('home')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeSubTab === 'home'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Página Inicial & Cabeçalho
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
            História & Barbearia
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-brand-cream/40 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-brand-gold" />
          <span className="text-xs font-mono">Carregando conteúdos do CMS...</span>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* SUB-ABA 1: PÁGINA INICIAL & HERO                         */}
          {/* ======================================================== */}
          {activeSubTab === 'home' && (
            <form onSubmit={handleSaveHome} className="space-y-6">
              {/* Bloco 1: Hero & Textos de Destaque */}
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Hero Section (Topo da Página Inicial)
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Textos e imagem exibidos com efeito Parallax no primeiro contato do cliente
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título Principal (H1) *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="Ex: Beck Barbearia"
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
                      placeholder="Ex: Estilo não é moda, é atitude."
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Slogan da Barbearia
                  </label>
                  <input
                    type="text"
                    value={heroSlogan}
                    onChange={(e) => setHeroSlogan(e.target.value)}
                    placeholder="Ex: Seu estilo, nossa missão! Chegou, sentou, é seu!"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Imagem de Fundo do Hero (Supabase Storage)"
                    value={heroImage}
                    onChange={(url) => setHeroImage(url)}
                    aspectRatio="banner"
                    helpText="Imagem de alta resolução que compõe o fundo com parallax no topo da página inicial."
                  />
                </div>
              </div>

              {/* Bloco 2: Contatos & Localização */}
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Canais de Atendimento & Endereço
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Configuração do WhatsApp oficial e localização física no rodapé
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Número WhatsApp (DDI+DDD) *
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="554899578323"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      WhatsApp Formatado (Exibição)
                    </label>
                    <input
                      type="text"
                      value={whatsappDisplay}
                      onChange={(e) => setWhatsappDisplay(e.target.value)}
                      placeholder="+55 48 9957-8323"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Logradouro & Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="Avenida Barriga Verde, 300"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Cidade & Estado *
                    </label>
                    <input
                      type="text"
                      required
                      value={`${addressCity} - ${addressState}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        setAddressCity(parts[0]?.trim() || '');
                        setAddressState(parts[1]?.trim() || 'SC');
                      }}
                      placeholder="Balneário Arroio do Silva - SC"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Link do Instagram Oficial
                    </label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/beckbarbearia"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={addressDistrict}
                      onChange={(e) => setAddressDistrict(e.target.value)}
                      placeholder="Centro"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 3: Aviso Institucional do Clube */}
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Aviso do Clube da Barba (Banner Informativo)
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Informa aos clientes as regras e dias de atendimento do plano
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Título do Aviso
                  </label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Ex: Atenção aos dias de atendimento do Clube"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Texto do Aviso
                  </label>
                  <textarea
                    rows={2}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    placeholder="Ex: Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira."
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Botão Salvar Home */}
              <div className="flex justify-end pt-2">
                <BrandButton type="submit" disabled={savingHome} className="px-6 py-2.5 text-xs">
                  {savingHome ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Salvando Alterações...</span>
                    </span>
                  ) : (
                    <span>Salvar Conteúdo da Página Inicial</span>
                  )}
                </BrandButton>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-ABA 2: SOBRE / HISTÓRIA & FUNDADOR                   */}
          {/* ======================================================== */}
          {activeSubTab === 'about' && (
            <form onSubmit={handleSaveAbout} className="space-y-6">
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    História da Beck Barbearia & Manifesto
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Conteúdo institucional exibido na seção &quot;Sobre Nós&quot; da Página Inicial e página dedicada
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Título Institucional *
                    </label>
                    <input
                      type="text"
                      required
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      placeholder="Ex: Tradição, Navalha & Respeito ao Cavalheiro"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Subtítulo Institucional *
                    </label>
                    <input
                      type="text"
                      required
                      value={aboutSubtitle}
                      onChange={(e) => setAboutSubtitle(e.target.value)}
                      placeholder="Ex: A essência da barbearia clássica viva no coração de Balneário Arroio do Silva."
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    História Completa *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Conte como a barbearia nasceu, seus valores, dedicação ao ofício tradicional..."
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Manifesto de Estilo
                  </label>
                  <textarea
                    rows={3}
                    value={manifestoText}
                    onChange={(e) => setManifestoText(e.target.value)}
                    placeholder="Nosso lema: estilo não é moda passageira, é atitude construída em cada detalhe..."
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Perfil do Fundador */}
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Perfil do Fundador & Mestre Barbeiro
                  </h3>
                  <p className="text-[11px] text-brand-cream/50">
                    Informações e retrato do fundador exibidos para os clientes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Nome do Fundador *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      placeholder="Ex: Henrique Becker"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Cargo / Especialidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderRole}
                      onChange={(e) => setFounderRole(e.target.value)}
                      placeholder="Ex: Fundador & Mestre Barbeiro"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Biografia Resumida do Fundador
                    </label>
                    <textarea
                      rows={5}
                      value={founderBio}
                      onChange={(e) => setFounderBio(e.target.value)}
                      placeholder="Descreva a experiência, visão e formação do mestre barbeiro..."
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                    />
                  </div>

                  <div>
                    <ImageUploadField
                      label="Foto do Fundador (Supabase Storage)"
                      value={founderPhoto}
                      onChange={(url) => setFounderPhoto(url)}
                      aspectRatio="square"
                      helpText="Envie um retrato nítido do mestre barbeiro no ambiente clássico da barbearia."
                    />
                  </div>
                </div>
              </div>

              {/* Botão Salvar Sobre */}
              <div className="flex justify-end pt-2">
                <BrandButton type="submit" disabled={savingAbout} className="px-6 py-2.5 text-xs">
                  {savingAbout ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Salvando Alterações...</span>
                    </span>
                  ) : (
                    <span>Salvar Conteúdo Institucional</span>
                  )}
                </BrandButton>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
