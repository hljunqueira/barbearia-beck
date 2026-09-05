'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Filter,
  MessageCircle,
  MoreVertical,
  Plus,
  Scissors,
  Search,
  Trash2,
  User,
  X,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Crown,
  Phone,
  DollarSign
} from 'lucide-react';
import type { Appointment, AppointmentStatus, Subscription } from '@/types';
import {
  createAdminAppointment,
  deleteAppointment,
  updateAppointmentDetails,
  updateAppointmentStatus,
} from '@/app/actions/subscriptionActions';
import { BARBERS } from '@/lib/data/subscriptions';
import { formatBRL } from '@/lib/format';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface BarberAgendaProps {
  initialAppointments: Appointment[];
  subscriptions: Subscription[];
  onAppointmentsChange?: (updated: Appointment[]) => void;
}

const SERVICES_CATALOG = [
  { slug: 'corte', name: 'Corte Tradicional / Degradê', priceInCents: 3500, duration: 35 },
  { slug: 'barba', name: 'Barba Terapia com Toalha Quente', priceInCents: 3000, duration: 30 },
  { slug: 'corte-barba', name: 'Combo Corte + Barba', priceInCents: 6000, duration: 60 },
  { slug: 'sobrancelha', name: 'Design de Sobrancelha', priceInCents: 1500, duration: 15 },
  { slug: 'luzes', name: 'Luzes / Reflexo Alinhado', priceInCents: 8000, duration: 60 },
  { slug: 'platinado', name: 'Platinado Global (Nevou)', priceInCents: 13000, duration: 90 },
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30',
];

const WEEK_DAYS = [
  { date: '2026-09-07', label: 'Seg', fullLabel: 'Segunda-feira', dayNum: '07' },
  { date: '2026-09-08', label: 'Ter', fullLabel: 'Terça-feira', dayNum: '08' },
  { date: '2026-09-09', label: 'Qua', fullLabel: 'Quarta-feira', dayNum: '09' },
  { date: '2026-09-10', label: 'Qui', fullLabel: 'Quinta-feira', dayNum: '10' },
  { date: '2026-09-11', label: 'Sex', fullLabel: 'Sexta-feira', dayNum: '11' },
  { date: '2026-09-12', label: 'Sáb', fullLabel: 'Sábado', dayNum: '12' },
];

export const BarberAgenda = ({
  initialAppointments,
  subscriptions,
  onAppointmentsChange,
}: BarberAgendaProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'list'>('grid');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-07');
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AppointmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [clientType, setClientType] = useState<'subscriber' | 'guest'>('subscriber');
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState(SERVICES_CATALOG[0].name);
  const [barberName, setBarberName] = useState<string>(BARBERS[0].name);
  const [appointmentDate, setAppointmentDate] = useState('2026-09-07');
  const [timeSlot, setTimeSlot] = useState('15:00');
  const [priceInCents, setPriceInCents] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(35);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateList = (newList: Appointment[]) => {
    setAppointments(newList);
    if (onAppointmentsChange) onAppointmentsChange(newList);
  };

  // Filtragem
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchBarber = selectedBarber === 'all' || apt.barberName === selectedBarber;
      const matchStatus = selectedStatus === 'all' || apt.status === selectedStatus;
      const matchSearch =
        apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.customerPhone.includes(searchQuery) ||
        apt.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBarber && matchStatus && matchSearch;
    });
  }, [appointments, selectedBarber, selectedStatus, searchQuery]);

  // Resumo de métricas da agenda
  const agendaMetrics = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const inProgress = appointments.filter((a) => a.status === 'in_progress').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const projectedRevenue = appointments
      .filter((a) => a.status !== 'canceled')
      .reduce((acc, curr) => acc + (curr.priceInCents || 0), 0);

    return { total, confirmed, inProgress, completed, projectedRevenue };
  }, [appointments]);

  // Abrir modal de criação
  const openCreateModal = (defaultDate?: string, defaultTime?: string) => {
    setIsEditing(false);
    setEditingId(null);
    setClientType('subscriber');
    if (subscriptions.length > 0) {
      setSelectedSubscriberId(subscriptions[0].id);
      setCustomerName(subscriptions[0].customerName);
      setCustomerPhone(subscriptions[0].customerPhone);
      setPriceInCents(0); // Plano incluso
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setPriceInCents(SERVICES_CATALOG[0].priceInCents);
    }
    setServiceType(SERVICES_CATALOG[0].name);
    setBarberName(BARBERS[0].name);
    setAppointmentDate(defaultDate || selectedDate || '2026-09-07');
    setTimeSlot(defaultTime || '14:00');
    setDurationMinutes(SERVICES_CATALOG[0].duration);
    setNotes('');
    setStatus('confirmed');
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const openEditModal = (apt: Appointment) => {
    setIsEditing(true);
    setEditingId(apt.id);
    if (apt.subscriptionId) {
      setClientType('subscriber');
      setSelectedSubscriberId(apt.subscriptionId);
    } else {
      setClientType('guest');
    }
    setCustomerName(apt.customerName);
    setCustomerPhone(apt.customerPhone);
    setServiceType(apt.serviceType);
    setBarberName(apt.barberName || BARBERS[0].name);
    setAppointmentDate(apt.date);
    setTimeSlot(apt.timeSlot);
    setPriceInCents(apt.priceInCents ?? 0);
    setDurationMinutes(apt.durationMinutes ?? 35);
    setNotes(apt.notes || '');
    setStatus(apt.status);
    setIsModalOpen(true);
  };

  // Salvar agendamento (Criar ou Editar)
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast('Preencha o nome e telefone do cliente.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        const res = await updateAppointmentDetails(editingId, {
          customerName,
          customerPhone,
          serviceType,
          barberName,
          date: appointmentDate,
          timeSlot,
          priceInCents,
          durationMinutes,
          notes,
          status,
          subscriptionId: clientType === 'subscriber' ? selectedSubscriberId : null,
          planName: clientType === 'subscriber' ? 'Plano Clube' : 'Avulso',
        });
        if (res.ok && res.appointment) {
          updateList(appointments.map((a) => (a.id === editingId ? res.appointment! : a)));
          showToast('Agendamento atualizado com sucesso!');
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Erro ao atualizar.');
        }
      } else {
        const res = await createAdminAppointment({
          customerName,
          customerPhone,
          serviceType,
          barberName,
          date: appointmentDate,
          timeSlot,
          priceInCents,
          durationMinutes,
          notes,
          status,
          subscriptionId: clientType === 'subscriber' ? selectedSubscriberId : null,
          planName: clientType === 'subscriber' ? 'Plano Clube' : 'Avulso',
        });
        if (res.ok && res.appointment) {
          updateList([res.appointment, ...appointments]);
          showToast('Novo agendamento confirmado na grade!');
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Erro ao criar agendamento.');
        }
      }
    } catch {
      showToast('Falha na comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Alteração de status com 1 clique
  const handleQuickStatus = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(id, newStatus);
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    updateList(updated);
    const labels: Record<AppointmentStatus, string> = {
      confirmed: 'Agendamento confirmado!',
      in_progress: 'Cliente em atendimento na cadeira!',
      completed: 'Atendimento concluído com sucesso!',
      canceled: 'Agendamento cancelado.',
      pending: 'Marcado como pendente.',
    };
    showToast(labels[newStatus]);
  };

  // Excluir permanentemente
  const handleDeleteAppointment = async (id: string) => {
    const res = await deleteAppointment(id);
    if (res.ok) {
      updateList(appointments.filter((a) => a.id !== id));
      setDeleteConfirmId(null);
      showToast('Agendamento removido da grade.');
    } else {
      showToast('Erro ao remover agendamento.');
    }
  };

  // Gerar link do WhatsApp para confirmação do cliente
  const getWhatsAppConfirmationUrl = (apt: Appointment) => {
    const cleanPhone = apt.customerPhone.replace(/\D/g, '');
    const dateFormatted = apt.date.split('-').reverse().join('/');
    const text = `Olá ${apt.customerName}! 💈\nConfirmamos seu horário na *Beck Barbearia*:\n\n📅 Data: *${dateFormatted}*\n⏰ Horário: *${apt.timeSlot}*\n✂️ Serviço: *${apt.serviceType}*\n👤 Barbeiro: *${apt.barberName || 'Henrique Becker'}*\n\nTe esperamos na Rua dos Ilhéus, 48 - Centro de Florianópolis. Até logo!`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Renderizador de badge de status
  const renderStatusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <Check size={11} /> Confirmado
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 animate-pulse">
            <Play size={9} className="fill-amber-300" /> Na Cadeira
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-cream/70">
            <CheckCircle2 size={11} className="text-brand-cream/60" /> Concluído
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
            <X size={11} /> Cancelado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
            <Clock size={11} /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded border border-brand-gold/40 bg-[#151515] px-4 py-3 text-xs font-medium text-brand-gold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={14} className="text-brand-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Indicadores do dia / período */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded border border-white/10 bg-brand-graphite/60 p-3.5 backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-cream/60">Total Marcados</p>
          <p className="font-display text-2xl font-bold text-brand-cream mt-1">{agendaMetrics.total}</p>
          <span className="text-[10px] text-brand-cream/40">Grade geral semanal</span>
        </div>

        <div className="rounded border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5 backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">Confirmados</p>
          <p className="font-display text-2xl font-bold text-emerald-400 mt-1">{agendaMetrics.confirmed}</p>
          <span className="text-[10px] text-emerald-400/60">Horários validados</span>
        </div>

        <div className="rounded border border-amber-500/20 bg-amber-500/[0.04] p-3.5 backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-300">Em Atendimento</p>
          <p className="font-display text-2xl font-bold text-amber-300 mt-1">{agendaMetrics.inProgress}</p>
          <span className="text-[10px] text-amber-300/60">Clientes na cadeira</span>
        </div>

        <div className="rounded border border-white/10 bg-brand-graphite/60 p-3.5 backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-cream/60">Concluídos</p>
          <p className="font-display text-2xl font-bold text-brand-cream/80 mt-1">{agendaMetrics.completed}</p>
          <span className="text-[10px] text-brand-cream/40">Finalizados no dia</span>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded border border-brand-gold/30 bg-brand-gold/[0.06] p-3.5 backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-gold">Previsão Extra</p>
          <p className="font-display text-xl font-bold text-brand-gold mt-1">
            {formatBRL(agendaMetrics.projectedRevenue)}
          </p>
          <span className="text-[10px] text-brand-gold/70">Serviços avulsos</span>
        </div>
      </div>

      {/* Barra de Ações, Filtros e Modos de Visão */}
      <div className="flex flex-col gap-4 rounded border border-white/10 bg-brand-graphite/40 p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Modos de visualização */}
        <div className="flex items-center gap-1.5 rounded bg-black/40 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              viewMode === 'grid'
                ? 'bg-brand-gold text-brand-black shadow'
                : 'text-brand-cream/70 hover:text-brand-cream'
            }`}
          >
            <CalendarDays size={14} />
            <span className="hidden sm:inline">Grade Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              viewMode === 'timeline'
                ? 'bg-brand-gold text-brand-black shadow'
                : 'text-brand-cream/70 hover:text-brand-cream'
            }`}
          >
            <Clock size={14} />
            <span className="hidden sm:inline">Timeline Diária</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              viewMode === 'list'
                ? 'bg-brand-gold text-brand-black shadow'
                : 'text-brand-cream/70 hover:text-brand-cream'
            }`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Lista Geral</span>
          </button>
        </div>

        {/* Filtros: Barbeiro, Status e Busca */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Barbeiro */}
          <select
            aria-label="Filtrar por profissional da barbearia"
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="rounded border border-white/10 bg-brand-black px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
          >
            <option value="all">Todos os Barbeiros</option>
            {BARBERS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name} ({b.role})
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            aria-label="Filtrar por status do agendamento"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="rounded border border-white/10 bg-brand-black px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmados</option>
            <option value="in_progress">Na Cadeira</option>
            <option value="completed">Concluídos</option>
            <option value="canceled">Cancelados</option>
          </select>

          {/* Busca rápida */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-cream/40" />
            <input
              type="text"
              placeholder="Buscar cliente ou tel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-48 rounded border border-white/10 bg-brand-black py-2 pl-8 pr-3 text-xs text-brand-cream placeholder-brand-cream/40 focus:border-brand-gold focus:outline-none"
            />
          </div>

          {/* Botão Novo Agendamento */}
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-1.5 rounded bg-brand-gold px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-brand-black hover:bg-brand-gold/90 transition shadow-gold"
          >
            <Plus size={14} />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VISÃO GRADE SEMANAL (Horários por Dia da Semana)       */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {WEEK_DAYS.map((day) => {
              const dayApts = filteredAppointments.filter((a) => a.date === day.date);
              const isClubExclusive = ['2026-09-07', '2026-09-08', '2026-09-09'].includes(day.date);

              return (
                <div
                  key={day.date}
                  className={`flex flex-col rounded border transition-colors ${
                    selectedDate === day.date
                      ? 'border-brand-gold/60 bg-[#161616]'
                      : 'border-white/10 bg-[#121212]'
                  }`}
                >
                  {/* Cabeçalho da Coluna do Dia */}
                  <div
                    onClick={() => setSelectedDate(day.date)}
                    className="cursor-pointer border-b border-white/10 p-3 bg-white/[0.02] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-bold text-brand-gold uppercase">
                          {day.label}
                        </span>
                        <span className="text-xs text-brand-cream/80 font-mono">
                          {day.dayNum}/09
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-cream/40">{day.fullLabel}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-brand-cream/70">
                        {dayApts.length} {dayApts.length === 1 ? 'cliente' : 'clientes'}
                      </span>
                      {isClubExclusive && (
                        <span className="text-[9px] text-brand-gold font-mono flex items-center gap-0.5 mt-0.5">
                          <Crown size={9} /> Clube
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de Atendimentos no Dia */}
                  <div className="flex-1 p-2 space-y-2 min-h-[300px]">
                    {dayApts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 text-center px-2">
                        <p className="text-[11px] text-brand-cream/30">Sem horários</p>
                        <button
                          type="button"
                          onClick={() => openCreateModal(day.date)}
                          className="mt-2 text-[10px] text-brand-gold/70 hover:text-brand-gold flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Encaixe</span>
                        </button>
                      </div>
                    ) : (
                      dayApts.map((apt) => (
                        <div
                          key={apt.id}
                          className={`rounded border p-2.5 transition relative group ${
                            apt.status === 'in_progress'
                              ? 'border-amber-500/50 bg-amber-500/[0.08]'
                              : apt.status === 'completed'
                              ? 'border-white/5 bg-white/[0.02] opacity-70'
                              : apt.status === 'canceled'
                              ? 'border-rose-500/30 bg-rose-500/[0.04] opacity-50'
                              : 'border-white/10 bg-brand-graphite/80 hover:border-brand-gold/40'
                          }`}
                        >
                          {/* Top: Horário e Status */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-display text-xs font-bold text-brand-gold">
                              {apt.timeSlot}
                            </span>
                            {renderStatusBadge(apt.status)}
                          </div>

                          {/* Cliente e Tipo */}
                          <div className="mb-1">
                            <p className="text-xs font-semibold text-brand-cream truncate flex items-center gap-1">
                              {apt.subscriptionId ? (
                                <Crown size={12} className="text-brand-gold shrink-0" />
                              ) : (
                                <User size={12} className="text-brand-cream/40 shrink-0" />
                              )}
                              <span>{apt.customerName}</span>
                            </p>
                            <p className="text-[10px] text-brand-cream/60 truncate">
                              {apt.serviceType}
                            </p>
                          </div>

                          {/* Barbeiro & Valor */}
                          <div className="flex items-center justify-between text-[10px] text-brand-cream/40 pt-1 border-t border-white/5">
                            <span className="truncate">{apt.barberName || 'Becker'}</span>
                            <span className="text-brand-cream/60 font-mono">
                              {apt.priceInCents === 0 ? 'Clube' : formatBRL(apt.priceInCents || 0)}
                            </span>
                          </div>

                          {/* Ações rápidas no Hover / Card */}
                          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                            <a
                              href={getWhatsAppConfirmationUrl(apt)}
                              target="_blank"
                              rel="noreferrer"
                              title="Avisar no WhatsApp"
                              className="text-emerald-400 hover:text-emerald-300 p-1"
                            >
                              <WhatsAppIcon size={13} className="text-[#25D366]" />
                            </a>

                            <div className="flex items-center gap-1">
                              {apt.status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(apt.id, 'in_progress')}
                                  title="Iniciar atendimento (na cadeira)"
                                  className="rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono"
                                >
                                  Iniciar
                                </button>
                              )}
                              {apt.status === 'in_progress' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(apt.id, 'completed')}
                                  title="Concluir serviço"
                                  className="rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono"
                                >
                                  Concluir
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditModal(apt)}
                                title="Editar agendamento"
                                className="text-brand-cream/50 hover:text-brand-gold p-1"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(apt.id)}
                                title="Remover agendamento"
                                className="text-brand-cream/40 hover:text-rose-400 p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Botão de Rodapé para Encaixe */}
                  <div className="border-t border-white/5 p-2 bg-white/[0.01]">
                    <button
                      type="button"
                      onClick={() => openCreateModal(day.date)}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded border border-dashed border-white/10 hover:border-brand-gold/40 text-[10px] text-brand-cream/50 hover:text-brand-gold transition"
                    >
                      <Plus size={11} />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VISÃO TIMELINE DIÁRIA (Linha do Tempo por Horário)    */}
      {/* ========================================================= */}
      {viewMode === 'timeline' && (
        <div className="rounded border border-white/10 bg-[#121212] p-5 space-y-5">
          {/* Seletor de data da timeline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-brand-gold uppercase">
                Linha do Tempo
              </span>
              <span className="text-xs text-brand-cream/50 font-mono">
                {WEEK_DAYS.find((d) => d.date === selectedDate)?.fullLabel || selectedDate}
              </span>
            </div>

            {/* Pílulas de seleção de dia */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
              {WEEK_DAYS.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`px-3 py-1 text-xs rounded transition whitespace-nowrap ${
                    selectedDate === d.date
                      ? 'bg-brand-gold text-brand-black font-bold'
                      : 'border border-white/10 bg-brand-black text-brand-cream/70 hover:border-brand-gold/40'
                  }`}
                >
                  {d.label} {d.dayNum}/09
                </button>
              ))}
            </div>
          </div>

          {/* Linha do tempo dos horários */}
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => {
              const bookedApts = filteredAppointments.filter(
                (a) => a.date === selectedDate && a.timeSlot === slot,
              );

              return (
                <div
                  key={slot}
                  className="flex items-start gap-3 p-2 rounded hover:bg-white/[0.02] transition border-b border-white/5 last:border-0"
                >
                  {/* Horário */}
                  <div className="w-16 pt-1 text-right font-display text-xs font-bold text-brand-gold shrink-0">
                    {slot}
                  </div>

                  {/* Conteúdo do Horário */}
                  <div className="flex-1 min-w-0">
                    {bookedApts.length === 0 ? (
                      <div className="flex items-center justify-between py-1 px-3 rounded border border-dashed border-white/5 text-[11px] text-brand-cream/30 hover:border-brand-gold/30 group">
                        <span>Horário livre</span>
                        <button
                          type="button"
                          onClick={() => openCreateModal(selectedDate, slot)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-brand-gold transition"
                        >
                          <Plus size={12} />
                          <span>Encaixe neste horário</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {bookedApts.map((apt) => (
                          <div
                            key={apt.id}
                            className="rounded border border-brand-gold/30 bg-[#181818] p-3 shadow-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-brand-cream flex items-center gap-1.5">
                                {apt.subscriptionId ? (
                                  <Crown size={12} className="text-brand-gold" />
                                ) : (
                                  <User size={12} className="text-brand-cream/40" />
                                )}
                                {apt.customerName}
                              </span>
                              {renderStatusBadge(apt.status)}
                            </div>

                            <p className="text-xs text-brand-gold/90">{apt.serviceType}</p>
                            <p className="text-[11px] text-brand-cream/60 mt-0.5">
                              Barbeiro: <strong className="text-brand-cream/80">{apt.barberName}</strong>
                            </p>

                            {apt.notes && (
                              <p className="text-[10px] text-brand-cream/40 italic mt-1 border-t border-white/5 pt-1">
                                &ldquo;{apt.notes}&rdquo;
                              </p>
                            )}

                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                              <a
                                href={getWhatsAppConfirmationUrl(apt)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                <WhatsAppIcon size={12} className="text-[#25D366]" />
                                <span>Avisar</span>
                              </a>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(apt)}
                                  className="text-xs text-brand-cream/60 hover:text-brand-gold p-1"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(apt.id)}
                                  className="text-xs text-brand-cream/40 hover:text-rose-400 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VISÃO LISTA / TABELA GERAL                             */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto rounded border border-white/10 bg-[#121212]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-brand-cream/60">
              <tr>
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Serviço</th>
                <th className="py-3 px-4">Barbeiro</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-cream/40">
                    Nenhum agendamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-display font-bold text-brand-gold">{apt.timeSlot}</p>
                      <p className="text-[10px] text-brand-cream/50">
                        {apt.date.split('-').reverse().join('/')}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-brand-cream">{apt.customerName}</p>
                      <a
                        href={getWhatsAppConfirmationUrl(apt)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400/80 hover:text-emerald-300"
                      >
                        <WhatsAppIcon size={11} className="text-[#25D366]" />
                        <span>{apt.customerPhone}</span>
                      </a>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {apt.subscriptionId ? (
                        <span className="inline-flex items-center gap-1 rounded bg-brand-gold/10 px-2 py-0.5 text-[10px] font-medium text-brand-gold border border-brand-gold/30">
                          <Crown size={10} /> Assinante
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-brand-cream/60">
                          <User size={10} /> Avulso
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-brand-cream">{apt.serviceType}</p>
                      {apt.notes && (
                        <p className="text-[10px] text-brand-cream/40 italic truncate max-w-xs">
                          &ldquo;{apt.notes}&rdquo;
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-brand-cream/80">
                      {apt.barberName || 'Henrique Becker'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-brand-gold">
                      {apt.priceInCents === 0 ? 'Plano Clube' : formatBRL(apt.priceInCents || 0)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(apt.status)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {apt.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(apt.id, 'in_progress')}
                            className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[10px] font-medium text-amber-300 hover:bg-amber-500/30 transition"
                          >
                            Atender
                          </button>
                        )}
                        {apt.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(apt.id, 'completed')}
                            className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/30 transition"
                          >
                            Concluir
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(apt)}
                          className="rounded border border-white/10 p-1.5 text-brand-cream/60 hover:border-brand-gold hover:text-brand-gold transition"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(apt.id)}
                          className="rounded border border-white/10 p-1.5 text-brand-cream/40 hover:border-rose-500/50 hover:text-rose-400 transition"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR OU EDITAR AGENDAMENTO                        */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-sm border border-brand-gold/40 bg-[#141414] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Scissors size={18} className="text-brand-gold" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-cream">
                  {isEditing ? 'Remarcar / Editar Agendamento' : 'Novo Agendamento na Grade'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-brand-cream/40 hover:text-brand-gold"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              {/* Tipo de Cliente (somente se novo) */}
              {!isEditing && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1.5">
                    Origem do Cliente
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setClientType('subscriber');
                        if (subscriptions.length > 0) {
                          setCustomerName(subscriptions[0].customerName);
                          setCustomerPhone(subscriptions[0].customerPhone);
                          setSelectedSubscriberId(subscriptions[0].id);
                          setPriceInCents(0);
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded p-2.5 text-xs font-medium transition ${
                        clientType === 'subscriber'
                          ? 'border border-brand-gold bg-brand-gold/15 text-brand-gold font-bold'
                          : 'border border-white/10 bg-brand-black text-brand-cream/60'
                      }`}
                    >
                      <Crown size={13} />
                      <span>Assinante do Clube</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setClientType('guest');
                        setCustomerName('');
                        setCustomerPhone('');
                        setSelectedSubscriberId('');
                        setPriceInCents(SERVICES_CATALOG[0].priceInCents);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded p-2.5 text-xs font-medium transition ${
                        clientType === 'guest'
                          ? 'border border-brand-gold bg-brand-gold/15 text-brand-gold font-bold'
                          : 'border border-white/10 bg-brand-black text-brand-cream/60'
                      }`}
                    >
                      <User size={13} />
                      <span>Cliente Avulso</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Se for Assinante: Dropdown dos membros */}
              {clientType === 'subscriber' && !isEditing ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Selecionar Assinante Ativo
                  </label>
                  <select
                    value={selectedSubscriberId}
                    onChange={(e) => {
                      const sub = subscriptions.find((s) => s.id === e.target.value);
                      if (sub) {
                        setSelectedSubscriberId(sub.id);
                        setCustomerName(sub.customerName);
                        setCustomerPhone(sub.customerPhone);
                        setPriceInCents(0);
                      }
                    }}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    {subscriptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.customerName} — {s.planName} ({s.customerPhone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Cliente Avulso ou Edição: Campos Manuais */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Matheus Ramos"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream placeholder-brand-cream/40 focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="48991234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream placeholder-brand-cream/40 focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Barbeiro & Serviço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Profissional / Barbeiro
                  </label>
                  <select
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    {BARBERS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Serviço Selecionado
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      const s = SERVICES_CATALOG.find((cat) => cat.name === e.target.value);
                      setServiceType(e.target.value);
                      if (s && clientType !== 'subscriber') {
                        setPriceInCents(s.priceInCents);
                        setDurationMinutes(s.duration);
                      }
                    }}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name} — {formatBRL(s.priceInCents)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data & Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Data do Agendamento
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Horário (Slot)
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Valor e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Valor (Centavos / R$)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="500"
                      value={priceInCents}
                      onChange={(e) => setPriceInCents(Number(e.target.value))}
                      className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                    />
                    <span className="text-xs text-brand-gold font-mono whitespace-nowrap">
                      {formatBRL(priceInCents)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                    Status do Atendimento
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                    className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    <option value="confirmed">Confirmado</option>
                    <option value="in_progress">Na Cadeira (Em Atendimento)</option>
                    <option value="completed">Concluído</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Observações / Notas do barbeiro */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/70 mb-1">
                  Observações / Preferências do Cliente
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Degrade navalhado zero, toalha quente, tesoura no topo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded border border-white/10 bg-brand-black p-2.5 text-xs text-brand-cream placeholder-brand-cream/40 focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-white/10 px-4 py-2 text-xs font-medium text-brand-cream/70 hover:text-brand-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-brand-gold px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-brand-black hover:bg-brand-gold/90 transition shadow-gold disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAR EXCLUSÃO                                 */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded border border-rose-500/40 bg-[#141414] p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle size={20} />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                Excluir Agendamento?
              </h4>
            </div>
            <p className="text-xs text-brand-cream/70 mb-4 leading-relaxed">
              Deseja remover permanentemente este horário da grade? Você também pode apenas alterar o status para &ldquo;Cancelado&rdquo; para manter o histórico.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded border border-white/10 px-3 py-1.5 text-xs text-brand-cream/70 hover:text-brand-cream"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleQuickStatus(deleteConfirmId, 'canceled');
                  setDeleteConfirmId(null);
                }}
                className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20"
              >
                Apenas Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAppointment(deleteConfirmId)}
                className="rounded bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Excluir Definitivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
