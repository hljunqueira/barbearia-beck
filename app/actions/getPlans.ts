'use server';

import type { Plan, PlanRule } from '@/types';
import { plansRepository } from '@/lib/repositories';
import { PLAN_VALIDITY_NOTICE } from '@/lib/data/plans';

/**
 * Server Action — Clube da Barba
 *
 * Retorna os planos de assinatura persistidos no Supabase PostgreSQL via Prisma.
 */
export async function getPlans(): Promise<Plan[]> {
  const plans = await plansRepository.list();

  return [...plans].sort((a, b) => a.priceInCents - b.priceInCents);
}

export async function getPlanBySlug(slug: Plan['slug']): Promise<Plan | null> {
  return plansRepository.findBySlug(slug);
}

/** Regras do Clube ("Como funciona") + aviso de validade (segunda a quarta). */
export async function getPlanRules(): Promise<{
  rules: PlanRule[];
  notice: { title: string; text: string };
}> {
  const rules = await plansRepository.rules();

  return { rules: [...rules], notice: { ...PLAN_VALIDITY_NOTICE } };
}
