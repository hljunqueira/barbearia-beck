'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Search, Loader2, KeyRound } from 'lucide-react';
import type { Barber, AdminUserItem } from '@/types';
import {
  listBarbersAction,
  createBarberAction,
  updateBarberAction,
  deleteBarberAction,
} from '@/app/actions/barberActions';
import {
  listAdminUsersAction,
  createAdminUserAction,
  updateAdminUserAction,
  deleteAdminUserAction,
} from '@/app/actions/authActions';
import { TeamMemberModal, type TeamMemberSaveData, type TeamMemberType } from '@/components/admin/TeamMemberModal';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';
import { AdminPasswordModal } from '@/components/admin/AdminPasswordModal';

interface TeamManagerProps {
  currentUsername?: string;
}

export function TeamManager({ currentUsername = 'Henrique' }: TeamManagerProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [activeFilter, setActiveFilter] = useState<'all' | 'barbers' | 'admins'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Unificado
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserItem | null>(null);
  const [initialType, setInitialType] = useState<TeamMemberType>('barber');

  // Modal de Exclusão Seguro
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'barber' | 'admin';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [barbersData, adminsData] = await Promise.all([
        listBarbersAction(),
        listAdminUsersAction(),
      ]);
      setBarbers(barbersData);
      setAdmins(adminsData);
    } catch (err) {
      console.error('Erro ao carregar equipe e acessos:', err);
      showFeedback('Erro ao carregar lista da equipe.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Abrir Modal Novo
  const handleOpenNew = (type: TeamMemberType = 'barber') => {
    setEditingBarber(null);
    setEditingAdmin(null);
    setInitialType(type);
    setIsMemberModalOpen(true);
  };

  // Abrir Edição Barbeiro
  const handleOpenEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setEditingAdmin(null);
    setInitialType('barber');
    setIsMemberModalOpen(true);
  };

  // Abrir Edição Admin
  const handleOpenEditAdmin = (admin: AdminUserItem) => {
    setEditingAdmin(admin);
    setEditingBarber(null);
    setInitialType('admin');
    setIsMemberModalOpen(true);
  };

  // Salvar Membro (Barbeiro ou Admin)
  const handleSaveMember = async (data: TeamMemberSaveData) => {
    if (data.memberType === 'barber') {
      if (data.id) {
        const res = await updateBarberAction(data.id, {
          name: data.name,
          role: data.roleTitle || 'Barbeiro Especialista',
          phone: data.phone,
          photoUrl: data.photoUrl,
          bio: data.bio,
          active: data.active ?? true,
        });
        if (res.ok) {
          showFeedback('Barbeiro atualizado com sucesso!');
          loadData();
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } else {
        const res = await createBarberAction({
          name: data.name,
          role: data.roleTitle || 'Barbeiro Especialista',
          phone: data.phone,
          photoUrl: data.photoUrl?.trim() || undefined,
          bio: data.bio,
          active: data.active ?? true,
        });
        if (res.ok) {
          showFeedback('Barbeiro cadastrado com sucesso!');
          loadData();
          return { ok: true };
        }
        return { ok: false, error: res.error };
      }
    } else {
      // Admin
      if (data.id) {
        const res = await updateAdminUserAction(data.id, {
          name: data.name,
          password: data.password || undefined,
          role: data.adminRole || 'admin',
        });
        if (res.ok) {
          showFeedback('Administrador atualizado com sucesso!');
          loadData();
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } else {
        const res = await createAdminUserAction({
          name: data.name,
          username: data.username || '',
          password: data.password || '',
          role: data.adminRole || 'admin',
        });
        if (res.ok) {
          showFeedback('Administrador criado com sucesso!');
          loadData();
          return { ok: true };
        }
        return { ok: false, error: res.error };
      }
    }
  };

  // Modal de Alteração de Senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalAdmin, setPasswordModalAdmin] = useState<AdminUserItem | null>(null);

  const handleOpenPasswordModal = (admin: AdminUserItem) => {
    setPasswordModalAdmin(admin);
    setIsPasswordModalOpen(true);
  };

  // Exclusão Segura
  const handleRequestDelete = (
    id: string,
    name: string,
    type: 'barber' | 'admin',
    username?: string
  ) => {
    if (
      type === 'admin' &&
      ((username && username.toLowerCase() === currentUsername.toLowerCase()) ||
        name.toLowerCase() === currentUsername.toLowerCase())
    ) {
      showFeedback('Você não pode excluir o usuário que está atualmente logado.', true);
      return;
    }
    setItemToDelete({ id, name, type });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'barber') {
        const res = await deleteBarberAction(itemToDelete.id);
        if (res.ok) {
          showFeedback('Barbeiro removido com sucesso.');
          loadData();
        } else {
          showFeedback(res.error || 'Erro ao remover barbeiro.', true);
        }
      } else {
        const res = await deleteAdminUserAction(itemToDelete.id, currentUsername);
        if (res.ok) {
          showFeedback('Administrador removido com sucesso.');
          loadData();
        } else {
          showFeedback(res.error || 'Erro ao remover administrador.', true);
        }
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao processar exclusão.', true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtragem
  const filteredBarbers = barbers.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdmins = admins.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
            Equipe & Acessos
          </h2>
          <p className="text-xs text-brand-cream/50">
            Gerencie barbeiros que atendem na agenda e administradores com acesso ao painel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNew('barber')}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
          >
            <Plus size={14} />
            <span>Novo Barbeiro</span>
          </button>
          <button
            onClick={() => handleOpenNew('admin')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-brand-cream text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-white/20 transition border border-white/15"
          >
            <Plus size={14} />
            <span>Novo Admin</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded w-fit">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeFilter === 'all'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Todos ({barbers.length + admins.length})
          </button>
          <button
            onClick={() => setActiveFilter('barbers')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeFilter === 'barbers'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Barbeiros ({barbers.length})
          </button>
          <button
            onClick={() => setActiveFilter('admins')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
              activeFilter === 'admins'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            Administradores ({admins.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-brand-cream/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou login..."
            className="w-full bg-black/50 border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:border-brand-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="p-12 text-center text-brand-cream/40 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-brand-gold" />
          <span className="text-xs font-mono">Carregando equipe...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SEÇÃO: BARBEIROS */}
          {(activeFilter === 'all' || activeFilter === 'barbers') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Barbeiros Profissionais ({filteredBarbers.length})
                </h3>
                <span className="text-[11px] font-mono text-brand-cream/40">
                  Disponíveis para agendamento pelos clientes
                </span>
              </div>

              {filteredBarbers.length === 0 ? (
                <div className="p-6 rounded bg-black/40 border border-white/5 text-center text-xs text-brand-cream/50">
                  Nenhum barbeiro encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBarbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="p-4 rounded border border-white/10 bg-[#141414] hover:border-brand-gold/40 transition flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded overflow-hidden bg-black/60 border border-brand-gold/30 shrink-0 flex items-center justify-center">
                          {barber.photoUrl && barber.photoUrl !== '/images/barber-1.webp' ? (
                            <Image
                              src={barber.photoUrl}
                              alt={barber.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-display text-base font-bold text-brand-gold">
                              {barber.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-display text-sm font-bold text-brand-cream truncate">
                              {barber.name}
                            </h4>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                barber.active
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {barber.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

                          <p className="text-xs text-brand-gold font-mono truncate">{barber.role}</p>
                          {barber.phone && (
                            <p className="text-[11px] text-brand-cream/50 font-mono mt-0.5 truncate">
                              {barber.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {barber.bio && (
                        <p className="text-[11px] text-brand-cream/60 mt-3 line-clamp-2 leading-relaxed">
                          {barber.bio}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditBarber(barber)}
                          className="px-2.5 py-1 rounded border border-white/10 hover:border-brand-gold/50 text-brand-cream/80 hover:text-brand-gold text-[11px] font-mono uppercase flex items-center gap-1 transition"
                        >
                          <Edit2 size={12} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleRequestDelete(barber.id, barber.name, 'barber')}
                          className="px-2.5 py-1 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 text-[11px] font-mono uppercase flex items-center gap-1 transition"
                        >
                          <Trash2 size={12} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO: ADMINISTRADORES */}
          {(activeFilter === 'all' || activeFilter === 'admins') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Administradores do Sistema ({filteredAdmins.length})
                </h3>
                <span className="text-[11px] font-mono text-brand-cream/40">
                  Acesso completo à gestão, produtos, finanças e agenda
                </span>
              </div>

              {filteredAdmins.length === 0 ? (
                <div className="p-6 rounded bg-black/40 border border-white/5 text-center text-xs text-brand-cream/50">
                  Nenhum administrador encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAdmins.map((admin) => {
                    const isSelf = admin.username.toLowerCase() === currentUsername.toLowerCase();
                    return (
                      <div
                        key={admin.id}
                        className="p-4 rounded border border-white/10 bg-[#141414] hover:border-brand-gold/40 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-mono text-brand-cream/50 uppercase tracking-wider">
                              Login: <strong className="text-brand-gold">{admin.username}</strong>
                            </span>
                            {isSelf && (
                              <span className="text-[9px] font-mono bg-brand-gold/20 text-brand-gold border border-brand-gold/40 px-1.5 py-0.5 rounded uppercase font-bold">
                                Você
                              </span>
                            )}
                          </div>

                          <h4 className="font-display text-sm font-bold text-brand-cream">
                            {admin.name}
                          </h4>

                          <p className="text-xs text-brand-cream/60 font-mono mt-1">
                            Perfil: {admin.role === 'superadmin' ? 'Diretor / Gestor' : 'Administrador Geral'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(admin)}
                            className="px-2.5 py-1 rounded border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold text-[11px] font-mono uppercase flex items-center gap-1 transition"
                            title="Alterar Senha do Administrador"
                          >
                            <KeyRound size={12} />
                            <span>Alterar Senha</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="px-2.5 py-1 rounded border border-white/10 hover:border-brand-gold/50 text-brand-cream/80 hover:text-brand-gold text-[11px] font-mono uppercase flex items-center gap-1 transition"
                          >
                            <Edit2 size={12} />
                            <span>Editar</span>
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(admin.id, admin.name, 'admin', admin.username)}
                              className="px-2.5 py-1 rounded border border-red-500/20 text-red-400 hover:bg-red-950/40 text-[11px] font-mono uppercase flex items-center gap-1 transition"
                            >
                              <Trash2 size={12} />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Unificado de Membro (4-Grid Sólido) */}
      <TeamMemberModal
        isOpen={isMemberModalOpen}
        initialType={initialType}
        editingBarber={editingBarber}
        editingAdmin={editingAdmin}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
      />

      {/* Modal Dedicado de Alteração de Senha */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        adminUser={passwordModalAdmin}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordModalAdmin(null);
        }}
        onSuccess={() => {
          showFeedback('Senha do administrador atualizada com sucesso!');
          loadData();
        }}
      />

      {/* Modal Seguro de Exclusão */}
      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        itemName={itemToDelete?.name || ''}
        itemTypeLabel={itemToDelete?.type === 'barber' ? 'o barbeiro' : 'o administrador'}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
