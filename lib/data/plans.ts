import type { Plan, PlanRule } from '@/types';

/**
 * Planos mensais do Clube da Barba — valores oficiais do flyer.
 * Fonte temporária até a integração com Prisma (prisma.plan.findMany) ou API karfex.
 */
export const MOCK_PLANS: readonly Plan[] = [
  {
    id: '0f6c1d2e-3a4b-4c5d-8e6f-1a2b3c4d5e01',
    slug: 'barba',
    name: 'Barbas Ilimitadas',
    tagline: 'Barba sempre alinhada, quantas vezes precisar.',
    priceInCents: 6990,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: [
      { label: 'Barbas ilimitadas por 30 dias', included: true },
      { label: 'Acabamento com navalha', included: true },
      { label: 'Atendimento prioritário', included: true },
      { label: 'Condições exclusivas em produtos', included: true },
      { label: 'Cortes de cabelo', included: false },
    ],
    highlighted: false,
    badge: null,
    karfexPlanId: null,
  },
  {
    id: '0f6c1d2e-3a4b-4c5d-8e6f-1a2b3c4d5e02',
    slug: 'corte',
    name: 'Cortes Ilimitados',
    tagline: 'Corte novo toda semana, sem pensar no preço.',
    priceInCents: 7990,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: [
      { label: 'Cortes ilimitados por 30 dias', included: true },
      { label: 'Acabamento com navalha', included: true },
      { label: 'Atendimento prioritário', included: true },
      { label: 'Condições exclusivas em produtos', included: true },
      { label: 'Barba', included: false },
    ],
    highlighted: false,
    badge: null,
    karfexPlanId: null,
  },
  {
    id: '0f6c1d2e-3a4b-4c5d-8e6f-1a2b3c4d5e03',
    slug: 'corte-barba',
    name: 'Cortes + Barba Ilimitados',
    tagline: 'O combo completo. Economia máxima todo mês.',
    priceInCents: 14990,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: [
      { label: 'Cortes ilimitados por 30 dias', included: true },
      { label: 'Barbas ilimitadas por 30 dias', included: true },
      { label: 'Acabamento com navalha', included: true },
      { label: 'Atendimento prioritário', included: true },
      { label: 'Condições exclusivas em produtos', included: true },
    ],
    highlighted: true,
    badge: 'Mais completo',
    karfexPlanId: null,
  },
];

/** Regras de funcionamento do Clube da Barba (flyer "Como funciona"). */
export const PLAN_RULES: readonly PlanRule[] = [
  {
    id: 'validade-30-dias',
    icon: 'calendar',
    title: 'Pacote válido por 30 dias',
    description: 'A contagem começa na data do pagamento.',
  },
  {
    id: 'pagamento-antecipado',
    icon: 'payment',
    title: 'Pagamento antecipado',
    description: 'O plano é ativado após a confirmação do pagamento.',
  },
  {
    id: 'nao-transferivel',
    icon: 'lock',
    title: 'Não transferível',
    description: 'Uso pessoal e exclusivo do assinante.',
  },
  {
    id: 'segunda-a-quarta',
    icon: 'weekdays',
    title: 'Válido de segunda a quarta-feira',
    description: 'Os atendimentos do plano acontecem somente nesses dias.',
  },
];

/** Aviso em destaque (flyer "Validade"). */
export const PLAN_VALIDITY_NOTICE = {
  title: 'Validade',
  text: 'Somente de segunda-feira a quarta-feira!',
} as const;
