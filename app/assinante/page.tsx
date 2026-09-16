'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  XCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import type { Appointment, Subscription, Barber } from '@/types';
import {
  bookAppointment,
  findCustomerSubscription,
  listAppointments,
  updateAppointmentStatus,
  registerCustomerSubscriptionAction,
} from '@/app/actions/subscriptionActions';
import { listBarbersAction } from '@/app/actions/barberActions';
import { getTimeSlotsForDay, isAllowedClubDay } from '@/lib/data/subscriptions';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';
import { SubscriberManualModal } from '@/components/SubscriberManualModal';

// Formatação estrita sem problema de timezone
const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AssinantePage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Modal do Manual do Assinante
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Modo de Autenticação: Login ou Novo Cadastro
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPlan, setRegPlan] = useState<'corte-barba' | 'corte' | 'barba'>('corte-barba');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Barbeiros da equipe para agendamento
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('');

  // Estado do formulário de agendamento
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Carregar barbeiros ativos e login salvo
  useEffect(() => {
    listBarbersAction().then((data) => {
      const activeOnly = data.filter((b) => b.active);
      setBarbers(activeOnly);
      if (activeOnly.length > 0 && !selectedBarber) {
        setSelectedBarber(activeOnly[0].name);
      }
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryPhone = params.get('phone');
      const targetPhone = queryPhone || localStorage.getItem('beck_subscriber_phone');
      if (targetPhone) {
        setIdentifier(targetPhone);
        handleLogin(targetPhone);
      }
    }
  }, []);

  const handleLogin = async (phoneOrEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const sub = await findCustomerSubscription(phoneOrEmail);
      if (!sub) {
        setError('Nenhuma assinatura encontrada. Verifique o número ou cadastre-se ao lado.');
        setSubscription(null);
      } else {
        setSubscription(sub);
        localStorage.setItem('beck_subscriber_phone', phoneOrEmail);
        const apts = await listAppointments(sub.id);
        setAppointments(apts);

        // Se o cliente já tem um barbeiro preferido, selecionar
        if (sub.preferredBarber?.name) {
          setSelectedBarber(sub.preferredBarber.name);
        }
      }
    } catch {
      setError('Erro ao verificar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const res = await registerCustomerSubscriptionAction({
        customerName: regName,
        customerPhone: regPhone,
        customerEmail: regEmail.trim() || undefined,
        planSlug: regPlan,
        birthDate: regBirthDate.trim() || undefined,
      });

      if (!res.ok || !res.subscription) {
        setRegError(res.error || 'Falha ao registrar cadastro.');
      } else {
        setSubscription(res.subscription);
        localStorage.setItem('beck_subscriber_phone', res.subscription.customerPhone);
        setAppointments([]);
      }
    } catch {
      setRegError('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogout = () => {
    setSubscription(null);
    setAppointments([]);
    setBookingSuccess(null);
    localStorage.removeItem('beck_subscriber_phone');
  };

  // 14 dias futuros usando data local sem timezone shift
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = formatLocalDate(d);
    const isAllowed = isAllowedClubDay(d);
    const dayOfWeekName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayOfMonth = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return { date: d, dateStr, isAllowed, dayOfWeekName, dayOfMonth };
  });

  // Slots para o dia selecionado
  const availableSlots = selectedDateStr
    ? getTimeSlotsForDay(new Date(selectedDateStr + 'T12:00:00'))
    : [];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription || !selectedDateStr || !selectedTimeSlot) return;

    setBookingLoading(true);
    setError(null);

    const res = await bookAppointment({
      subscriptionId: subscription.id,
      customerName: subscription.customerName,
      customerPhone: subscription.customerPhone,
      planName: subscription.planName,
      serviceType: subscription.planName,
      date: selectedDateStr,
      timeSlot: selectedTimeSlot,
      notes,
      barberName: selectedBarber || (barbers[0]?.name || 'Matheus Becker'),
    });

    setBookingLoading(false);

    if (!res.ok) {
      setError(res.error ?? 'Erro ao agendar horário');
    } else if (res.appointment) {
      setBookingSuccess(res.appointment);
      setAppointments((prev) => [res.appointment!, ...prev]);
      setSelectedDateStr('');
      setSelectedTimeSlot('');
      setNotes('');
    }
  };

  const handleCancelAppointment = async (aptId: string) => {
    if (!confirm('Deseja realmente cancelar este horário?')) return;
    const res = await updateAppointmentStatus(aptId, 'canceled');
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, status: 'canceled' as const } : a)),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-brand-cream">
      {/* Topo / Header */}
      <header className="border-b border-white/10 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-4 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image
              src="/images/logo-removebg-preview.png"
              alt="Beck Barbearia"
              width={44}
              height={38}
              className="object-contain"
            />
            <div>
              <span className="font-display text-sm font-black uppercase tracking-wider text-brand-cream">
                Beck Barbearia
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-brand-gold">
                Portal do Assinante
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Botão Manual do Assinante */}
            <button
              type="button"
              onClick={() => setIsManualOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-brand-black text-xs font-mono uppercase tracking-wider transition"
            >
              <BookOpen size={13} />
              <span>Manual do Clube</span>
            </button>

            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-wider text-brand-cream/60 transition-colors hover:text-brand-gold hidden sm:inline"
            >
              ← Voltar ao Site
            </Link>

            {subscription && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-brand-cream/80 transition-colors hover:border-red-500/50 hover:text-red-400 font-mono uppercase"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        {/* ======================================================== */}
        {/* CASO NÃO AUTENTICADO: LOGIN OU NOVO CADASTRO            */}
        {/* ======================================================== */}
        {!subscription ? (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-display text-2xl font-bold uppercase text-brand-cream tracking-wide">
                Portal do Assinante
              </h1>
              <p className="text-xs text-brand-cream/60">
                Acesse sua conta para agendar horários exclusivos de segunda a quarta-feira
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded border border-white/15 bg-[#141414] shadow-2xl space-y-6">
              {/* Abas Login / Cadastro */}
              <div className="flex border-b border-white/10 pb-3">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 text-xs font-mono uppercase tracking-wider pb-2 border-b-2 transition ${
                    authMode === 'login'
                      ? 'border-brand-gold text-brand-gold font-bold'
                      : 'border-transparent text-brand-cream/50 hover:text-brand-cream'
                  }`}
                >
                  Já sou Assinante
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 text-xs font-mono uppercase tracking-wider pb-2 border-b-2 transition ${
                    authMode === 'register'
                      ? 'border-brand-gold text-brand-gold font-bold'
                      : 'border-transparent text-brand-cream/50 hover:text-brand-cream'
                  }`}
                >
                  Criar Minha Assinatura
                </button>
              </div>

              {/* Formulário Login */}
              {authMode === 'login' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (identifier.trim()) handleLogin(identifier.trim());
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Telefone com DDD ou E-mail cadastrado
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ex: 48999999999 ou seu@email.com"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2.5 text-xs text-brand-cream focus:border-brand-gold focus:outline-none transition"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
                      {error}
                    </div>
                  )}

                  <BrandButton type="submit" disabled={loading} size="full" className="py-2.5 text-xs">
                    {loading ? 'Identificando Assinatura...' : 'Acessar Minha Agenda'}
                  </BrandButton>
                </form>
              )}

              {/* Formulário Cadastro */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="48999999999"
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                        Aniversário (Dia/Mês)
                      </label>
                      <input
                        type="text"
                        value={regBirthDate}
                        onChange={(e) => setRegBirthDate(e.target.value)}
                        placeholder="Ex: 15/10"
                        className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream font-mono focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                      Plano Escolhido *
                    </label>
                    <select
                      value={regPlan}
                      onChange={(e) => setRegPlan(e.target.value as any)}
                      className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                    >
                      <option value="corte-barba">Corte + Barba Completo (R$ 159,90/mês)</option>
                      <option value="corte">Corte Ilimitado (R$ 99,90/mês)</option>
                      <option value="barba">Barboterapia Ilimitada (R$ 89,90/mês)</option>
                    </select>
                  </div>

                  {regError && (
                    <div className="p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
                      {regError}
                    </div>
                  )}

                  <BrandButton type="submit" disabled={regLoading} size="full" className="py-2.5 text-xs">
                    {regLoading ? 'Ativando...' : 'Confirmar e Acessar Agenda'}
                  </BrandButton>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CLIENTE AUTENTICADO: PAINEL EXECUTIVO                    */
          /* ======================================================== */
          <div className="space-y-8">
            {/* Cartão de Identificação do Membro */}
            <div className="p-6 rounded border border-brand-gold/30 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
                  Membro Oficial • Clube da Barba
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-bold uppercase text-brand-cream mt-0.5">
                  Olá, {subscription.customerName}
                </h1>
                <p className="text-xs text-brand-cream/60 mt-1">
                  Plano: <strong className="text-brand-gold">{subscription.planName}</strong> • Renova em:{' '}
                  {subscription.nextBillingDate}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 w-fit">
                  Assinatura Ativa
                </span>
                <button
                  type="button"
                  onClick={() => setIsManualOpen(true)}
                  className="text-[11px] font-mono text-brand-gold hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  <span>Consultar Regras do Clube</span>
                </button>
              </div>
            </div>

            {/* Sucesso de Agendamento */}
            {bookingSuccess && (
              <div className="p-5 rounded border border-emerald-500/50 bg-emerald-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm font-bold uppercase text-brand-cream">
                    Horário Confirmado com Sucesso!
                  </h3>
                  <p className="text-xs text-brand-cream/80 mt-1">
                    Agendado para <strong className="text-brand-gold">{bookingSuccess.date}</strong> às{' '}
                    <strong className="text-brand-gold">{bookingSuccess.timeSlot}</strong> com{' '}
                    <strong className="text-brand-cream">{bookingSuccess.barberName}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={whatsappLink(
                      `Olá! Sou o assinante ${subscription.customerName} e confirmo meu horário no clube para ${bookingSuccess.date} às ${bookingSuccess.timeSlot}.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 transition"
                  >
                    <WhatsAppIcon size={14} className="fill-white" />
                    <span>Avisar no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-3 py-2 rounded border border-white/10 hover:bg-white/5 text-xs text-brand-cream/70"
                  >
                    Novo Agendamento
                  </button>
                </div>
              </div>
            )}

            {/* FLUXO EM 3 PASSOS DE AGENDAMENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-6 sm:p-8 rounded border border-white/10 bg-[#141414] space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="font-display text-base font-bold uppercase text-brand-cream tracking-wide">
                    Agendar Horário na Barbearia
                  </h2>
                  <p className="text-xs text-brand-cream/50 mt-0.5">
                    Os atendimentos do clube são válidos de segunda a quarta-feira
                  </p>
                </div>

                <form onSubmit={handleBook} className="space-y-6">
                  {/* PASSO 1: ESCOLHA DO BARBEIRO */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-gold font-bold mb-2">
                      1. Escolha o Barbeiro:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {barbers.map((b) => {
                        const isSelected = selectedBarber === b.name;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setSelectedBarber(b.name);
                              setSelectedTimeSlot('');
                            }}
                            className={`p-3 rounded border text-left flex items-center gap-3 transition ${
                              isSelected
                                ? 'border-brand-gold bg-brand-gold/15 text-brand-cream'
                                : 'border-white/10 bg-black/50 text-brand-cream/70 hover:border-white/20'
                            }`}
                          >
                            <div className="relative w-11 h-11 rounded overflow-hidden bg-black/60 shrink-0">
                              <Image
                                src={b.photoUrl || '/images/barber-1.webp'}
                                alt={b.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display text-xs font-bold text-brand-cream truncate">
                                {b.name}
                              </p>
                              <p className="text-[10px] font-mono text-brand-gold truncate">{b.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PASSO 2: ESCOLHA DA DATA */}
                  <div className="border-t border-white/10 pt-5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-gold font-bold mb-2">
                      2. Escolha o Dia (Segunda a Quarta):
                    </label>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {upcomingDays.map((day) => {
                        const isSelected = selectedDateStr === day.dateStr;
                        return (
                          <button
                            key={day.dateStr}
                            type="button"
                            disabled={!day.isAllowed}
                            onClick={() => {
                              setSelectedDateStr(day.dateStr);
                              setSelectedTimeSlot('');
                            }}
                            className={`flex flex-col items-center justify-center rounded p-2 text-center transition ${
                              isSelected
                                ? 'border-2 border-brand-gold bg-brand-gold text-brand-black font-bold'
                                : day.isAllowed
                                ? 'border border-white/10 bg-black/60 text-brand-cream hover:border-brand-gold/60'
                                : 'border border-white/5 bg-zinc-900/30 text-brand-cream/20 cursor-not-allowed opacity-40'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-mono">{day.dayOfWeekName}</span>
                            <span className="font-display text-sm font-bold">{day.dayOfMonth}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PASSO 3: ESCOLHA DO HORÁRIO LIVRE DA CADEIRA */}
                  {selectedDateStr && (
                    <div className="border-t border-white/10 pt-5">
                      <label className="block text-xs font-mono uppercase tracking-wider text-brand-gold font-bold mb-2">
                        3. Escolha o Horário Livre de {selectedBarber}:
                      </label>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTimeSlot === slot;
                          // Validação estrita por cadeira/barbeiro
                          const isTaken = appointments.some(
                            (a) =>
                              a.date === selectedDateStr &&
                              a.timeSlot === slot &&
                              a.barberName === selectedBarber &&
                              a.status === 'confirmed'
                          );

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isTaken}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-2 rounded text-xs font-mono font-bold transition ${
                                isSelected
                                  ? 'bg-brand-gold text-brand-black'
                                  : isTaken
                                  ? 'bg-red-950/30 text-red-400/40 border border-red-500/20 line-through cursor-not-allowed'
                                  : 'border border-white/10 bg-black/60 text-brand-cream hover:border-brand-gold hover:text-brand-gold'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PASSO 4: OBSERVAÇÕES & SUBMIT */}
                  {selectedTimeSlot && (
                    <div className="border-t border-white/10 pt-5 space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-cream/70 mb-1">
                          Observação ou preferência (Opcional)
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ex: Barba alinhada com toalha quente, navalha nova..."
                          className="w-full bg-black/70 border border-white/15 rounded px-3 py-2 text-xs text-brand-cream focus:border-brand-gold focus:outline-none"
                        />
                      </div>

                      {error && (
                        <div className="p-3 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-200">
                          {error}
                        </div>
                      )}

                      <BrandButton
                        type="submit"
                        disabled={bookingLoading}
                        size="full"
                        className="py-3 text-xs uppercase tracking-wider font-bold"
                      >
                        {bookingLoading ? 'Confirmando Horário...' : 'Confirmar Agendamento'}
                      </BrandButton>
                    </div>
                  )}
                </form>
              </div>

              {/* COLUNA LATERAL: HISTÓRICO DE AGENDAMENTOS */}
              <div className="p-6 rounded border border-white/10 bg-[#141414] space-y-4">
                <h3 className="font-display text-xs font-bold uppercase text-brand-cream tracking-wide border-b border-white/10 pb-2">
                  Seus Agendamentos
                </h3>

                {appointments.length === 0 ? (
                  <p className="text-xs text-brand-cream/40 font-mono py-4">
                    Nenhum agendamento ativo. Escolha o barbeiro, o dia e o horário ao lado.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 rounded bg-black/60 border border-white/10 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-brand-gold font-bold">
                            {apt.date} • {apt.timeSlot}
                          </span>
                          <span className="text-[9px] font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded text-brand-cream/70">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-brand-cream font-medium truncate">Profissional: {apt.barberName}</p>
                        {apt.status === 'confirmed' && (
                          <div className="pt-2 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-[11px] font-mono text-red-400 hover:underline"
                            >
                              Cancelar Horário
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 4-GRID DO MANUAL DO ASSINANTE */}
      <SubscriberManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}
