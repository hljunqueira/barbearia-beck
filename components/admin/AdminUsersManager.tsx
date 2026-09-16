'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  X,
} from 'lucide-react';
import type { AdminUserItem } from '@/types';
import {
  listAdminUsersAction,
  createAdminUserAction,
  updateAdminUserAction,
  deleteAdminUserAction,
} from '@/app/actions/authActions';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';

interface AdminUsersManagerProps {
  currentUsername?: string;
}

export function AdminUsersManager({ currentUsername = 'Henrique' }: AdminUsersManagerProps) {
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Novo / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserItem | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Exclusão Seguro
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await listAdminUsersAction();
      setAdmins(data);
    } catch (err) {
      console.error('Erro ao carregar administradores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 5000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleOpenNew = () => {
    setEditingAdmin(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('admin');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (adm: AdminUserItem) => {
    setEditingAdmin(adm);
    setName(adm.name);
    setUsername(adm.username);
    setPassword('');
    setRole(adm.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingAdmin) {
        const res = await updateAdminUserAction(editingAdmin.id, {
          name,
          role,
          password: password.trim() ? password.trim() : undefined,
        });

        if (res.ok) {
          setAdmins((prev) =>
            prev.map((a) =>
              a.id === editingAdmin.id ? { ...a, name, role } : a
            )
          );
          setIsModalOpen(false);
          showToast(`Administrador "${name}" atualizado com sucesso!`);
        } else {
          setFormError(res.error || 'Erro ao atualizar administrador.');
        }
      } else {
        const res = await createAdminUserAction({
          name,
          username,
          password,
          role,
        });

        if (res.ok && res.user) {
          setAdmins((prev) => [...prev, res.user]);
          setIsModalOpen(false);
          showToast(`Administrador "${res.user.name}" cadastrado com sucesso!`);
        } else {
          setFormError(res.error || 'Erro ao cadastrar administrador.');
        }
      }
    } catch (err) {
      setFormError('Falha ao comunicar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (adm: AdminUserItem) => {
    if (adm.username.toLowerCase() === currentUsername.toLowerCase()) {
      showToast('Por motivos de segurança, você não pode excluir sua própria conta conectada.', true);
      return;
    }
    if (admins.length <= 1) {
      showToast('O sistema deve possuir pelo menos um administrador cadastrado.', true);
      return;
    }

    setAdminToDelete(adm);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteAdminUserAction(adminToDelete.id, currentUsername);
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id));
        setIsDeleteModalOpen(false);
        showToast(`Administrador "${adminToDelete.name}" excluído com sucesso.`);
      } else {
        showToast(res.error || 'Erro ao excluir administrador.', true);
      }
    } catch (err) {
      showToast('Falha ao excluir administrador no banco de dados.', true);
    } finally {
      setIsDeleting(false);
      setAdminToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/80 p-3.5 text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {toastError && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/80 p-3.5 text-xs text-red-200 flex items-center gap-2 shadow-lg animate-in fade-in">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{toastError}</span>
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              <Shield size={18} />
            </span>
            <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
              Usuários Administradores
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-cream/60">
            Gerencie os logins administrativos com acesso ao painel de controle da barbearia. Senhas armazenadas com hash seguro via scrypt.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded shadow transition"
        >
          <Plus size={15} />
          <span>Novo Administrador</span>
        </button>
      </div>

      {/* Tabela de Administradores */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-brand-gold">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-brand-graphite/40 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-brand-black/60 font-display uppercase tracking-wider text-brand-gold text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Nome / Usuário</th>
                  <th className="px-6 py-3.5">Nível de Acesso</th>
                  <th className="px-6 py-3.5">Data de Criação</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((adm) => {
                  const isCurrent =
                    adm.username.toLowerCase() === currentUsername.toLowerCase();

                  return (
                    <tr key={adm.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-black font-display font-bold text-brand-gold text-xs shadow-inner">
                            {adm.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-brand-cream text-sm">
                                {adm.name}
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-brand-gold/20 border border-brand-gold/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-gold">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-brand-cream/50">
                              @{adm.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                          <UserCheck size={11} />
                          <span>{adm.role === 'admin' ? 'Administrador Pleno' : adm.role}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-brand-cream/60 font-mono text-[11px]">
                        {new Date(adm.createdAt).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(adm)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-white/10 bg-white/5 text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/50 transition"
                            title="Editar administrador"
                          >
                            <Edit2 size={12} />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(adm)}
                            disabled={isCurrent || admins.length <= 1}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/50 hover:border-red-500/50 transition disabled:opacity-30 disabled:pointer-events-none"
                            title={
                              isCurrent
                                ? 'Você não pode excluir sua própria conta ativa'
                                : admins.length <= 1
                                ? 'O sistema não pode ficar sem administradores'
                                : 'Excluir administrador'
                            }
                          >
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOVO / EDITAR ADMINISTRADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-brand-gold/40 bg-brand-graphite p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-brand-cream/40 hover:text-brand-cream transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Shield size={18} className="text-brand-gold" />
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
                {editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}
              </h3>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Henrique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                  Usuário de Login (@username) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingAdmin}
                  placeholder="Ex: henrique"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none disabled:opacity-50 font-mono"
                />
                {editingAdmin && (
                  <span className="text-[10px] text-brand-cream/40 mt-1 block">
                    O nome de usuário não pode ser alterado após a criação.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                  {editingAdmin ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  placeholder={editingAdmin ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                  Nível de Acesso (Cargo)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                >
                  <option value="admin">Administrador Geral</option>
                  <option value="gerente">Gerente de Unidade</option>
                  <option value="recepcao">Recepção</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-brand-cream/70 hover:text-brand-cream transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingAdmin ? 'Salvar Alterações' : 'Criar Administrador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO SEGURO */}
      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        title="Excluir Administrador"
        itemName={`${adminToDelete?.name || ''} (@${adminToDelete?.username || ''})`}
        itemType="administrador do sistema"
        description="Esta conta perderá imediatamente o acesso a todas as áreas restritas do painel da barbearia."
        confirmText="Confirmar Exclusão"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
