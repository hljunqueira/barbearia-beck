'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { AdminUserItem } from '@/types';
import { updateAdminUserAction } from '@/app/actions/authActions';
import { BrandButton } from '@/components/BrandButton';

interface AdminPasswordModalProps {
  isOpen: boolean;
  adminUser: AdminUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPasswordModal({
  isOpen,
  adminUser,
  onClose,
  onSuccess,
}: AdminPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !adminUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pass = newPassword.trim();
    if (!pass || pass.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (pass !== confirmPassword.trim()) {
      setError('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateAdminUserAction(adminUser.id, {
        password: pass,
      });

      if (res.ok) {
        setLoading(false);
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Falha ao atualizar a senha.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao salvar nova senha.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop 100% Sólido e Opaco */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Card do Modal */}
      <div className="relative w-full max-w-md bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
                Segurança & Credenciais
              </p>
              <h2 className="font-display text-base font-bold text-brand-cream uppercase tracking-wide">
                Alterar Senha de Acesso
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Identificação do Usuário */}
        <div className="mb-4 p-3 bg-black/50 border border-white/10 rounded flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-brand-cream/50 block">Administrador:</span>
            <strong className="text-xs text-brand-cream font-display">{adminUser.name}</strong>
          </div>
          <span className="text-[11px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded">
            @{adminUser.username}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
              Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono pr-10 focus:border-brand-gold focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cream/40 hover:text-brand-cream transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
              Confirmar Nova Senha *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
            />
          </div>

          <p className="text-[11px] text-brand-cream/50 leading-relaxed pt-1">
            A nova senha entrará em vigor imediatamente. As credenciais são criptografadas com o algoritmo seguro scrypt.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/60 hover:text-brand-cream hover:bg-white/5 rounded border border-white/10 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <BrandButton type="submit" disabled={loading} className="px-4 py-2 text-xs">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Atualizando...</span>
                </span>
              ) : (
                <span>Atualizar Senha</span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
