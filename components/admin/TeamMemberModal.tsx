'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Barber, AdminUserItem } from '@/types';
import { BrandButton } from '@/components/BrandButton';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

export type TeamMemberType = 'barber' | 'admin';

export interface TeamMemberSaveData {
  memberType: TeamMemberType;
  id?: string;
  // Campos comuns
  name: string;
  // Barbeiro
  phone?: string;
  roleTitle?: string;
  photoUrl?: string;
  bio?: string;
  active?: boolean;
  // Admin
  username?: string;
  password?: string;
  adminRole?: string;
}

interface TeamMemberModalProps {
  isOpen: boolean;
  initialType?: TeamMemberType;
  editingBarber?: Barber | null;
  editingAdmin?: AdminUserItem | null;
  onClose: () => void;
  onSave: (data: TeamMemberSaveData) => Promise<{ ok: boolean; error?: string }>;
}

export function TeamMemberModal({
  isOpen,
  initialType = 'barber',
  editingBarber,
  editingAdmin,
  onClose,
  onSave,
}: TeamMemberModalProps) {
  const isEditing = Boolean(editingBarber || editingAdmin);
  const [memberType, setMemberType] = useState<TeamMemberType>(initialType);

  // Campos Comuns
  const [name, setName] = useState('');

  // Campos Barbeiro
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('Barbeiro Especialista');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [active, setActive] = useState(true);

  // Campos Admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState('admin');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBarber) {
      setMemberType('barber');
      setName(editingBarber.name);
      setPhone(editingBarber.phone || '');
      setRoleTitle(editingBarber.role || 'Barbeiro Especialista');
      setPhotoUrl(editingBarber.photoUrl || '');
      setBio(editingBarber.bio || '');
      setActive(editingBarber.active ?? true);
      setUsername('');
      setPassword('');
    } else if (editingAdmin) {
      setMemberType('admin');
      setName(editingAdmin.name);
      setUsername(editingAdmin.username);
      setPassword('');
      setAdminRole(editingAdmin.role || 'admin');
      setPhone('');
      setRoleTitle('');
      setPhotoUrl('');
      setBio('');
    } else {
      setMemberType(initialType);
      setName('');
      setPhone('');
      setRoleTitle('Barbeiro Especialista');
      setPhotoUrl('/images/barber-1.webp');
      setBio('');
      setActive(true);
      setUsername('');
      setPassword('');
      setAdminRole('admin');
    }
    setError(null);
  }, [editingBarber, editingAdmin, initialType, isOpen]);

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

    if (!name.trim() || name.trim().length < 2) {
      setError('Informe o nome completo do membro.');
      return;
    }

    if (memberType === 'admin') {
      if (!username.trim() || username.trim().length < 3) {
        setError('O nome de usuário (login) deve ter pelo menos 3 caracteres.');
        return;
      }
      if (!isEditing && (!password || password.length < 6)) {
        setError('A senha inicial para novo administrador deve ter no mínimo 6 caracteres.');
        return;
      }
    }

    if (memberType === 'barber') {
      if (!roleTitle.trim()) {
        setError('Informe a especialidade ou cargo do profissional.');
        return;
      }
      if (!photoUrl.trim()) {
        setError('Envie a foto oficial do barbeiro.');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await onSave({
        memberType,
        id: editingBarber?.id || editingAdmin?.id,
        name: name.trim(),
        phone: phone.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        active,
        username: username.trim() || undefined,
        password: password || undefined,
        adminRole,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao salvar membro da equipe.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop 100% Sólido/Opaco */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !saving && onClose()}
      />

      {/* Container do Modal 4-Grid */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10 custom-scrollbar">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Gestão de Equipe & Acessos
            </p>
            <h2 className="font-display text-lg font-bold text-brand-cream uppercase tracking-wide">
              {isEditing
                ? `Editar ${memberType === 'barber' ? 'Barbeiro' : 'Administrador'}`
                : `Novo Membro da Equipe`}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Tipo (apenas na criação) */}
          {!isEditing && (
            <div className="flex items-center gap-3 p-1 bg-black/70 border border-white/15 rounded w-fit">
              <button
                type="button"
                onClick={() => setMemberType('barber')}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
                  memberType === 'barber'
                    ? 'bg-brand-gold text-brand-black font-bold'
                    : 'text-brand-cream/60 hover:text-brand-cream'
                }`}
              >
                Barbeiro (Agenda & Atendimento)
              </button>
              <button
                type="button"
                onClick={() => setMemberType('admin')}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
                  memberType === 'admin'
                    ? 'bg-brand-gold text-brand-black font-bold'
                    : 'text-brand-cream/60 hover:text-brand-cream'
                }`}
              >
                Administrador (Gestão & Painel)
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* CAMPOS ESPECÍFICOS PARA BARBEIRO (4 COLUNAS HORIZONTAIS) */}
          {/* ========================================================= */}
          {memberType === 'barber' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Nome (col-span-2) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Nome do Barbeiro *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Matheus Becker"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                {/* Cargo / Especialidade */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Especialidade / Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Ex: Mestre Barbeiro"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    WhatsApp Profissional
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(47) 99999-9999"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Linha 2: Biografia + Foto + Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Biografia & Experiência
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Breve resumo da trajetória, técnicas e estilo de corte para exibição no portal..."
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 bg-black/70 border border-white/15 rounded px-3 py-2.5 cursor-pointer hover:border-brand-gold/50 transition">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded border-white/20 bg-black text-brand-gold focus:ring-0 h-4 w-4"
                    />
                    <div>
                      <p className="text-xs text-brand-cream font-medium">Profissional Ativo na Barbearia</p>
                      <p className="text-[10px] text-brand-cream/50">
                        Se desmarcado, ele não aparecerá na agenda e na lista de escolha dos assinantes.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <ImageUploadField
                    label="Foto Oficial do Barbeiro (Supabase Storage)"
                    value={photoUrl}
                    onChange={(url) => setPhotoUrl(url)}
                    aspectRatio="square"
                    helpText="Envie um retrato profissional com boa iluminação para o perfil da barbearia."
                  />
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* CAMPOS ESPECÍFICOS PARA ADMINISTRADOR (4 COLUNAS)         */}
          {/* ========================================================= */}
          {memberType === 'admin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Nome Completo (col-span-2) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Nome Completo do Administrador *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Henrique Administrador"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                {/* Usuário Login */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Login de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="Ex: henrique"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                {/* Nível de Acesso */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Nível de Acesso
                  </label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                  >
                    <option value="admin">Administrador Geral</option>
                    <option value="superadmin">Diretor / Gestor</option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none transition"
                  />
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded flex flex-col justify-center">
                  <p className="text-[11px] text-brand-cream/70 leading-relaxed">
                    Administradores possuem acesso irrestrito ao painel, configurações de horários, produtos, cupons e clientes. A senha é criptografada com algoritmo scrypt seguro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
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
                <span>
                  {isEditing
                    ? 'Salvar Alterações'
                    : memberType === 'barber'
                    ? 'Cadastrar Barbeiro'
                    : 'Cadastrar Administrador'}
                </span>
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </div>
  );
}
