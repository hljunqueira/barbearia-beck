'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  Scissors,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';
import type { Appointment, Subscription } from '@/types';
import {
  bookAppointment,
  findCustomerSubscription,
  listAppointments,
  updateAppointmentStatus,
} from '@/app/actions/subscriptionActions';
import { getTimeSlotsForDay, isAllowedClubDay } from '@/lib/data/subscriptions';
import { whatsappLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BrandButton } from '@/components/BrandButton';

export default function AssinantePage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Estado do formulário de agendamento
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Carregar dados salvos no localStorage ou via query param (?phone= ou ?demo=)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryPhone = params.get('phone') || params.get('demo');
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
        setError('Nenhuma assinatura encontrada com esse telefone ou e-mail. Verifique os dados ou fale com a recepção.');
        setSubscription(null);
      } else {
        setSubscription(sub);
        localStorage.setItem('beck_subscriber_phone', phoneOrEmail);
        const apts = await listAppointments(sub.id);
        setAppointments(apts);
      }
    } catch {
      setError('Erro ao verificar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSubscription(null);
    setAppointments([]);
    setBookingSuccess(null);
    localStorage.removeItem('beck_subscriber_phone');
  };

  // Obter lista dos próximos 14 dias para o calendário
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const isAllowed = isAllowedClubDay(d);
    const dayOfWeekName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayOfMonth = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return { date: d, dateStr, isAllowed, dayOfWeekName, dayOfMonth };
  });

  // Slots de horários para a data selecionada
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
    <div className="min-h-screen bg-brand-black font-sans text-brand-cream selection:bg-brand-gold selection:text-brand-black">
      {/* Topo / Header */}
      <header className="border-b border-white/5 bg-brand-graphite/40 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image
              src="/images/logo-removebg-preview.png"
              alt="Beck Barbearia"
              width={48}
              height={42}
              className="object-contain"
            />
            <div>
              <span className="font-display text-sm font-black uppercase tracking-wider text-brand-cream">
                Beck Barbearia
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-gold">
                Clube da Barba
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-display text-xs uppercase tracking-wider text-brand-cream/60 transition-colors hover:text-brand-gold"
            >
              ← Voltar ao Site
            </Link>

            {subscription && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-brand-black/60 px-3 py-1.5 text-xs text-brand-cream/80 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-12 lg:py-16">
        {/* CASO NÃO ESTEJA AUTENTICADO: TELA DE LOGIN */}
        {!subscription ? (
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-brand-gold/30 bg-brand-graphite/80 p-8 shadow-card backdrop-blur-md sm:p-10">
              <div className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-black text-brand-gold shadow-gold">
                  <User className="h-6 w-6" />
                </span>
                <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-brand-cream">
                  Área do Assinante
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-brand-cream/70">
                  Informe o telefone ou e-mail cadastrado na sua assinatura para agendar seus horários.
                </p>
              </div>

              {error && (
                <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(identifier);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
                    Telefone (WhatsApp) ou E-mail
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(48) 99123-4567 ou seu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-white/10 bg-brand-black px-4 py-3 text-sm text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>

                <BrandButton
                  type="submit"
                  variant="gold"
                  size="full"
                  disabled={loading || !identifier.trim()}
                  className="mt-2"
                >
                  {loading ? 'Verificando...' : 'Acessar Meu Painel'}
                </BrandButton>
              </form>

              {/* Contas de Demonstração Rápidas para Teste */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <span className="block text-center text-[10px] font-bold uppercase tracking-widest text-brand-gold/70">
                  Acesso rápido de teste (1-clique)
                </span>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('48991234567');
                      handleLogin('48991234567');
                    }}
                    className="rounded border border-white/5 bg-brand-black/60 px-3 py-2 text-left text-xs transition-colors hover:border-brand-gold/50 hover:bg-brand-black"
                  >
                    <span className="font-bold text-brand-cream">Carlos Eduardo</span> — Corte + Barba
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('48998765432');
                      handleLogin('48998765432');
                    }}
                    className="rounded border border-white/5 bg-brand-black/60 px-3 py-2 text-left text-xs transition-colors hover:border-brand-gold/50 hover:bg-brand-black"
                  >
                    <span className="font-bold text-brand-cream">Rodrigo Silveira</span> — Plano Cabelo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAINEL DO CLIENTE AUTENTICADO */
          <div className="space-y-10">
            {/* Cartão de Identificação do Plano */}
            <div className="relative overflow-hidden rounded-2xl border border-brand-gold/50 bg-gradient-to-r from-brand-graphite via-brand-black to-brand-graphite p-6 shadow-card sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gold-line opacity-20" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
                    Assinante Clube da Barba
                  </span>
                  <h1 className="mt-1 font-display text-2xl font-black uppercase text-brand-cream sm:text-3xl">
                    Olá, {subscription.customerName}
                  </h1>
                  <p className="mt-1 text-xs text-brand-cream/70">
                    Plano atual: <strong className="text-brand-gold">{subscription.planName}</strong> • Renova em{' '}
                    {subscription.nextBillingDate}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 text-xs font-bold uppercase text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Assinatura Ativa
                  </span>
                  <span className="text-[11px] font-medium text-brand-cream/60">
                    Contato: {subscription.customerPhone}
                  </span>
                </div>
              </div>

              {/* Aviso da Regra de Segunda a Quarta */}
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-xs text-brand-cream/90">
                <Clock className="h-5 w-5 shrink-0 text-brand-gold" />
                <span>
                  <strong>Regra do seu plano:</strong> Seus agendamentos são válidos exclusivamente para{' '}
                  <strong className="text-brand-gold">Segunda, Terça ou Quarta-feira</strong>, garantindo
                  atendimento de respeito e sem filas.
                </span>
              </div>
            </div>

            {/* FEEDBACK DE AGENDAMENTO CONCLUÍDO */}
            {bookingSuccess && (
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold uppercase text-brand-cream">
                      Horário Agendado com Sucesso!
                    </h3>
                    <p className="mt-1 text-sm text-brand-cream/80">
                      Seu horário está confirmado para{' '}
                      <strong className="text-brand-gold">
                        {new Date(bookingSuccess.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                        })}
                      </strong>{' '}
                      às <strong className="text-brand-gold">{bookingSuccess.timeSlot}</strong>.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={whatsappLink(
                          `Olá! Sou o assinante ${subscription.customerName} e acabei de agendar meu horário para ${bookingSuccess.date} às ${bookingSuccess.timeSlot}.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-105"
                      >
                        <WhatsAppIcon size={16} className="fill-white" />
                        <span>Avisar Barbeiro no WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setBookingSuccess(null)}
                        className="rounded-md border border-white/20 bg-brand-black/60 px-4 py-2 text-xs font-semibold text-brand-cream/80 hover:text-white"
                      >
                        Agendar Outro Horário
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO PRINCIPAL: AGENDAR NOVO HORÁRIO */}
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-brand-gold/30 bg-brand-graphite/60 p-6 shadow-card sm:p-8">
                  <div className="border-b border-white/10 pb-4">
                    <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                      Passo a Passo
                    </span>
                    <h2 className="mt-1 font-display text-xl font-bold uppercase text-brand-cream">
                      Agendar Horário na Cadeira
                    </h2>
                  </div>

                  <form onSubmit={handleBook} className="mt-6 space-y-6">
                    {/* 1. SELEÇÃO DO DIA */}
                    <div>
                      <label className="block font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                        1. Escolha o dia (Segunda a Quarta):
                      </label>
                      <p className="mt-1 text-xs text-brand-cream/60">
                        Dias de quinta a domingo aparecem bloqueados respeitando a regra oficial do Clube.
                      </p>

                      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
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
                              className={`flex flex-col items-center justify-center rounded-lg p-2.5 transition-all text-center ${
                                isSelected
                                  ? 'border-2 border-brand-gold bg-brand-gold text-brand-black shadow-gold font-bold scale-105'
                                  : day.isAllowed
                                  ? 'border border-white/10 bg-brand-black/80 text-brand-cream hover:border-brand-gold/60 hover:bg-brand-black'
                                  : 'border border-white/5 bg-brand-graphite/20 text-brand-cream/20 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <span className="text-[10px] font-semibold uppercase">{day.dayOfWeekName}</span>
                              <span className="font-display text-sm font-black">{day.dayOfMonth}</span>
                              {!day.isAllowed && (
                                <span className="mt-1 text-[8px] uppercase tracking-tighter text-red-400/60">
                                  Bloqueado
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. SELEÇÃO DO HORÁRIO */}
                    {selectedDateStr && (
                      <div className="border-t border-white/10 pt-6 animate-in fade-in">
                        <label className="block font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                          2. Escolha o horário disponível:
                        </label>
                        <p className="mt-1 text-xs text-brand-cream/60">
                          {new Date(selectedDateStr + 'T12:00:00').getDay() === 1
                            ? 'Segunda-feira: das 14h às 18h30'
                            : 'Terça e Quarta: das 08h às 18h30 (sem fechar ao meio-dia)'}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedTimeSlot === slot;
                            const isTaken = appointments.some(
                              (a) =>
                                a.date === selectedDateStr &&
                                a.timeSlot === slot &&
                                a.status === 'confirmed',
                            );

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isTaken}
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`rounded-md p-2.5 text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-brand-gold text-brand-black shadow-gold scale-105'
                                    : isTaken
                                    ? 'bg-red-950/30 text-red-400/40 border border-red-500/20 line-through cursor-not-allowed'
                                    : 'border border-white/10 bg-brand-black/70 text-brand-cream hover:border-brand-gold hover:text-brand-gold'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. OBSERVAÇÕES */}
                    {selectedTimeSlot && (
                      <div className="border-t border-white/10 pt-6 animate-in fade-in">
                        <label className="block font-display text-xs font-bold uppercase tracking-wider text-brand-cream">
                          3. Observação para o barbeiro (opcional):
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Quero manter a barba mais cheia / Degradê navalhado"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mt-2 w-full rounded-md border border-white/10 bg-brand-black px-4 py-2.5 text-xs text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold focus:outline-none"
                        />

                        <BrandButton
                          type="submit"
                          variant="gold"
                          size="full"
                          disabled={bookingLoading}
                          className="mt-6"
                        >
                          {bookingLoading ? 'Agendando...' : 'Confirmar Agendamento no Clube'}
                        </BrandButton>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* LATERAL: MEUS AGENDAMENTOS */}
              <div>
                <div className="rounded-2xl border border-white/10 bg-brand-graphite/40 p-6 shadow-card">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <CalendarDays className="h-5 w-5 text-brand-gold" />
                    <h3 className="font-display text-base font-bold uppercase text-brand-cream">
                      Meus Agendamentos
                    </h3>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-brand-cream/50">
                      Você ainda não possui horários agendados.
                    </div>
                  ) : (
                    <ul className="mt-4 divide-y divide-white/5">
                      {appointments.map((apt) => (
                        <li key={apt.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-sm font-bold text-brand-cream">
                                {new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                                {' às '}
                                <span className="text-brand-gold">{apt.timeSlot}</span>
                              </p>
                              <p className="text-xs text-brand-cream/60">{apt.serviceType}</p>
                              {apt.notes && (
                                <p className="mt-1 text-[11px] text-brand-cream/40 italic">
                                  &quot;{apt.notes}&quot;
                                </p>
                              )}
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                apt.status === 'confirmed'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                  : apt.status === 'completed'
                                  ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                                  : 'bg-red-950/60 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {apt.status === 'confirmed'
                                ? 'Confirmado'
                                : apt.status === 'completed'
                                ? 'Realizado'
                                : 'Cancelado'}
                            </span>
                          </div>

                          {apt.status === 'confirmed' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="text-[11px] text-red-400 hover:underline"
                              >
                                Cancelar horário
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
