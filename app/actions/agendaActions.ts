'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { AgendaSettings } from '@/types';

/**
 * Retorna as configurações gerais da agenda (horários, intervalos, dias do clube).
 */
export async function getAgendaSettingsAction(): Promise<AgendaSettings> {
  try {
    let settings = await prisma.agendaSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.agendaSettings.create({
        data: {
          id: 'default',
          slotIntervalMinutes: 30,
          openingTime: '08:00',
          closingTime: '19:30',
          allowedClubDays: [1, 2, 3], // Segunda (1), Terça (2), Quarta (3)
          breakTimes: [{ start: '12:00', end: '13:00', label: 'Almoço' }],
        },
      });
    }

    return {
      id: settings.id,
      slotIntervalMinutes: settings.slotIntervalMinutes,
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      allowedClubDays: (settings.allowedClubDays as number[]) || [1, 2, 3],
      breakTimes: (settings.breakTimes as any) || null,
    };
  } catch (error) {
    console.error('Erro ao buscar configurações da agenda:', error);
    return {
      id: 'default',
      slotIntervalMinutes: 30,
      openingTime: '08:00',
      closingTime: '19:30',
      allowedClubDays: [1, 2, 3],
      breakTimes: null,
    };
  }
}

/**
 * Atualiza as configurações gerais da agenda.
 */
export async function updateAgendaSettingsAction(data: {
  slotIntervalMinutes: number;
  openingTime: string;
  closingTime: string;
  allowedClubDays: number[];
  breakTimes?: { start: string; end: string; label?: string }[] | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.agendaSettings.upsert({
      where: { id: 'default' },
      update: {
        slotIntervalMinutes: Math.max(15, Number(data.slotIntervalMinutes)),
        openingTime: data.openingTime.trim(),
        closingTime: data.closingTime.trim(),
        allowedClubDays: data.allowedClubDays,
        breakTimes: data.breakTimes ? (data.breakTimes as any) : undefined,
      },
      create: {
        id: 'default',
        slotIntervalMinutes: Math.max(15, Number(data.slotIntervalMinutes)),
        openingTime: data.openingTime.trim(),
        closingTime: data.closingTime.trim(),
        allowedClubDays: data.allowedClubDays,
        breakTimes: data.breakTimes ? (data.breakTimes as any) : undefined,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/assinante');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar agenda settings:', error);
    return { ok: false, error: 'Falha ao atualizar configurações da agenda.' };
  }
}

/**
 * Gera a lista de horários (HH:mm) entre opening e closing baseado no intervalo.
 */
function generateTimeSlots(openingTime: string, closingTime: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  let currentMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(timeStr);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/**
 * Retorna os slots do dia com informação de ocupação por barbeiro para o assinante e admin.
 */
export async function listDaySlotsAndAvailabilityAction(dateStr: string) {
  try {
    const settings = await getAgendaSettingsAction();
    const barbers = await prisma.barber.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        date: dateStr,
        status: { in: ['confirmed', 'in_progress'] },
      },
    });

    const allSlots = generateTimeSlots(settings.openingTime, settings.closingTime, settings.slotIntervalMinutes);

    const slotDetails = allSlots.map((slot) => {
      // Barbeiros já ocupados neste slot
      const bookedAppointments = appointments.filter((a) => a.timeSlot === slot);
      const bookedBarberIds = new Set(bookedAppointments.map((a) => a.barberId).filter(Boolean));
      const bookedBarberNames = new Set(bookedAppointments.map((a) => a.barberName));

      // Barbeiros disponíveis
      const availableBarbers = barbers.filter(
        (b) => !bookedBarberIds.has(b.id) && !bookedBarberNames.has(b.name)
      );

      const isFullyBooked = availableBarbers.length === 0;

      return {
        slot,
        isFullyBooked,
        availableBarberCount: availableBarbers.length,
        availableBarbers: availableBarbers.map((b) => ({ id: b.id, name: b.name })),
        bookedAppointments: bookedAppointments.map((a) => ({
          id: a.id,
          customerName: a.customerName,
          barberName: a.barberName,
          barberId: a.barberId,
          serviceType: a.serviceType,
        })),
      };
    });

    return {
      settings,
      barbers: barbers.map((b) => ({
        id: b.id,
        name: b.name,
        role: b.role,
        photoUrl: b.photoUrl,
      })),
      slotDetails,
    };
  } catch (error) {
    console.error('Erro ao listar disponibilidade do dia:', error);
    return {
      settings: {
        id: 'default',
        slotIntervalMinutes: 30,
        openingTime: '08:00',
        closingTime: '19:30',
        allowedClubDays: [1, 2, 3],
        breakTimes: null,
      },
      barbers: [],
      slotDetails: [],
    };
  }
}
