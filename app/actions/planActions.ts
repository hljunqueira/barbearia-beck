'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Plan, PlanFeature } from '@/types';

/**
 * Server Actions para gerenciamento dos Planos Mensais do Clube da Barba.
 * Persistência direta no Supabase PostgreSQL via Prisma.
 */

export async function listAdminPlans(): Promise<Plan[]> {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { priceInCents: 'asc' },
    });

    return plans.map((p: any) => ({
      id: p.id,
      slug: p.slug as Plan['slug'],
      name: p.name,
      tagline: p.tagline,
      priceInCents: p.priceInCents,
      currency: (p.currency as Plan['currency']) || 'BRL',
      billingCycle: (p.billingCycle as Plan['billingCycle']) || 'monthly',
      features: (p.features as unknown as PlanFeature[]) || [],
      highlighted: p.highlighted,
      badge: p.badge || null,
    }));
  } catch (error) {
    console.error('Erro ao listar planos admin:', error);
    return [];
  }
}

export async function createPlan(data: {
  name: string;
  tagline: string;
  priceInCents: number;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}): Promise<{ ok: boolean; plan?: Plan; error?: string }> {
  try {
    const slugBase = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const newPlan = await prisma.plan.create({
      data: {
        slug,
        name: data.name.trim(),
        tagline: data.tagline.trim(),
        priceInCents: Math.round(data.priceInCents),
        currency: 'BRL',
        billingCycle: 'monthly',
        features: data.features as any,
        highlighted: data.highlighted ?? false,
        badge: data.badge ? data.badge.trim() : null,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ok: true,
      plan: {
        id: newPlan.id,
        slug: newPlan.slug as Plan['slug'],
        name: newPlan.name,
        tagline: newPlan.tagline,
        priceInCents: newPlan.priceInCents,
        currency: newPlan.currency as Plan['currency'],
        billingCycle: newPlan.billingCycle as Plan['billingCycle'],
        features: (newPlan.features as unknown as PlanFeature[]) || [],
        highlighted: newPlan.highlighted,
        badge: newPlan.badge || null,
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar plano:', error);
    return { ok: false, error: error?.message || 'Falha ao cadastrar plano no banco de dados.' };
  }
}

export async function updatePlan(
  id: string,
  data: {
    name?: string;
    tagline?: string;
    priceInCents?: number;
    features?: PlanFeature[];
    highlighted?: boolean;
    badge?: string | null;
  },
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.plan.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.tagline !== undefined && { tagline: data.tagline.trim() }),
        ...(data.priceInCents !== undefined && { priceInCents: Math.round(data.priceInCents) }),
        ...(data.features !== undefined && { features: data.features as any }),
        ...(data.highlighted !== undefined && { highlighted: data.highlighted }),
        ...(data.badge !== undefined && { badge: data.badge ? data.badge.trim() : null }),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar plano.' };
  }
}

export async function deletePlan(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.plan.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir plano:', error);
    return { ok: false, error: error?.message || 'Falha ao excluir plano.' };
  }
}
