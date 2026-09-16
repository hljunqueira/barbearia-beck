'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Subscription, Barber, SubscriptionStatus, PlanSlug } from '@/types';
import { BrandButton } from '@/components/BrandButton';

interface SubscriberModalProps {
  isOpen: boolean;
  subscriber?: Subscription | null; // se fornecido, modo edição; senão, modo criação
  barbers: Barber[];
  onClose: () => void;
  onSave: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    planSlug: PlanSlug;
    status: SubscriptionStatus;
    nextBillingDate: string;
    birthDate?: string | null;
    notes?: string | null;
    preferredBarberId?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function SubscriberModal({
  isOpen,
  subscriber,
  barbers,
  onClose,
  onSave,
}: SubscriberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planSlug, setPlanSlug] = useState<PlanSlug>('corte-barba');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredBarberId, setPreferredBarberId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscriber) {
      setName(subscriber.customerName);
      setPhone(subscriber.customerPhone);
      setEmail(subscriber.customerEmail);
      setPlanSlug(subscriber.planSlug);
      setStatus(subscriber.status);
      setNextBillingDate(subscriber.nextBillingDate);
      setBirthDate(subscriber.birthDate || '');
      setNotes(subscriber.notes || '');
      setPreferredBarberId(subscriber.preferredBarberId || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPlanSlug('corte-barba');
      setStatus('active');
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      setNextBillingDate(nextMonth.toISOString().split('T')[0]);
      setBirthDate('');
      setNotes('');
      setPreferredBarberId('');
    }
    setError(null);
  }, [subscriber, isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 3) {
      setError('Nome completo deve ter no mínimo 3 letras.');
      return;
    }

    if (!phone.replace(/\D/g, '') || phone.replace(/\D/g, '').length < 10) {
      setError('Telefone/WhatsApp deve ter no mínimo 10 dígitos com DDD.');
      return;
    }

    setSaving(true);
    try {
      const res = await onSave({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || `${phone.replace(/\D/g, '')}@cliente.beckbarbearia.com.br`,
        planSlug,
        status,
        nextBillingDate,
        birthDate: birthDate ? birthDate.trim() : null,
        notes: notes ? notes.trim() : null,
        preferredBarberId: preferredBarberId || null,
      });

      if (!res.ok) {
        setError(res.error || 'Falha ao salvar dados do assinante.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-lg border border-white/15 bg-[#141414] p-6 shadow-2xl text-brand-cream max-h-[92vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
              {subscriber ? 'Editar Assinante' : 'Novo Assinante do Clube'}
            </h2>
            <p className="text-[11px] text-brand-cream/60">
              {subscriber
                ? `Atualize os dados e preferências de ${subscriber.customerName}`
                : 'Cadastre manualmente um membro do Clube da Barba'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded p-1 text-brand-cream/50 hover:bg-white/5 hover:text-brand-cream transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Formulário em 4 Grids */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Linha 1: Nome (span-2), Telefone (1), Data Nascimento (1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo de Souza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                WhatsApp / Celular *
              </label>
              <input
                type="text"
                required
                placeholder="(48) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Linha 2: Plano (1), Status (1), Próxima Cobrança (1), Barbeiro Favorito (1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Plano do Clube
              </label>
              <select
                value={planSlug}
                onChange={(e) => setPlanSlug(e.target.value as PlanSlug)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
              >
                <option value="corte-barba">Corte + Barba (R$ 159,90)</option>
                <option value="corte">Cabelo (R$ 99,90)</option>
                <option value="barba">Barba (R$ 89,90)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
              >
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="past_due">Vencido</option>
                <option value="canceled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Próxima Cobrança
              </label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                Barbeiro Preferido
              </label>
              <select
                value={preferredBarberId}
                onChange={(e) => setPreferredBarberId(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
              >
                <option value="">Sem preferência fixa</option>
                {barbers
                  .filter((b) => b.active)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Email (span-2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
                E-mail (Opcional)
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Linha 4: Observações e Preferências (span-4) */}
          <div>
            <label className="block text-[11px] font-medium tracking-wider text-brand-cream/70 uppercase">
              Notas e Preferências do Cavalheiro (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Prefere corte com navalha e toalha bem quente, degradê baixo, café sem açúcar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded border border-white/10 bg-[#0A0A0A] px-3.5 py-2 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
            />
          </div>

          {/* Rodapé de Ações */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-cream/70 hover:text-brand-cream rounded transition"
            >
              Cancelar
            </button>
            <BrandButton type="submit" size="sm" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{subscriber ? 'Salvar Alterações' : 'Cadastrar Assinante'}</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
