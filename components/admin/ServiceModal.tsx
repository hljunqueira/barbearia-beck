'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Trash2, Star, Plus, AlertCircle, Images } from 'lucide-react';
import type { Service } from '@/types';
import { BrandButton } from '@/components/BrandButton';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface ServicePhotoItem {
  url: string;
  title?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  service?: Service | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    category: string;
    description: string;
    priceInCents: number;
    durationMinutes: number;
    popular: boolean;
    badge: string;
    image?: string;
    gallery: ServicePhotoItem[];
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function ServiceModal({ isOpen, service, onClose, onSave }: ServiceModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('corte');
  const [priceReais, setPriceReais] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [badge, setBadge] = useState('');
  const [popular, setPopular] = useState(false);
  const [description, setDescription] = useState('');
  const [gallery, setGallery] = useState<ServicePhotoItem[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory((service as any).category || 'corte');
      setPriceReais((service.priceInCents / 100).toFixed(2).replace('.', ','));
      setDurationMinutes(service.durationMinutes || 30);
      setBadge(service.badge || '');
      setPopular(Boolean(service.popular));
      setDescription(service.description || '');

      // Inicializa a galeria a partir das fotos reais salvas
      if (service.gallery && service.gallery.length > 0) {
        setGallery(service.gallery.map((p) => ({ url: p.url, title: p.title })));
      } else if (service.image) {
        setGallery([{ url: service.image, title: service.name }]);
      } else {
        setGallery([]);
      }
    } else {
      setName('');
      setCategory('corte');
      setPriceReais('');
      setDurationMinutes(30);
      setBadge('');
      setPopular(false);
      setDescription('');
      setGallery([]);
    }
    setNewPhotoUrl('');
    setError(null);
  }, [service, isOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const parseMoneyToCents = (val: string): number => {
    const clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const handleAddPhoto = (url: string) => {
    if (!url) return;
    if (gallery.length >= 5) {
      setError('Limite máximo de 5 fotos por corte atingido.');
      return;
    }
    setError(null);
    setGallery((prev) => [...prev, { url, title: name ? `${name} - Ângulo ${prev.length + 1}` : `Foto ${prev.length + 1}` }]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setGallery((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Informe um nome válido para o serviço.');
      return;
    }

    const priceInCents = parseMoneyToCents(priceReais);
    if (priceInCents <= 0) {
      setError('Informe um valor válido em R$ para o serviço.');
      return;
    }

    if (!description.trim()) {
      setError('A descrição detalhada do serviço é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      const res = await onSave({
        id: service?.id,
        name: name.trim(),
        category,
        description: description.trim(),
        priceInCents,
        durationMinutes: Number(durationMinutes) || 30,
        popular,
        badge: badge.trim(),
        image: gallery[0]?.url || undefined,
        gallery,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao salvar serviço.');
        setSaving(false);
      } else {
        setSaving(false);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar serviço.');
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-lg border border-brand-gold/30 bg-[#141414] shadow-2xl p-6 sm:p-8 space-y-6 text-brand-cream custom-scrollbar">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Tabela de Serviços & Galeria de Cortes
            </p>
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-cream">
              {service ? 'Editar Serviço' : 'Novo Serviço da Barbearia'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
            className="text-brand-cream/50 hover:text-brand-cream p-1.5 rounded hover:bg-white/5 transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas do Serviço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Nome do Serviço *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Degradê Navalhado / Fade"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              >
                <option value="corte">Cabelo / Corte</option>
                <option value="barba">Barba / Ritual</option>
                <option value="combo">Combo Completo</option>
                <option value="quimica">Química / Luzes / Platinado</option>
                <option value="acabamento">Acabamento / Sobrancelha</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Preço em R$ *
              </label>
              <input
                type="text"
                required
                value={priceReais}
                onChange={(e) => setPriceReais(e.target.value)}
                placeholder="35,00"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Duração Estimada (min) *
              </label>
              <input
                type="number"
                min="10"
                step="5"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Badge de Destaque
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Mais Pedido, Exclusivo"
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 text-xs text-brand-cream/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-white/20 text-brand-gold focus:ring-brand-gold bg-black h-4 w-4"
                />
                <span>Marcar como Mais Pedido (destaque dourado no card)</span>
              </label>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Descrição Detalhada do Serviço *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o que inclui o serviço, produtos utilizados e o acabamento final."
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* GALERIA DE FOTOS DO CORTE (ATÉ 5 FOTOS POR SERVIÇO)       */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Images size={15} className="text-brand-gold" />
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Galeria de Fotos do Corte
                  </h3>
                </div>
                <p className="text-[11px] text-brand-cream/60">
                  Adicione até 5 fotos reais mostrando os diferentes ângulos deste corte (frente, lateral, fade, nuca).
                </p>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-black/60 border border-white/15 text-brand-gold font-bold">
                {gallery.length} / 5 fotos adicionadas
              </span>
            </div>

            {/* Grid com as fotos cadastradas */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {gallery.map((photo, index) => {
                  const isCover = index === 0;
                  return (
                    <div
                      key={`${photo.url}-${index}`}
                      className={`relative aspect-square rounded overflow-hidden border transition bg-black/60 group ${
                        isCover ? 'border-brand-gold ring-1 ring-brand-gold/60' : 'border-white/15 hover:border-brand-gold/50'
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || `Foto ${index + 1}`}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />

                      {/* Tag de Capa */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-brand-gold text-brand-black shadow">
                          Capa
                        </span>
                      )}

                      {/* Overlay com Ações */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(index)}
                            className="flex items-center gap-1 text-[10px] font-mono uppercase bg-brand-gold/90 text-brand-black px-2 py-1 rounded hover:bg-brand-gold font-bold transition"
                            title="Definir como foto principal"
                          >
                            <Star size={11} />
                            <span>Capa</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="flex items-center gap-1 text-[10px] font-mono uppercase bg-red-950 text-red-300 border border-red-500/40 px-2 py-1 rounded hover:bg-red-900 transition"
                          title="Remover foto"
                        >
                          <Trash2 size={11} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Campo para adicionar nova foto se ainda não atingiu 5 */}
            {gallery.length < 5 ? (
              <div className="p-4 rounded border border-dashed border-white/20 bg-black/40 space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/80">
                  Adicionar Nova Foto ({gallery.length + 1}ª de 5)
                </label>
                <ImageUploadField
                  value={newPhotoUrl}
                  onChange={(url) => handleAddPhoto(url)}
                  label="Clique para fazer upload de nova foto (.webp, .jpg, .png)"
                />
              </div>
            ) : (
              <div className="p-3 rounded bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2 font-mono">
                <Star size={13} className="text-amber-400 shrink-0" />
                <span>Limite de 5 fotos atingido. Para trocar, remova uma das fotos acima.</span>
              </div>
            )}
          </div>

          {/* Rodapé com botões de ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/70 hover:text-brand-cream transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <BrandButton type="submit" variant="gold" size="sm" disabled={saving}>
              {saving ? 'Salvando...' : service ? 'Salvar Alterações' : 'Criar Serviço'}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceModal;
