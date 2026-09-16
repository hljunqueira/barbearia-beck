'use client';

import { useState, useEffect, useMemo } from 'react';
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
  MoreVertical,
  Plus,
  Search,
  Trash2,
  User,
  X,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Loader2,
} from 'lucide-react';
import type { Appointment, AppointmentStatus, Subscription, Barber, AgendaSettings } from '@/types';
import {
  createAdminAppointment,
  deleteAppointment,
  updateAppointmentDetails,
  updateAppointmentStatus,
} from '@/app/actions/subscriptionActions';
import { listBarbersAction } from '@/app/actions/barberActions';
import {
  getAgendaSettingsAction,
  updateAgendaSettingsAction,
} from '@/app/actions/agendaActions';
import { formatBRL } from '@/lib/format';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { AgendaConfigModal } from '@/components/admin/AgendaConfigModal';
import { isAllowedClubDay, getTimeSlotsForDay } from '@/lib/data/subscriptions';

interface BarberAgendaProps {
  initialAppointments: Appointment[];
  subscriptions: Subscription[];
  barbers?: Barber[];
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

// Utilitário para formatar YYYY-MM-DD em fuso horário local
const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Retorna a segunda-feira da semana de uma data
const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Retorna uma data de atendimento válida (Segunda a Quarta-feira)
const getInitialClubDate = (): string => {
  const today = new Date();
  const day = today.getDay();
  if (day >= 1 && day <= 3) {
    return formatLocalDate(today);
  }
  return formatLocalDate(getMondayOfWeek(today));
};

export const BarberAgenda = ({
  initialAppointments,
  subscriptions,
  barbers: externalBarbers,
  onAppointmentsChange,
}: BarberAgendaProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [barbersList, setBarbersList] = useState<Barber[]>(externalBarbers || []);
  const [agendaSettings, setAgendaSettings] = useState<AgendaSettings | null>(null);

  // Modo de Período: Semanal ou Mensal
  const [periodMode, setPeriodMode] = useState<'weekly' | 'monthly'>('weekly');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Navegação Temporal Real (Segunda a Quarta-feira)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMondayOfWeek(new Date()));
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(() => getInitialClubDate());

  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'list'>('grid');
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AppointmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
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
  const [barberName, setBarberName] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('15:00');
  const [priceInCents, setPriceInCents] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(35);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  const [submitting, setSubmitting] = useState(false);

  // Carregar barbeiros e configurações caso não fornecidos
  useEffect(() => {
    async function loadData() {
      if (!externalBarbers || externalBarbers.length === 0) {
        try {
          const list = await listBarbersAction();
          setBarbersList(list);
          if (list.length > 0 && !barberName) {
            setBarberName(list[0].name);
          }
        } catch (e) {
          console.error('Erro ao carregar barbeiros:', e);
        }
      } else if (externalBarbers.length > 0 && !barberName) {
        setBarberName(externalBarbers[0].name);
      }

      try {
        const settings = await getAgendaSettingsAction();
        setAgendaSettings(settings);
      } catch (e) {
        console.error('Erro ao carregar configurações da agenda:', e);
      }
    }
    loadData();
  }, [externalBarbers]);

  // Gerar dias da semana atual (Exclusivamente Segunda a Quarta-feira)
  const weekDays = useMemo(() => {
    const days = [];
    const labels = ['Seg', 'Ter', 'Qua'];
    const fullLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira'];

    for (let i = 0; i < 3; i++) {
      const d = new Date(currentWeekMonday);
      d.setDate(currentWeekMonday.getDate() + i);
      const dateStr = formatLocalDate(d);
      days.push({
        date: dateStr,
        label: labels[i],
        fullLabel: fullLabels[i],
        dayNum: String(d.getDate()).padStart(2, '0'),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentWeekMonday, todayStr]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateList = (newList: Appointment[]) => {
    setAppointments(newList);
    if (onAppointmentsChange) onAppointmentsChange(newList);
  };

  // Navegar Semanas
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(currentWeekMonday.getDate() - 7);
    setCurrentWeekMonday(prev);
    setSelectedDate(formatLocalDate(prev));
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(currentWeekMonday.getDate() + 7);
    setCurrentWeekMonday(next);
    setSelectedDate(formatLocalDate(next));
  };

  const handleCurrentWeek = () => {
    const mon = getMondayOfWeek(new Date());
    setCurrentWeekMonday(mon);
    setSelectedDate(getInitialClubDate());
  };

  // Navegar Meses
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonthDate(new Date());
  };

  const currentMonthLabel = useMemo(() => {
    const str = currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [currentMonthDate]);

  const currentWeekLabel = useMemo(() => {
    const endDay = new Date(currentWeekMonday);
    endDay.setDate(currentWeekMonday.getDate() + 2); // Quarta-feira
    const startStr = `${String(currentWeekMonday.getDate()).padStart(2, '0')}/${String(currentWeekMonday.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${String(endDay.getDate()).padStart(2, '0')}/${String(endDay.getMonth() + 1).padStart(2, '0')}`;
    return `${startStr} a ${endStr}`;
  }, [currentWeekMonday]);

  // Semanas do Mês Selecionado (Exclusivamente colunas de Segunda a Quarta-feira)
  const monthWeeks = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let cursorMonday = getMondayOfWeek(firstDayOfMonth);
    const weeks = [];
    let weekCounter = 1;

    while (
      cursorMonday <= lastDayOfMonth ||
      (cursorMonday.getMonth() === month && cursorMonday.getFullYear() === year)
    ) {
      const dayLabels = ['Seg', 'Ter', 'Qua'];
      const fullLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira'];
      const days = [];

      for (let i = 0; i < 3; i++) {
        const d = new Date(cursorMonday);
        d.setDate(cursorMonday.getDate() + i);
        const dateStr = formatLocalDate(d);

        const dayApts = appointments.filter((a) => {
          if (a.date !== dateStr) return false;
          if (selectedBarber !== 'all' && a.barberName !== selectedBarber) return false;
          if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = a.customerName.toLowerCase().includes(q);
            const matchPhone = a.customerPhone.includes(q);
            const matchService = a.serviceType.toLowerCase().includes(q);
            if (!matchName && !matchPhone && !matchService) return false;
          }
          return true;
        });

        const stats = {
          total: dayApts.length,
          confirmed: dayApts.filter((a) => a.status === 'confirmed').length,
          inProgress: dayApts.filter((a) => a.status === 'in_progress').length,
          completed: dayApts.filter((a) => a.status === 'completed').length,
          canceled: dayApts.filter((a) => a.status === 'canceled').length,
        };

        days.push({
          date: dateStr,
          label: dayLabels[i],
          fullLabel: fullLabels[i],
          dayNum: String(d.getDate()).padStart(2, '0'),
          monthShort: d.toLocaleDateString('pt-BR', { month: 'short' }),
          isCurrentMonth: d.getMonth() === month,
          isToday: dateStr === todayStr,
          isSelected: dateStr === selectedDate,
          appointments: dayApts,
          stats,
        });
      }

      weeks.push({
        weekNumber: weekCounter++,
        days,
      });

      const nextMonday = new Date(cursorMonday);
      nextMonday.setDate(cursorMonday.getDate() + 7);
      cursorMonday = nextMonday;

      if (cursorMonday > lastDayOfMonth && cursorMonday.getMonth() !== month) {
        break;
      }
    }

    return weeks;
  }, [currentMonthDate, appointments, selectedBarber, selectedStatus, searchQuery, todayStr, selectedDate]);

  // Slots dinâmicos para a data atualmente selecionada
  const activeDaySlots = useMemo(() => {
    if (!selectedDate) return TIME_SLOTS;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d, 12, 0, 0);
    return getTimeSlotsForDay(dt);
  }, [selectedDate]);

  // Filtragem dos Agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (viewMode !== 'list' && apt.date !== selectedDate) return false;
      if (selectedBarber !== 'all' && apt.barberName !== selectedBarber) return false;
      if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = apt.customerName.toLowerCase().includes(q);
        const matchPhone = apt.customerPhone.includes(q);
        const matchService = apt.serviceType.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService) return false;
      }
      return true;
    });
  }, [appointments, selectedDate, selectedBarber, selectedStatus, searchQuery, viewMode]);

  // Métrica do Dia Selecionado
  const dayStats = useMemo(() => {
    const dayApts = appointments.filter((a) => a.date === selectedDate);
    const confirmed = dayApts.filter((a) => a.status === 'confirmed').length;
    const completed = dayApts.filter((a) => a.status === 'completed').length;
    const inProgress = dayApts.filter((a) => a.status === 'in_progress').length;
    const canceled = dayApts.filter((a) => a.status === 'canceled').length;
    const totalRevenue = dayApts
      .filter((a) => a.status === 'completed')
      .reduce((acc, curr) => acc + (curr.priceInCents || 0), 0);

    return {
      total: dayApts.length,
      confirmed,
      completed,
      inProgress,
      canceled,
      totalRevenue,
    };
  }, [appointments, selectedDate]);

  // Ações de Status Rápido
  const handleQuickStatus = async (id: string, newStatus: AppointmentStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (res.ok) {
      const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      updateList(updated);
      showToast('Status atualizado.');
    } else {
      showToast(res.error || 'Erro ao atualizar.');
    }
  };

  // Validação da data no modal (Segunda a Quarta-feira)
  const isAppointmentDateValid = useMemo(() => {
    if (!appointmentDate) return false;
    const [y, m, d] = appointmentDate.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d, 12, 0, 0);
    return isAllowedClubDay(targetDate);
  }, [appointmentDate]);

  // Slots dinâmicos para a data selecionada no modal
  const modalSlots = useMemo(() => {
    if (!appointmentDate) return TIME_SLOTS;
    const [y, m, d] = appointmentDate.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d, 12, 0, 0);
    const slots = getTimeSlotsForDay(targetDate);
    return slots.length > 0 ? slots : TIME_SLOTS;
  }, [appointmentDate]);

  // Abrir Modal de Novo Agendamento
  const handleOpenNew = () => {
    setIsEditing(false);
    setEditingId(null);
    setClientType('subscriber');
    if (subscriptions.length > 0) {
      setSelectedSubscriberId(subscriptions[0].id);
      setCustomerName(subscriptions[0].customerName);
      setCustomerPhone(subscriptions[0].customerPhone);
      setPriceInCents(0);
    } else {
      setClientType('guest');
      setCustomerName('');
      setCustomerPhone('');
      setSelectedSubscriberId('');
      setPriceInCents(SERVICES_CATALOG[0].priceInCents);
    }
    setServiceType(SERVICES_CATALOG[0].name);
    setBarberName(barbersList[0]?.name || 'Matheus Becker');

    const validInitialDate = isAllowedClubDay(new Date(selectedDate + 'T12:00:00'))
      ? selectedDate
      : getInitialClubDate();
    setAppointmentDate(validInitialDate);

    const [y, m, d] = validInitialDate.split('-').map(Number);
    const slots = getTimeSlotsForDay(new Date(y, m - 1, d, 12, 0, 0));
    setTimeSlot(slots[0] || '14:00');

    setDurationMinutes(35);
    setNotes('');
    setStatus('confirmed');
    setIsModalOpen(true);
  };

  // Abrir Edição
  const handleOpenEdit = (apt: Appointment) => {
    setIsEditing(true);
    setEditingId(apt.id);
    setCustomerName(apt.customerName);
    setCustomerPhone(apt.customerPhone);
    setServiceType(apt.serviceType);
    setBarberName(apt.barberName || '');
    setAppointmentDate(apt.date);
    setTimeSlot(apt.timeSlot);
    setPriceInCents(apt.priceInCents || 0);
    setDurationMinutes(apt.durationMinutes || 35);
    setNotes(apt.notes || '');
    setStatus(apt.status);
    setIsModalOpen(true);
  };

  // Salvar Agendamento
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAppointmentDateValid) {
      showToast('Data inválida. Agendamentos são exclusivos de Segunda a Quarta-feira.');
      return;
    }

    setSubmitting(true);

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
      });

      if (res.ok && res.appointment) {
        const updated = appointments.map((a) => (a.id === editingId ? res.appointment! : a));
        updateList(updated);
        setIsModalOpen(false);
        showToast('Agendamento atualizado com sucesso.');
      } else {
        showToast(res.error || 'Erro ao atualizar.');
      }
    } else {
      const res = await createAdminAppointment({
        subscriptionId: clientType === 'subscriber' ? selectedSubscriberId : undefined,
        customerName,
        customerPhone,
        serviceType,
        barberName: barberName || barbersList[0]?.name || 'Matheus Becker',
        date: appointmentDate,
        timeSlot,
        priceInCents: clientType === 'subscriber' ? 0 : priceInCents,
        durationMinutes,
        notes,
        status,
      });

      if (res.ok && res.appointment) {
        updateList([res.appointment, ...appointments]);
        setIsModalOpen(false);
        showToast('Agendamento criado com sucesso.');
      } else {
        showToast(res.error || 'Erro ao agendar.');
      }
    }
    setSubmitting(false);
  };

  // Exclusão
  const handleDeleteAppointment = async (id: string) => {
    const res = await deleteAppointment(id);
    if (res.ok) {
      const updated = appointments.filter((a) => a.id !== id);
      updateList(updated);
      setDeleteConfirmId(null);
      showToast('Agendamento cancelado e removido.');
    } else {
      showToast(res.error || 'Erro ao excluir.');
    }
  };

  // Salvar Parâmetros da Agenda
  const handleSaveAgendaConfig = async (data: {
    slotIntervalMinutes: number;
    openingTime: string;
    closingTime: string;
    allowedClubDays: number[];
  }) => {
    const res = await updateAgendaSettingsAction(data);
    if (res.ok) {
      const refreshed = await getAgendaSettingsAction();
      setAgendaSettings(refreshed);
      showToast('Configurações da agenda atualizadas.');
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded bg-[#141414] border border-brand-gold/60 p-3 shadow-2xl text-xs text-brand-cream font-medium">
          {toastMessage}
        </div>
      )}

      {/* ========================================================= */}
      {/* CABEÇALHO UNIFICADO COM NAVEGAÇÃO TEMPORAL REAL (SEMANAL / MENSAL) */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-cream">
                Agenda & Grade de Atendimentos
              </h2>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 border border-white/10 hover:border-brand-gold/40 text-[11px] font-mono text-brand-cream/70 hover:text-brand-gold transition"
                title="Configurar horários de abertura e regras da agenda"
              >
                <Sliders size={12} />
                <span>Regras da Agenda</span>
              </button>
            </div>
            <p className="text-xs text-brand-cream/50 mt-0.5">
              Clube da Barba & Atendimentos — Exclusivo de Segunda a Quarta-feira
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Alternador de Período: Semanal vs Mensal */}
            <div className="flex bg-black/80 border border-white/10 rounded p-0.5">
              <button
                onClick={() => setPeriodMode('weekly')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded uppercase transition ${
                  periodMode === 'weekly'
                    ? 'bg-brand-gold text-brand-black font-bold shadow-sm'
                    : 'text-brand-cream/60 hover:text-brand-cream'
                }`}
              >
                <Calendar size={13} />
                <span>Semanal</span>
              </button>
              <button
                onClick={() => setPeriodMode('monthly')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded uppercase transition ${
                  periodMode === 'monthly'
                    ? 'bg-brand-gold text-brand-black font-bold shadow-sm'
                    : 'text-brand-cream/60 hover:text-brand-cream'
                }`}
              >
                <CalendarDays size={13} />
                <span>Mensal</span>
              </button>
            </div>

            {/* Navegação de Tempo (Semana ou Mês) */}
            {periodMode === 'weekly' ? (
              <div className="flex items-center bg-black/60 border border-white/10 rounded p-0.5">
                <button
                  onClick={handlePrevWeek}
                  className="p-1.5 hover:bg-white/5 rounded text-brand-cream/60 hover:text-brand-cream transition"
                  title="Semana Anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleCurrentWeek}
                  className="px-2.5 py-1 text-[11px] font-mono text-brand-cream hover:text-brand-gold uppercase transition"
                >
                  Semana Atual
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-1.5 hover:bg-white/5 rounded text-brand-cream/60 hover:text-brand-cream transition"
                  title="Próxima Semana"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center bg-black/60 border border-white/10 rounded p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white/5 rounded text-brand-cream/60 hover:text-brand-cream transition"
                  title="Mês Anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleCurrentMonth}
                  className="px-2.5 py-1 text-[11px] font-mono text-brand-cream hover:text-brand-gold uppercase transition"
                >
                  Mês Atual
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white/5 rounded text-brand-cream/60 hover:text-brand-cream transition"
                  title="Próximo Mês"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Seletor de Modo de Visualização do Dia (visível no modo semanal) */}
            {periodMode === 'weekly' && (
              <div className="flex bg-black/60 border border-white/10 rounded p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-mono rounded uppercase transition ${
                    viewMode === 'grid'
                      ? 'bg-brand-gold text-brand-black font-bold'
                      : 'text-brand-cream/60 hover:text-brand-cream'
                  }`}
                >
                  Grade
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 text-xs font-mono rounded uppercase transition ${
                    viewMode === 'timeline'
                      ? 'bg-brand-gold text-brand-black font-bold'
                      : 'text-brand-cream/60 hover:text-brand-cream'
                  }`}
                >
                  Cadeiras
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs font-mono rounded uppercase transition ${
                    viewMode === 'list'
                      ? 'bg-brand-gold text-brand-black font-bold'
                      : 'text-brand-cream/60 hover:text-brand-cream'
                  }`}
                >
                  Lista
                </button>
              </div>
            )}

            {/* Botão Novo Agendamento */}
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-wider font-display rounded hover:bg-brand-gold-light transition"
            >
              <Plus size={14} />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Indicador do Período Ativo */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-cream/60 bg-black/40 px-3 py-1.5 rounded border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold font-bold uppercase">
              {periodMode === 'weekly' ? 'Semana Ativa:' : 'Mês Ativo:'}
            </span>
            <span className="text-brand-cream font-medium">
              {periodMode === 'weekly' ? currentWeekLabel : currentMonthLabel}
            </span>
          </div>
          <span className="text-[11px] text-brand-cream/40 hidden sm:inline">
            Atendimento exclusivo: Segunda (14h-18h30), Terça e Quarta (08h-18h30)
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODO SEMANAL: SELETOR DE 3 DIAS (SEGUNDA A QUARTA-FEIRA)  */}
      {/* ========================================================= */}
      {periodMode === 'weekly' && viewMode !== 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.date;
            const count = appointments.filter((a) => a.date === d.date).length;
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`p-3.5 rounded border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/15 text-brand-cream shadow-md'
                    : 'border-white/10 bg-[#141414] text-brand-cream/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-brand-gold font-bold">
                    {d.label} • {d.dayNum}
                  </span>
                  {d.isToday && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Hoje
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-brand-cream/90 font-medium">{d.fullLabel}</span>
                  <span className="text-[11px] font-mono text-brand-cream/60 bg-black/50 px-2 py-0.5 rounded border border-white/5">
                    {count} agendamento(s)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* BARRA DE FILTROS & BUSCA RÁPIDA                           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Barbeiro Real */}
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="bg-black/70 border border-white/10 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
          >
            <option value="all">Todos os Barbeiros</option>
            {barbersList.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-black/70 border border-white/10 rounded px-2.5 py-1.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmados</option>
            <option value="in_progress">Em Atendimento</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
            <option value="no_show">Faltas</option>
          </select>
        </div>

        {/* Busca por Nome ou Telefone */}
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-2.5 text-brand-cream/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente, fone..."
            className="w-full bg-black/70 border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:border-brand-gold focus:outline-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* VISÃO MENSAL: CALENDÁRIO COM 3 COLUNAS (SEG, TER, QUA)     */}
      {/* ========================================================= */}
      {periodMode === 'monthly' && (
        <div className="space-y-4">
          {/* Cabeçalho das 3 Colunas de Atendimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-black/80 rounded border border-white/10 text-center">
              <span className="font-mono text-xs uppercase font-bold text-brand-gold block">
                Segunda-feira
              </span>
              <span className="text-[11px] text-brand-cream/40 font-mono">14:00 às 18:30</span>
            </div>
            <div className="p-3 bg-black/80 rounded border border-white/10 text-center">
              <span className="font-mono text-xs uppercase font-bold text-brand-gold block">
                Terça-feira
              </span>
              <span className="text-[11px] text-brand-cream/40 font-mono">08:00 às 18:30</span>
            </div>
            <div className="p-3 bg-black/80 rounded border border-white/10 text-center">
              <span className="font-mono text-xs uppercase font-bold text-brand-gold block">
                Quarta-feira
              </span>
              <span className="text-[11px] text-brand-cream/40 font-mono">08:00 às 18:30</span>
            </div>
          </div>

          {/* Semanas do Mês */}
          <div className="space-y-3">
            {monthWeeks.map((week) => (
              <div key={week.weekNumber} className="space-y-1">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-mono text-brand-cream/40 uppercase tracking-wider">
                    Semana {week.weekNumber}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {week.days.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                      <div
                        key={d.date}
                        className={`p-3.5 rounded border transition flex flex-col justify-between min-h-[160px] ${
                          isSelected
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-cream shadow-lg'
                            : d.isCurrentMonth
                            ? 'border-white/10 bg-[#141414] text-brand-cream hover:border-white/20'
                            : 'border-white/5 bg-black/20 text-brand-cream/40 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div>
                          {/* Topo do Card do Dia */}
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-brand-gold">
                                {d.dayNum}
                              </span>
                              <span className="text-[11px] font-mono text-brand-cream/60 uppercase">
                                {d.monthShort} • {d.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {d.isToday && (
                                <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                  Hoje
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-brand-cream/60 bg-black/60 px-2 py-0.5 rounded border border-white/5 font-bold">
                                {d.stats.total} agendamento(s)
                              </span>
                            </div>
                          </div>

                          {/* Mini Badges de Status */}
                          {d.stats.total > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {d.stats.confirmed > 0 && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/20">
                                  {d.stats.confirmed} conf.
                                </span>
                              )}
                              {d.stats.inProgress > 0 && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/20">
                                  {d.stats.inProgress} atend.
                                </span>
                              )}
                              {d.stats.completed > 0 && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/20">
                                  {d.stats.completed} concl.
                                </span>
                              )}
                            </div>
                          )}

                          {/* Lista resumida de clientes do dia */}
                          <div className="mt-2.5 space-y-1">
                            {d.appointments.length === 0 ? (
                              <p className="text-[11px] font-mono text-brand-cream/30 py-2">
                                Horários livres. Nenhum atendimento marcado.
                              </p>
                            ) : (
                              d.appointments.slice(0, 3).map((apt) => (
                                <div
                                  key={apt.id}
                                  className="text-[11px] font-mono flex items-center justify-between p-1 rounded bg-black/40 border border-white/5"
                                >
                                  <div className="truncate pr-1">
                                    <span className="text-brand-gold font-bold mr-1.5">{apt.timeSlot}</span>
                                    <span className="text-brand-cream/90 truncate">{apt.customerName}</span>
                                  </div>
                                  <span className="text-[10px] text-brand-cream/50 truncate shrink-0">
                                    {apt.barberName}
                                  </span>
                                </div>
                              ))
                            )}
                            {d.appointments.length > 3 && (
                              <p className="text-[10px] font-mono text-brand-cream/40 text-right pt-0.5">
                                + {d.appointments.length - 3} outro(s)...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação do Dia */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-3">
                          <button
                            onClick={() => {
                              setSelectedDate(d.date);
                              const [y, m, dayNum] = d.date.split('-').map(Number);
                              setCurrentWeekMonday(getMondayOfWeek(new Date(y, m - 1, dayNum, 12, 0, 0)));
                              setPeriodMode('weekly');
                              setViewMode('grid');
                            }}
                            className="flex-1 py-1 px-2 rounded bg-black/60 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-brand-cream text-center transition"
                            title="Abrir a grade detalhada com todos os horários e barbeiros deste dia"
                          >
                            Abrir Grade
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDate(d.date);
                              setAppointmentDate(d.date);
                              const [y, m, dayNum] = d.date.split('-').map(Number);
                              const targetDate = new Date(y, m - 1, dayNum, 12, 0, 0);
                              const slots = getTimeSlotsForDay(targetDate);
                              setTimeSlot(slots[0] || '14:00');
                              handleOpenNew();
                            }}
                            className="py-1 px-2.5 rounded bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-black border border-brand-gold/40 text-[11px] font-mono font-bold transition flex items-center gap-1"
                            title="Novo agendamento nesta data"
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
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MÉTRICAS RÁPIDAS DO DIA SELECIONADO (MODO SEMANAL)        */}
      {/* ========================================================= */}
      {periodMode === 'weekly' && viewMode !== 'list' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded bg-black/40 border border-white/10 text-center">
            <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">Total do Dia</span>
            <span className="font-display text-base font-bold text-brand-cream">{dayStats.total}</span>
          </div>
          <div className="p-3 rounded bg-black/40 border border-white/10 text-center">
            <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">Confirmados</span>
            <span className="font-display text-base font-bold text-sky-400">{dayStats.confirmed}</span>
          </div>
          <div className="p-3 rounded bg-black/40 border border-white/10 text-center">
            <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">Em Andamento</span>
            <span className="font-display text-base font-bold text-amber-400">{dayStats.inProgress}</span>
          </div>
          <div className="p-3 rounded bg-black/40 border border-white/10 text-center">
            <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">Concluídos</span>
            <span className="font-display text-base font-bold text-emerald-400">{dayStats.completed}</span>
          </div>
          <div className="p-3 rounded bg-black/40 border border-white/10 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">Faturamento Avulso</span>
            <span className="font-display text-base font-bold text-brand-gold">{formatBRL(dayStats.totalRevenue)}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 1: GRADE DE HORÁRIOS DO DIA (SEMANAL)                */}
      {/* ========================================================= */}
      {periodMode === 'weekly' && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeDaySlots.map((slot) => {
            const slotApts = filteredAppointments.filter((a) => a.timeSlot === slot);
            const hasApt = slotApts.length > 0;

            return (
              <div
                key={slot}
                className={`p-3 rounded border transition flex flex-col justify-between ${
                  hasApt
                    ? 'border-white/15 bg-[#181818]'
                    : 'border-white/5 bg-black/30 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-brand-gold" />
                    <span className="font-mono text-xs font-bold text-brand-cream">{slot}</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-cream/40">
                    {hasApt ? `${slotApts.length} agendamento(s)` : 'Livre'}
                  </span>
                </div>

                {hasApt ? (
                  <div className="space-y-2">
                    {slotApts.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded bg-black/60 border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs font-bold text-brand-cream truncate">
                            {apt.customerName}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1 rounded ${
                              apt.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-400'
                                : apt.status === 'in_progress'
                                ? 'bg-amber-950 text-amber-400'
                                : apt.status === 'canceled'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-sky-950 text-sky-400'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-brand-gold font-mono truncate">{apt.serviceType}</p>
                        <p className="text-[10px] text-brand-cream/60 truncate">Barbeiro: {apt.barberName}</p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickStatus(apt.id, 'in_progress')}
                            className="p-1 hover:bg-white/10 rounded text-amber-400"
                            title="Iniciar Atendimento"
                          >
                            <Play size={11} />
                          </button>
                          <button
                            onClick={() => handleQuickStatus(apt.id, 'completed')}
                            className="p-1 hover:bg-white/10 rounded text-emerald-400"
                            title="Concluir"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(apt)}
                            className="p-1 hover:bg-white/10 rounded text-brand-cream/60 hover:text-brand-gold"
                            title="Editar"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="p-1 hover:bg-white/10 rounded text-red-400"
                            title="Excluir"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTimeSlot(slot);
                      handleOpenNew();
                    }}
                    className="w-full py-2 text-[11px] font-mono text-brand-cream/30 hover:text-brand-gold hover:bg-white/5 rounded border border-dashed border-white/10 transition flex items-center justify-center gap-1"
                  >
                    <Plus size={11} />
                    <span>Agendar Horário</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 2: TIMELINE POR BARBEIRO / CADEIRA (SEMANAL)         */}
      {/* ========================================================= */}
      {periodMode === 'weekly' && viewMode === 'timeline' && (
        <div className="space-y-4">
          {barbersList.map((barber) => {
            const barberApts = filteredAppointments.filter((a) => a.barberName === barber.name);
            return (
              <div key={barber.id} className="p-4 rounded bg-[#141414] border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-brand-gold" />
                    <h3 className="font-display text-xs font-bold uppercase text-brand-cream">
                      {barber.name} ({barber.role})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-brand-cream/50">
                    {barberApts.length} atendimento(s) no dia
                  </span>
                </div>

                {barberApts.length === 0 ? (
                  <p className="text-xs text-brand-cream/40 font-mono py-2">
                    Nenhum agendamento marcado para esta cadeira hoje.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {barberApts.map((apt) => (
                      <div key={apt.id} className="p-3 rounded bg-black/60 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-gold">{apt.timeSlot}</span>
                          <span className="text-[9px] font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded text-brand-cream/70">
                            {apt.status}
                          </span>
                        </div>
                        <h4 className="font-display text-xs font-bold text-brand-cream truncate">{apt.customerName}</h4>
                        <p className="text-[11px] text-brand-cream/60 truncate">{apt.serviceType}</p>
                        <p className="text-[10px] font-mono text-brand-cream/40">{apt.customerPhone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 3: LISTA COMPLETA (SEMANAL)                          */}
      {/* ========================================================= */}
      {periodMode === 'weekly' && viewMode === 'list' && (
        <div className="overflow-x-auto rounded border border-white/10 bg-[#141414]">
          <table className="w-full text-left text-xs text-brand-cream">
            <thead className="bg-black/60 font-mono text-[10px] uppercase text-brand-cream/60 border-b border-white/10">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Serviço</th>
                <th className="p-3">Barbeiro</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-brand-cream/40">
                    Nenhum agendamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white/5 transition">
                    <td className="p-3">
                      <span className="text-brand-gold font-bold">{apt.timeSlot}</span>
                      <span className="text-[10px] text-brand-cream/40 block">{apt.date}</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-brand-cream font-sans font-semibold block">{apt.customerName}</strong>
                      <span className="text-[11px] text-brand-cream/50">{apt.customerPhone}</span>
                    </td>
                    <td className="p-3 text-brand-cream/80">{apt.serviceType}</td>
                    <td className="p-3 text-brand-cream/70">{apt.barberName}</td>
                    <td className="p-3">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-brand-cream/80">
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(apt)}
                          className="p-1 hover:text-brand-gold"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Excluir"
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
      {/* MODAL 4-GRID: NOVO OU EDITAR AGENDAMENTO (100% SÓLIDO)    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
            onClick={() => !submitting && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 text-brand-cream z-10 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
                  Grade de Atendimento
                </p>
                <h2 className="font-display text-lg font-bold text-brand-cream uppercase tracking-wide">
                  {isEditing ? 'Editar Agendamento' : 'Novo Agendamento na Grade'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="p-1.5 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              {/* Alerta caso a data não seja permitida */}
              {!isAppointmentDateValid && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 rounded text-xs text-red-200 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span>
                    Os atendimentos do Clube da Barba ocorrem exclusivamente de <strong>Segunda a Quarta-feira</strong>. Por favor, selecione uma data válida.
                  </span>
                </div>
              )}

              {/* Tipo de Cliente na criação */}
              {!isEditing && (
                <div className="flex items-center gap-2 p-1 bg-black/60 border border-white/10 rounded w-fit">
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
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
                      clientType === 'subscriber'
                        ? 'bg-brand-gold text-brand-black font-bold'
                        : 'text-brand-cream/60 hover:text-brand-cream'
                    }`}
                  >
                    Membro do Clube
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
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition ${
                      clientType === 'guest'
                        ? 'bg-brand-gold text-brand-black font-bold'
                        : 'text-brand-cream/60 hover:text-brand-cream'
                    }`}
                  >
                    Cliente Avulso
                  </button>
                </div>
              )}

              {/* GRID 4 COLUNAS: Dados do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clientType === 'subscriber' && !isEditing ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Assinante Ativo *
                    </label>
                    <select
                      value={selectedSubscriberId}
                      onChange={(e) => {
                        const sub = subscriptions.find((s) => s.id === e.target.value);
                        if (sub) {
                          setSelectedSubscriberId(sub.id);
                          setCustomerName(sub.customerName);
                          setCustomerPhone(sub.customerPhone);
                        }
                      }}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                    >
                      {subscriptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.customerName} ({s.customerPhone})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        Nome do Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        WhatsApp do Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Barbeiro Responsável */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Barbeiro *
                  </label>
                  <select
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    {barbersList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Serviço */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Serviço *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      setServiceType(e.target.value);
                      const svc = SERVICES_CATALOG.find((s) => s.name === e.target.value);
                      if (svc && clientType === 'guest') setPriceInCents(svc.priceInCents);
                    }}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GRID 4 COLUNAS: Data, Horário e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Data (Segunda a Quarta) *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setAppointmentDate(newDate);
                      if (newDate) {
                        const [y, m, d] = newDate.split('-').map(Number);
                        const targetDate = new Date(y, m - 1, d, 12, 0, 0);
                        const slots = getTimeSlotsForDay(targetDate);
                        if (slots.length > 0 && !slots.includes(timeSlot)) {
                          setTimeSlot(slots[0]);
                        }
                      }
                    }}
                    className={`w-full bg-black/70 border rounded px-3 py-2 text-xs text-brand-cream font-mono focus:outline-none ${
                      isAppointmentDateValid
                        ? 'border-white/15 focus:border-brand-gold'
                        : 'border-red-500/60 text-red-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Horário *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                  >
                    {modalSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Valor Cobrado (R$)
                  </label>
                  <input
                    type="text"
                    value={clientType === 'subscriber' ? 'Plano Clube' : formatBRL(priceInCents)}
                    disabled={clientType === 'subscriber'}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, '');
                      setPriceInCents(parseInt(clean, 10) || 0);
                    }}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                    Status Inicial *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                  >
                    <option value="confirmed">Confirmado</option>
                    <option value="in_progress">Em Atendimento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Observações Internas */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                  Observações & Preferências
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-cream/60 hover:text-brand-cream hover:bg-white/5 rounded border border-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isAppointmentDateValid}
                  className="px-5 py-2 text-xs font-display font-bold uppercase tracking-wider bg-brand-gold text-brand-black rounded hover:bg-brand-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuração da Agenda (4-Grid Sólido) */}
      <AgendaConfigModal
        isOpen={isConfigModalOpen}
        settings={agendaSettings}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveAgendaConfig}
      />
    </div>
  );
};
