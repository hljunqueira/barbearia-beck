'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Scissors,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import type { Barber } from '@/types';
import {
  listBarbersAction,
  createBarberAction,
  updateBarberAction,
  deleteBarberAction,
} from '@/app/actions/barberActions';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { SafeDeleteModal } from '@/components/admin/SafeDeleteModal';

export function BarbersManager() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal Novo / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Barbeiro Profissional');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Exclusão Seguro
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Mensagem
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBarbers = async () => {
    setLoading(true);
    try {
      const data = await listBarbersAction();
      setBarbers(data);
    } catch (err) {
      console.error('Erro ao carregar barbeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenNew = () => {
    setEditingBarber(null);
    setName('');
    setRole('Barbeiro Profissional');
    setPhone('');
    setPhotoUrl('');
    setBio('');
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setName(barber.name);
    setRole(barber.role);
    setPhone(barber.phone || '');
    setPhotoUrl(barber.photoUrl || '');
    setBio(barber.bio || '');
    setActive(barber.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Informe o nome do barbeiro.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingBarber) {
        const res = await updateBarberAction(editingBarber.id, {
          name,
          role,
          phone,
          photoUrl: photoUrl || null,
          bio: bio || null,
          active,
        });

        if (res.ok && res.barber) {
          setBarbers((prev) =>
            prev.map((b) => (b.id === editingBarber.id ? res.barber! : b))
          );
          setIsModalOpen(false);
          showToast(`Barbeiro "${res.barber.name}" atualizado com sucesso!`);
        } else {
          setFormError(res.error || 'Erro ao atualizar barbeiro.');
        }
      } else {
        const res = await createBarberAction({
          name,
          role,
          phone,
          photoUrl: photoUrl || undefined,
          bio: bio || undefined,
          active,
        });

        if (res.ok && res.barber) {
          setBarbers((prev) => [res.barber!, ...prev]);
          setIsModalOpen(false);
          showToast(`Barbeiro "${res.barber.name}" cadastrado com sucesso!`);
        } else {
          setFormError(res.error || 'Erro ao cadastrar barbeiro.');
        }
      }
    } catch (err) {
      setFormError('Falha ao comunicar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (barber: Barber) => {
    setBarberToDelete(barber);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!barberToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteBarberAction(barberToDelete.id);
      if (res.ok) {
        setBarbers((prev) => prev.filter((b) => b.id !== barberToDelete.id));
        setIsDeleteModalOpen(false);
        showToast(`Barbeiro "${barberToDelete.name}" excluído com sucesso.`);
      } else {
        alert(res.error || 'Erro ao excluir barbeiro.');
      }
    } catch (err) {
      alert('Falha ao excluir barbeiro no banco de dados.');
    } finally {
      setIsDeleting(false);
      setBarberToDelete(null);
    }
  };

  const filteredBarbers = barbers.filter((b) => {
    const matchesQuery =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.phone && b.phone.includes(searchQuery));

    if (statusFilter === 'active') return matchesQuery && b.active;
    if (statusFilter === 'inactive') return matchesQuery && !b.active;
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/80 p-3.5 text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              <Scissors size={18} />
            </span>
            <h2 className="font-display text-lg font-bold uppercase text-brand-cream tracking-wide">
              Equipe de Barbeiros
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-cream/60">
            Cadastre e gerencie os profissionais de atendimento da barbearia. (Henrique, administrador do sistema, é gerenciado na aba de Administradores).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded shadow transition"
        >
          <Plus size={15} />
          <span>Novo Barbeiro</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-graphite/30 p-3 rounded-lg border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-3 text-brand-cream/40" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-brand-black/70 border border-white/10 rounded text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              statusFilter === 'all'
                ? 'bg-brand-gold text-brand-black font-bold'
                : 'text-brand-cream/70 hover:bg-white/5'
            }`}
          >
            Todos ({barbers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-brand-black font-bold'
                : 'text-brand-cream/70 hover:bg-white/5'
            }`}
          >
            Ativos ({barbers.filter((b) => b.active).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              statusFilter === 'inactive'
                ? 'bg-red-500 text-white font-bold'
                : 'text-brand-cream/70 hover:bg-white/5'
            }`}
          >
            Inativos ({barbers.filter((b) => !b.active).length})
          </button>
        </div>
      </div>

      {/* Grid de Barbeiros */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-brand-gold">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredBarbers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center bg-brand-graphite/20">
          <Scissors className="mx-auto h-10 w-10 text-brand-cream/20" />
          <p className="mt-3 font-display text-sm font-bold uppercase text-brand-cream/70">
            Nenhum barbeiro encontrado
          </p>
          <p className="mt-1 text-xs text-brand-cream/40 max-w-sm mx-auto">
            {searchQuery
              ? 'Nenhum profissional corresponde aos filtros de busca informados.'
              : 'Nenhum profissional cadastrado na equipe ainda. Clique no botão acima para adicionar o primeiro barbeiro.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase font-display rounded hover:bg-brand-gold-light transition"
            >
              <Plus size={14} />
              <span>Cadastrar Primeiro Barbeiro</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBarbers.map((barber) => (
            <div
              key={barber.id}
              className="group relative rounded-xl border border-white/10 bg-brand-graphite/50 p-5 shadow-card hover:border-brand-gold/40 transition flex flex-col justify-between"
            >
              <div>
                {/* Topo do Card com Foto / Avatar */}
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-full border border-brand-gold/30 bg-black overflow-hidden shadow-inner flex items-center justify-center">
                    {barber.photoUrl && barber.photoUrl !== '/images/barber-1.webp' ? (
                      <Image
                        src={barber.photoUrl}
                        alt={barber.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-brand-gold bg-brand-black">
                        {barber.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-brand-cream truncate">
                        {barber.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          barber.active
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-950/60 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {barber.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-brand-gold font-medium truncate">
                      {barber.role}
                    </p>

                    {barber.phone && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-brand-cream/60">
                        <Phone size={11} className="text-brand-gold/70" />
                        <span>{barber.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio / Especialidades */}
                {barber.bio && (
                  <p className="mt-4 pt-3 border-t border-white/5 text-xs text-brand-cream/70 leading-relaxed line-clamp-3">
                    {barber.bio}
                  </p>
                )}
              </div>

              {/* Ações do Card */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(barber)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-white/10 bg-white/5 text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/50 transition"
                  title="Editar dados"
                >
                  <Edit2 size={13} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDelete(barber)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/50 hover:border-red-500/50 transition"
                  title="Excluir barbeiro"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO / EDITAR BARBEIRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-brand-gold/40 bg-brand-graphite p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-brand-cream/40 hover:text-brand-cream transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Scissors size={18} className="text-brand-gold" />
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
                {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro da Equipe'}
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
                  Nome do Barbeiro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                    Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Barbeiro Especialista em Barba"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(48) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload de Imagem */}
                <ImageUploadField
                  label="Foto do Barbeiro"
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  helpText="Envie foto em alta qualidade (.webp, .png, .jpg). Recomendado formato quadrado ou retrato."
                />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                  Bio / Apresentação (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre as técnicas, experiência e estilo do profissional..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-brand-black px-3.5 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Status Ativo */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeBarber"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-brand-black text-brand-gold focus:ring-brand-gold"
                />
                <label htmlFor="activeBarber" className="text-xs text-brand-cream select-none cursor-pointer">
                  Profissional ativo (disponível para agendamentos e exibição)
                </label>
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
                  <span>{editingBarber ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO SEGURO */}
      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        title="Excluir Barbeiro"
        itemName={barberToDelete?.name || ''}
        itemType="barbeiro da equipe"
        description="A exclusão removerá o profissional do sistema. Agendamentos passados continuarão preservados para histórico."
        confirmText="Confirmar Exclusão"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
