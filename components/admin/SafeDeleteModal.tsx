'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface SafeDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string;
  itemTypeLabel?: string;
  description?: string;
  confirmText?: string;
  isDeleting?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Modal de Exclusão Seguro da Beck Barbearia.
 * Exibe aviso de confirmação em duas etapas para evitar qualquer exclusão acidental no Supabase.
 */
export function SafeDeleteModal({
  isOpen,
  title = 'Confirmar Exclusão Definitiva',
  itemName,
  itemType,
  itemTypeLabel,
  description,
  confirmText = 'Excluir Definitivamente',
  isDeleting = false,
  loading = false,
  onConfirm,
  onClose,
}: SafeDeleteModalProps) {
  const effectiveType = itemTypeLabel || itemType || 'o registro';
  const effectiveDeleting = isDeleting || loading;
  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-lg border border-red-500/40 bg-[#141414] p-6 shadow-2xl text-brand-cream sm:p-7">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-md p-1.5 text-brand-cream/50 hover:bg-white/5 hover:text-brand-cream transition disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho de Alerta */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-950/50 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="pr-4">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-brand-cream">
              {title}
            </h3>
            <p className="mt-1 text-xs text-brand-cream/60">
              Confirmação de segurança para exclusão permanente
            </p>
          </div>
        </div>

        {/* Corpo com destaque no item */}
        <div className="mt-5 rounded-lg border border-white/5 bg-brand-black/60 p-4">
          <p className="text-xs text-brand-cream/70 leading-relaxed">
            Você tem certeza que deseja remover {effectiveType}:
          </p>
          <p className="mt-1.5 font-display text-sm font-bold text-brand-gold break-words">
            &ldquo;{itemName}&rdquo;
          </p>
          {description && (
            <p className="mt-2.5 pt-2.5 border-t border-white/5 text-[11px] text-red-300/80 leading-normal">
              {description}
            </p>
          )}
        </div>

        <p className="mt-3 text-[11px] text-brand-cream/40">
          Esta ação é irreversível e removerá permanentemente os dados do Supabase.
        </p>

        {/* Ações */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={effectiveDeleting}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-cream/70 hover:text-brand-cream hover:bg-white/5 rounded transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={effectiveDeleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider font-display rounded shadow-lg shadow-red-950/40 transition disabled:opacity-50"
          >
            {effectiveDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
