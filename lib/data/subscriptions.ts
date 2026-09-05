import type { Appointment, Subscription } from '@/types';

/**
 * Base inicial de assinantes do Clube da Barba.
 */
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    customerName: 'Carlos Eduardo Ramos',
    customerPhone: '48991234567',
    customerEmail: 'carlos.ramos@gmail.com',
    planSlug: 'corte-barba',
    planName: 'Corte + Barba',
    priceInCents: 15990,
    status: 'active',
    startDate: '2026-02-01',
    nextBillingDate: '2026-03-01',
  },
  {
    id: 'sub-002',
    customerName: 'Rodrigo Silveira',
    customerPhone: '48998765432',
    customerEmail: 'rodrigo.silveira@outlook.com',
    planSlug: 'corte',
    planName: 'Cabelo',
    priceInCents: 9990,
    status: 'active',
    startDate: '2026-02-10',
    nextBillingDate: '2026-03-10',
  },
  {
    id: 'sub-003',
    customerName: 'Marcos Vinicius Lima',
    customerPhone: '48984112233',
    customerEmail: 'marcos.v@hotmail.com',
    planSlug: 'barba',
    planName: 'Barba',
    priceInCents: 8990,
    status: 'active',
    startDate: '2026-01-20',
    nextBillingDate: '2026-02-20',
  },
  {
    id: 'sub-004',
    customerName: 'Lucas Antunes',
    customerPhone: '48996558899',
    customerEmail: 'lucas.antunes@gmail.com',
    planSlug: 'corte-barba',
    planName: 'Corte + Barba',
    priceInCents: 15990,
    status: 'pending',
    startDate: '2026-02-15',
    nextBillingDate: '2026-03-15',
  },
];

/**
 * Profissionais da barbearia.
 */
export const BARBERS = [
  { id: 'barber-1', name: 'Henrique Becker', role: 'Master Barber', initials: 'HB', color: '#D4AF37' },
  { id: 'barber-2', name: 'Matheus Silva', role: 'Especialista Fade', initials: 'MS', color: '#60A5FA' },
  { id: 'barber-3', name: 'Lucas Antunes', role: 'Barboterapia', initials: 'LA', color: '#34D399' },
] as const;

/**
 * Agendamentos da grade semanal da barbearia.
 * Inclui membros do Clube da Barba e clientes avulsos.
 */
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    subscriptionId: 'sub-001',
    customerName: 'Carlos Eduardo Ramos',
    customerPhone: '48991234567',
    planName: 'Corte + Barba',
    serviceType: 'Corte + Barba Completo',
    barberName: 'Henrique Becker',
    priceInCents: 0, // Plano Clube
    durationMinutes: 60,
    date: '2026-09-07', // Segunda-feira
    timeSlot: '15:00',
    status: 'confirmed',
    notes: 'Toalha quente caprichada e acabamento com navalha.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'apt-002',
    subscriptionId: 'sub-002',
    customerName: 'Rodrigo Silveira',
    customerPhone: '48998765432',
    planName: 'Cabelo',
    serviceType: 'Corte Degradê',
    barberName: 'Matheus Silva',
    priceInCents: 0, // Plano Clube
    durationMinutes: 45,
    date: '2026-09-08', // Terça-feira
    timeSlot: '10:30',
    status: 'in_progress',
    notes: 'Degradê baixo na navalha, tesoura em cima.',
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'apt-003',
    subscriptionId: 'sub-003',
    customerName: 'Marcos Vinicius Lima',
    customerPhone: '48984112233',
    planName: 'Barba',
    serviceType: 'Barba Terapia',
    barberName: 'Lucas Antunes',
    priceInCents: 0, // Plano Clube
    durationMinutes: 30,
    date: '2026-09-09', // Quarta-feira
    timeSlot: '16:00',
    status: 'confirmed',
    notes: 'Alinhamento com lâmina e balm refrescante.',
    createdAt: '2026-09-03T11:20:00Z',
  },
  {
    id: 'apt-004',
    subscriptionId: null,
    customerName: 'Gabriel Oliveira',
    customerPhone: '48991882233',
    planName: 'Avulso',
    serviceType: 'Corte Degradê',
    barberName: 'Henrique Becker',
    priceInCents: 3500,
    durationMinutes: 40,
    date: '2026-09-07', // Segunda-feira
    timeSlot: '16:30',
    status: 'completed',
    notes: 'Cliente novo. Indicação de amigos.',
    createdAt: '2026-09-04T09:15:00Z',
  },
  {
    id: 'apt-005',
    subscriptionId: null,
    customerName: 'Bruno Henrique',
    customerPhone: '48988554411',
    planName: 'Avulso',
    serviceType: 'Platinado / Nevou',
    barberName: 'Matheus Silva',
    priceInCents: 13000,
    durationMinutes: 90,
    date: '2026-09-10', // Quinta-feira
    timeSlot: '14:00',
    status: 'confirmed',
    notes: 'Descoloração total e matização acinzentada.',
    createdAt: '2026-09-04T15:00:00Z',
  },
  {
    id: 'apt-006',
    subscriptionId: null,
    customerName: 'Felipe Santana',
    customerPhone: '48999114477',
    planName: 'Avulso',
    serviceType: 'Corte + Barba',
    barberName: 'Henrique Becker',
    priceInCents: 6000,
    durationMinutes: 60,
    date: '2026-09-11', // Sexta-feira
    timeSlot: '17:00',
    status: 'confirmed',
    notes: 'Preparação para casamento no fim de semana.',
    createdAt: '2026-09-05T08:30:00Z',
  },
  {
    id: 'apt-007',
    subscriptionId: null,
    customerName: 'Thiago Mendes',
    customerPhone: '48984227788',
    planName: 'Avulso',
    serviceType: 'Corte',
    barberName: 'Lucas Antunes',
    priceInCents: 3500,
    durationMinutes: 30,
    date: '2026-09-12', // Sábado
    timeSlot: '11:00',
    status: 'confirmed',
    notes: 'Corte tradicional social.',
    createdAt: '2026-09-05T12:00:00Z',
  },
];

/**
 * Regra do Clube: agendamentos permitidos SOMENTE de Segunda (1) a Quarta (3).
 * Quinta (4), Sexta (5), Sábado (6) e Domingo (0) são bloqueados.
 */
export const isAllowedClubDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 3;
};

/**
 * Retorna os horários disponíveis para agendamento de acordo com o dia.
 * - Segunda: 14:00 às 18:30 (abre às 14h)
 * - Terça e Quarta: 08:00 às 18:30 (sem fechar ao meio-dia)
 */
export const getTimeSlotsForDay = (date: Date): string[] => {
  const day = date.getDay();

  if (day === 1) {
    // Segunda-feira
    return [
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30',
    ];
  }

  if (day === 2 || day === 3) {
    // Terça ou Quarta-feira
    return [
      '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30',
    ];
  }

  return [];
};
