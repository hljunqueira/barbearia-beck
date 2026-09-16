'use server';

import type { Appointment, AppointmentStatus, Subscription, SubscriptionStatus } from '@/types';
import { prisma } from '@/lib/prisma';
import { getTimeSlotsForDay, isAllowedClubDay } from '@/lib/data/subscriptions';
import { revalidatePath } from 'next/cache';

/**
 * Normaliza número de telefone removendo pontuação para comparação.
 */
const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

/**
 * Lista todas as assinaturas reais da Beck Barbearia no Supabase PostgreSQL.
 */
export async function listSubscriptions(): Promise<Subscription[]> {
  try {
    const subs = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return subs.map((s: any) => ({
      id: s.id,
      customerName: s.customerName,
      customerPhone: s.customerPhone ?? '',
      customerEmail: s.customerEmail,
      planSlug: s.planSlug as any,
      planName: s.planName,
      priceInCents: s.priceInCents,
      status: s.status as SubscriptionStatus,
      startDate: s.startDate,
      nextBillingDate: s.nextBillingDate,
    }));
  } catch (error) {
    console.error('Erro ao listar assinaturas:', error);
    return [];
  }
}

/**
 * Busca assinatura ativa de um cliente por telefone ou e-mail no PostgreSQL.
 */
export async function findCustomerSubscription(identifier: string): Promise<Subscription | null> {
  try {
    const cleanInput = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhone(identifier);

    const sub: any = await prisma.subscription.findFirst({
      where: {
        OR: [
          { customerEmail: { equals: cleanInput, mode: 'insensitive' } },
          { customerPhone: { contains: cleanPhone } },
        ],
      },
    });

    if (!sub) return null;

    return {
      id: sub.id,
      customerName: sub.customerName,
      customerPhone: sub.customerPhone ?? '',
      customerEmail: sub.customerEmail,
      planSlug: sub.planSlug as any,
      planName: sub.planName,
      priceInCents: sub.priceInCents,
      status: sub.status as SubscriptionStatus,
      startDate: sub.startDate,
      nextBillingDate: sub.nextBillingDate,
    };
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return null;
  }
}

/**
 * Cria uma nova assinatura no Supabase PostgreSQL.
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
  const plan = await prisma.plan.findUnique({
    where: { slug: data.planSlug },
  });

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newSub: any = await prisma.subscription.create({
    data: {
      customerName: data.customerName.trim(),
      customerPhone: normalizePhone(data.customerPhone),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      planSlug: data.planSlug,
      planName: data.planName,
      priceInCents: data.priceInCents,
      status: data.status ?? 'active',
      startDate: now.toISOString().split('T')[0],
      nextBillingDate: nextMonth.toISOString().split('T')[0],
      planId: plan?.id ?? undefined,
    },
  });

  revalidatePath('/admin');
  return {
    id: newSub.id,
    customerName: newSub.customerName,
    customerPhone: newSub.customerPhone ?? '',
    customerEmail: newSub.customerEmail,
    planSlug: newSub.planSlug as any,
    planName: newSub.planName,
    priceInCents: newSub.priceInCents,
    status: newSub.status as SubscriptionStatus,
    startDate: newSub.startDate,
    nextBillingDate: newSub.nextBillingDate,
  };
}

/**
 * Cadastro direto pelo Portal do Assinante (/assinante).
 * Exige Nome e Telefone obrigatórios e faz o auto-login.
 */
export async function registerCustomerSubscriptionAction(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planSlug?: 'corte' | 'barba' | 'corte-barba';
}): Promise<{ ok: boolean; subscription?: Subscription; error?: string }> {
  try {
    const rawName = (data.customerName || '').trim();
    const rawPhone = normalizePhone(data.customerPhone || '');

    if (!rawName || rawName.length < 3) {
      return { ok: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
    }

    if (!rawPhone || rawPhone.length < 10) {
      return { ok: false, error: 'Por favor, informe um telefone/WhatsApp válido com DDD.' };
    }

    const planSlug = data.planSlug || 'corte-barba';
    const planNames: Record<string, { name: string; price: number }> = {
      'corte': { name: 'Plano Cabelo', price: 9990 },
      'barba': { name: 'Plano Barba', price: 8990 },
      'corte-barba': { name: 'Corte + Barba', price: 15990 },
    };
    const planInfo = planNames[planSlug] || planNames['corte-barba'];

    const email = data.customerEmail?.trim().toLowerCase() || `${rawPhone}@cliente.beckbarbearia.com.br`;

    // Verifica se já existe cliente com esse telefone
    const existing = await prisma.subscription.findFirst({
      where: { customerPhone: { contains: rawPhone } },
    });

    if (existing) {
      // Retorna a assinatura já existente
      return {
        ok: true,
        subscription: {
          id: existing.id,
          customerName: existing.customerName,
          customerPhone: existing.customerPhone,
          customerEmail: existing.customerEmail,
          planSlug: existing.planSlug as any,
          planName: existing.planName,
          priceInCents: existing.priceInCents,
          status: existing.status as SubscriptionStatus,
          startDate: existing.startDate,
          nextBillingDate: existing.nextBillingDate,
        },
      };
    }

    const sub = await createSubscription({
      customerName: rawName,
      customerPhone: rawPhone,
      customerEmail: email,
      planSlug,
      planName: planInfo.name,
      priceInCents: planInfo.price,
      status: 'active',
    });

    return { ok: true, subscription: sub };
  } catch (error: any) {
    console.error('Erro no cadastro do assinante:', error);
    return { ok: false, error: error?.message || 'Falha ao registrar cadastro. Tente novamente.' };
  }
}

/**
 * Atualiza todos os dados cadastrais de uma assinatura (Admin).
 */
export async function updateSubscriptionDetails(
  id: string,
  data: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    planSlug?: 'corte' | 'barba' | 'corte-barba';
    status?: SubscriptionStatus;
    nextBillingDate?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (data.customerName?.trim()) updateData.customerName = data.customerName.trim();
    if (data.customerPhone?.trim()) updateData.customerPhone = normalizePhone(data.customerPhone);
    if (data.customerEmail?.trim()) updateData.customerEmail = data.customerEmail.trim().toLowerCase();
    if (data.status) updateData.status = data.status;
    if (data.nextBillingDate) updateData.nextBillingDate = data.nextBillingDate;

    if (data.planSlug) {
      updateData.planSlug = data.planSlug;
      const planNames: Record<string, { name: string; price: number }> = {
        'corte': { name: 'Cabelo', price: 9990 },
        'barba': { name: 'Barba', price: 8990 },
        'corte-barba': { name: 'Corte + Barba', price: 15990 },
      };
      if (planNames[data.planSlug]) {
        updateData.planName = planNames[data.planSlug].name;
        updateData.priceInCents = planNames[data.planSlug].price;
      }
    }

    await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin');
    revalidatePath('/assinante');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar assinatura:', error);
    return { ok: false, error: 'Falha ao atualizar dados do cliente.' };
  }
}

/**
 * Exclui uma assinatura do banco de dados com segurança.
 */
export async function deleteSubscriptionAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.subscription.delete({
      where: { id },
    });

    revalidatePath('/admin');
    revalidatePath('/assinante');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir assinatura:', error);
    return { ok: false, error: 'Falha ao excluir assinatura do cliente.' };
  }
}

/**
 * Atualiza o status de uma assinatura no PostgreSQL.
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.subscription.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar status da assinatura:', error);
    return { ok: false, error: 'Assinatura não encontrada' };
  }
}


/**
 * Lista todos os agendamentos reais (Admin ou filtrado por assinatura).
 */
export async function listAppointments(subscriptionId?: string): Promise<Appointment[]> {
  try {
    const apts = await prisma.appointment.findMany({
      where: subscriptionId ? { subscriptionId } : undefined,
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    return apts.map((a: any) => ({
      id: a.id,
      subscriptionId: a.subscriptionId,
      customerName: a.customerName,
      customerPhone: a.customerPhone ?? '',
      planName: a.planName || undefined,
      serviceType: a.serviceType,
      barberName: a.barberName,
      priceInCents: a.priceInCents,
      durationMinutes: a.durationMinutes,
      date: a.date,
      timeSlot: a.timeSlot,
      status: a.status as AppointmentStatus,
      notes: a.notes || undefined,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return [];
  }
}

/**
 * Cria um novo agendamento do assinante com validação estrita de Segunda a Quarta.
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
  barberName?: string;
  barberId?: string;
}): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  try {
    // Validar assinatura no banco
    const sub = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
    });

    if (!sub) {
      return { ok: false, error: 'Assinatura não identificada.' };
    }

    if (sub.status !== 'active') {
      return {
        ok: false,
        error: 'Sua assinatura não está ativa. Fale com a recepção da barbearia.',
      };
    }

    // Validação da data: apenas Segunda (1), Terça (2) ou Quarta (3)
    const [year, month, day] = data.date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);

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

    // Verificar se o horário já está ocupado no PostgreSQL
    const occupied = await prisma.appointment.findFirst({
      where: {
        date: data.date,
        timeSlot: data.timeSlot,
        status: { in: ['confirmed', 'in_progress'] },
      },
    });

    if (occupied) {
      return {
        ok: false,
        error: 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro.',
      };
    }

    const newApt = await prisma.appointment.create({
      data: {
        subscriptionId: sub.id,
        customerName: data.customerName.trim(),
        customerPhone: normalizePhone(data.customerPhone),
        planName: data.planName,
        serviceType: data.serviceType,
        barberName: data.barberName?.trim() || 'Barbeiro da Equipe',
        barberId: data.barberId || null,
        date: data.date,
        timeSlot: data.timeSlot,
        status: 'confirmed',
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/assinante');

    return {
      ok: true,
      appointment: {
        id: newApt.id,
        subscriptionId: newApt.subscriptionId,
        customerName: newApt.customerName,
        customerPhone: newApt.customerPhone,
        planName: newApt.planName || undefined,
        serviceType: newApt.serviceType,
        barberName: newApt.barberName,
        priceInCents: newApt.priceInCents,
        durationMinutes: newApt.durationMinutes,
        date: newApt.date,
        timeSlot: newApt.timeSlot,
        status: newApt.status as AppointmentStatus,
        notes: newApt.notes || undefined,
        createdAt: newApt.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao agendar horário:', error);
    return { ok: false, error: 'Erro interno ao realizar agendamento.' };
  }
}

/**
 * Cria um novo agendamento diretamente pela Agenda da Barbearia (Admin/Recepção).
 */
export async function createAdminAppointment(data: {
  customerName: string;
  customerPhone: string;
  serviceType: string;
  barberName?: string;
  barberId?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  subscriptionId?: string | null;
  planName?: string;
  priceInCents?: number;
  durationMinutes?: number;
  notes?: string;
  status?: AppointmentStatus;
}): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  try {
    const newApt = await prisma.appointment.create({
      data: {
        subscriptionId: data.subscriptionId ?? null,
        customerName: data.customerName.trim(),
        customerPhone: normalizePhone(data.customerPhone),
        planName: data.planName ?? 'Avulso',
        serviceType: data.serviceType,
        barberName: data.barberName?.trim() || 'Barbeiro da Equipe',
        barberId: data.barberId || null,
        priceInCents: data.priceInCents ?? 3500,
        durationMinutes: data.durationMinutes ?? 30,
        date: data.date,
        timeSlot: data.timeSlot,
        status: data.status ?? 'confirmed',
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath('/admin');
    return {
      ok: true,
      appointment: {
        id: newApt.id,
        subscriptionId: newApt.subscriptionId,
        customerName: newApt.customerName,
        customerPhone: newApt.customerPhone,
        planName: newApt.planName || undefined,
        serviceType: newApt.serviceType,
        barberName: newApt.barberName,
        priceInCents: newApt.priceInCents,
        durationMinutes: newApt.durationMinutes,
        date: newApt.date,
        timeSlot: newApt.timeSlot,
        status: newApt.status as AppointmentStatus,
        notes: newApt.notes || undefined,
        createdAt: newApt.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar agendamento admin:', error);
    return { ok: false, error: 'Falha ao salvar agendamento.' };
  }
}

/**
 * Atualiza os dados completos de um agendamento.
 */
export async function updateAppointmentDetails(
  id: string,
  data: Partial<Omit<Appointment, 'id' | 'createdAt'>>,
): Promise<{ ok: boolean; appointment?: Appointment; error?: string }> {
  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        customerName: data.customerName?.trim(),
        customerPhone: data.customerPhone ? normalizePhone(data.customerPhone) : undefined,
        planName: data.planName,
        serviceType: data.serviceType,
        barberName: data.barberName,
        priceInCents: data.priceInCents,
        durationMinutes: data.durationMinutes,
        date: data.date,
        timeSlot: data.timeSlot,
        status: data.status,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath('/admin');
    return {
      ok: true,
      appointment: {
        id: updated.id,
        subscriptionId: updated.subscriptionId,
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        planName: updated.planName || undefined,
        serviceType: updated.serviceType,
        barberName: updated.barberName,
        priceInCents: updated.priceInCents,
        durationMinutes: updated.durationMinutes,
        date: updated.date,
        timeSlot: updated.timeSlot,
        status: updated.status as AppointmentStatus,
        notes: updated.notes || undefined,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao atualizar agendamento:', error);
    return { ok: false, error: 'Falha ao atualizar agendamento.' };
  }
}

/**
 * Atualiza o status de um agendamento.
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar status do agendamento:', error);
    return { ok: false, error: 'Agendamento não encontrado' };
  }
}

/**
 * Exclui um agendamento do banco de dados.
 */
export async function deleteAppointment(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir agendamento:', error);
    return { ok: false, error: 'Falha ao excluir agendamento.' };
  }
}
