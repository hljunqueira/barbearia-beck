'use server';

import type { Appointment, AppointmentStatus, Subscription, SubscriptionStatus } from '@/types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_SUBSCRIPTIONS,
  getTimeSlotsForDay,
  isAllowedClubDay,
} from '@/lib/data/subscriptions';

declare global {
  var __beck_subscriptions: Subscription[] | undefined;
  var __beck_appointments: Appointment[] | undefined;
}

// Inicializa estado global em memória
if (!global.__beck_subscriptions) {
  global.__beck_subscriptions = [...INITIAL_SUBSCRIPTIONS];
}

if (!global.__beck_appointments) {
  global.__beck_appointments = [...INITIAL_APPOINTMENTS];
}

const getSubscriptionsState = (): Subscription[] => global.__beck_subscriptions!;
const getAppointmentsState = (): Appointment[] => global.__beck_appointments!;

/**
 * Normaliza número de telefone removendo pontuação para comparação.
 */
const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

/**
 * Lista todas as assinaturas (Admin).
 */
export async function listSubscriptions(): Promise<Subscription[]> {
  return [...getSubscriptionsState()];
}

/**
 * Busca assinatura ativa de um cliente por telefone ou e-mail.
 */
export async function findCustomerSubscription(identifier: string): Promise<Subscription | null> {
  const cleanInput = identifier.trim().toLowerCase();
  const cleanPhone = normalizePhone(identifier);
  const subs = getSubscriptionsState();

  const found = subs.find((s) => {
    const matchEmail = s.customerEmail.toLowerCase() === cleanInput;
    const matchPhone = cleanPhone.length >= 8 && normalizePhone(s.customerPhone).includes(cleanPhone);
    return matchEmail || matchPhone;
  });

  return found ?? null;
}

/**
 * Cria ou cadastra manualmente uma nova assinatura (Admin).
 */
export async function createSubscription(data: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  planSlug: 'corte' | 'barba' | 'corte-barba';
  planName: string;
  priceInCents: number;
  status?: SubscriptionStatus;
}): Promise<Subscription> {
  const newSub: Subscription = {
    id: `sub-${Date.now()}`,
    customerName: data.customerName.trim(),
    customerPhone: normalizePhone(data.customerPhone),
    customerEmail: data.customerEmail.trim().toLowerCase(),
    planSlug: data.planSlug,
    planName: data.planName,
    priceInCents: data.priceInCents,
    status: data.status ?? 'active',
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  getSubscriptionsState().unshift(newSub);
  return newSub;
}

/**
 * Atualiza o status de uma assinatura (Admin).
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<{ ok: boolean; error?: string }> {
  const subs = getSubscriptionsState();
  const sub = subs.find((s) => s.id === id);
  if (!sub) return { ok: false, error: 'Assinatura não encontrada' };

  // Atualiza campo
  (sub as any).status = status;
  return { ok: true };
}

/**
 * Lista todos os agendamentos (Admin ou filtrado por assinatura).
 */
export async function listAppointments(subscriptionId?: string): Promise<Appointment[]> {
  const apts = getAppointmentsState();
  if (subscriptionId) {
    return apts.filter((a) => a.subscriptionId === subscriptionId);
  }
  return [...apts];
}

/**
 * Cria um novo agendamento com validação estrita de Segunda a Quarta.
 */
export async function bookAppointment(data: {
  subscriptionId: string;
  customerName: string;
  customerPhone: string;
  planName: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  notes?: string;
}): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  // Validar assinatura
  const subs = getSubscriptionsState();
  const sub = subs.find((s) => s.id === data.subscriptionId);
  if (!sub) {
    return { ok: false, error: 'Assinatura não identificada.' };
  }

  if (sub.status !== 'active') {
    return {
      ok: false,
      error: 'Sua assinatura não está ativa. Fale com a recepção da barbearia.',
    };
  }

  // Validação da data: parse UTC seguro
  const [year, month, day] = data.date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  // Regra fundamental: Apenas Segunda (1), Terça (2) ou Quarta (3)
  if (!isAllowedClubDay(targetDate)) {
    return {
      ok: false,
      error: 'Os agendamentos do Clube da Barba são permitidos exclusivamente de segunda a quarta-feira.',
    };
  }

  // Validação de horário para o dia
  const validSlots = getTimeSlotsForDay(targetDate);
  if (!validSlots.includes(data.timeSlot)) {
    return {
      ok: false,
      error: `Horário ${data.timeSlot} inválido para este dia de atendimento.`,
    };
  }

  // Verificar se o horário já está ocupado por outro cliente
  const apts = getAppointmentsState();
  const isOccupied = apts.some(
    (a) => a.date === data.date && a.timeSlot === data.timeSlot && a.status === 'confirmed',
  );

  if (isOccupied) {
    return {
      ok: false,
      error: 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro.',
    };
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    subscriptionId: sub.id,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    planName: data.planName,
    serviceType: data.serviceType,
    date: data.date,
    timeSlot: data.timeSlot,
    status: 'confirmed',
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  apts.unshift(newAppointment);
  return { ok: true, appointment: newAppointment };
}

/**
 * Cria um novo agendamento diretamente pela Agenda da Barbearia (Admin/Recepção).
 * Suporta clientes assinantes e clientes avulsos, qualquer barbeiro e dia da semana.
 */
export async function createAdminAppointment(data: {
  customerName: string;
  customerPhone: string;
  serviceType: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  subscriptionId?: string | null;
  planName?: string;
  priceInCents?: number;
  durationMinutes?: number;
  notes?: string;
  status?: AppointmentStatus;
}): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  const apts = getAppointmentsState();

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    subscriptionId: data.subscriptionId ?? null,
    customerName: data.customerName.trim(),
    customerPhone: normalizePhone(data.customerPhone),
    planName: data.planName ?? 'Avulso',
    serviceType: data.serviceType,
    barberName: data.barberName || 'Henrique Becker',
    priceInCents: data.priceInCents ?? 3500,
    durationMinutes: data.durationMinutes ?? 30,
    date: data.date,
    timeSlot: data.timeSlot,
    status: data.status ?? 'confirmed',
    notes: data.notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  apts.unshift(newAppointment);
  return { ok: true, appointment: newAppointment };
}

/**
 * Atualiza os dados completos de um agendamento (Remarcar / Editar).
 */
export async function updateAppointmentDetails(
  id: string,
  data: Partial<Omit<Appointment, 'id' | 'createdAt'>>,
): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  const apts = getAppointmentsState();
  const index = apts.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: 'Agendamento não encontrado.' };

  const current = apts[index];
  const updated: Appointment = {
    ...current,
    ...data,
    customerPhone: data.customerPhone ? normalizePhone(data.customerPhone) : current.customerPhone,
  };

  apts[index] = updated;
  return { ok: true, appointment: updated };
}

/**
 * Atualiza o status de um agendamento (concluir, cancelar, em atendimento, confirmar).
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<{ ok: boolean; error?: string }> {
  const apts = getAppointmentsState();
  const apt = apts.find((a) => a.id === id);
  if (!apt) return { ok: false, error: 'Agendamento não encontrado' };

  (apt as any).status = status;
  return { ok: true };
}

/**
 * Exclui permanentemente um agendamento da agenda.
 */
export async function deleteAppointment(id: string): Promise<{ ok: boolean; error?: string }> {
  const apts = getAppointmentsState();
  const index = apts.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: 'Agendamento não encontrado.' };

  apts.splice(index, 1);
  return { ok: true };
}
