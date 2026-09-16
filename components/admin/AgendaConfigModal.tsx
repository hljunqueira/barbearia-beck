'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AgendaSettings } from '@/types';
import { BrandButton } from '@/components/BrandButton';

interface AgendaConfigModalProps {
  isOpen: boolean;
  settings?: AgendaSettings | null;
  onClose: () => void;
  onSave: (data: {
    slotIntervalMinutes: number;
    openingTime: string;
    closingTime: string;
    allowedClubDays: number[];
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function AgendaConfigModal({
  isOpen,
  settings,
  onClose,
  onSave,
}: AgendaConfigModalProps) {
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('19:30');
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(30);
  const [allowedClubDays, setAllowedClubDays] = useState<number[]>([1, 2, 3]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setOpeningTime(settings.openingTime || '08:00');
      setClosingTime(settings.closingTime || '19:30');
      setSlotIntervalMinutes(settings.slotIntervalMinutes || 30);
      setAllowedClubDays(settings.allowedClubDays || [1, 2, 3]);
    }
    setError(null);
  }, [settings, isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const toggleDay = (dayNum: number) => {
    if (allowedClubDays.includes(dayNum)) {
      if (allowedClubDays.length <= 1) return; // manter ao menos 1 dia
      setAllowedClubDays(allowedClubDays.filter((d) => d !== dayNum));
    } else {
      setAllowedClubDays([...allowedClubDays, dayNum].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setSaving(true);
    try {
      const res = await onSave({
        openingTime,
        closingTime,
        slotIntervalMinutes: Number(slotIntervalMinutes),
        allowedClubDays,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao atualizar configurações da agenda.');
        setSaving(false);
      } else {
        setSaving(false);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Falha inesperada ao salvar.');
      setSaving(false);
    }
  };

  const DAYS = [
    { num: 1, label: 'Segunda-feira' },
    { num: 2, label: 'Terça-feira' },
    { num: 3, label: 'Quarta-feira' },
    { num: 4, label: 'Quinta-feira' },
    { num: 5, label: 'Sexta-feira' },
    { num: 6, label: 'Sábado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop 100% Sólido */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !saving && onClose()}
      />

      {/* Container do Modal 4-Grid */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Parâmetros de Funcionamento
            </p>
            <h2 className="font-display text-lg font-bold text-brand-cream uppercase tracking-wide">
              Configurações da Agenda &amp; Clube
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* GRID 3 COLUNAS: Horários e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Abertura da Grade *
              </label>
              <input
                type="time"
                required
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Fechamento da Grade *
              </label>
              <input
                type="time"
                required
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                Intervalo do Slot *
              </label>
              <select
                value={slotIntervalMinutes}
                onChange={(e) => setSlotIntervalMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
              >
                <option value={30}>30 minutos (Padrão)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1 hora)</option>
              </select>
            </div>
          </div>

          {/* Dias Permitidos para Atendimento do Clube */}
          <div className="p-4 rounded bg-black/40 border border-white/10 space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream font-bold">
                Dias de Atendimento Válidos para o Clube da Barba
              </label>
              <p className="text-[10px] text-brand-cream/50 mt-0.5">
                Os assinantes só conseguirão reservar horários nos dias selecionados abaixo
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS.map((day) => {
                const isActive = allowedClubDays.includes(day.num);
                return (
                  <button
                    key={day.num}
                    type="button"
                    onClick={() => toggleDay(day.num)}
                    className={`p-2.5 rounded border text-xs font-mono uppercase tracking-wider flex items-center justify-between transition ${
                      isActive
                        ? 'border-brand-gold bg-brand-gold/15 text-brand-gold font-bold'
                        : 'border-white/10 bg-black/50 text-brand-cream/40 hover:border-white/20'
                    }`}
                  >
                    <span>{day.label}</span>
                    <span className="text-[10px]">{isActive ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/60 hover:text-brand-cream hover:bg-white/5 rounded border border-white/10 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <BrandButton type="submit" disabled={saving} className="px-5 py-2 text-xs">
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Salvando...</span>
                </span>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
