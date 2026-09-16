'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Service } from '@/types';

/**
 * Server Actions para gerenciamento de Serviços da Beck Barbearia.
 * Persistência direta no Supabase PostgreSQL via Prisma.
 */

export async function listAdminServices(): Promise<Service[]> {
  try {
    const services = await prisma.service.findMany({
      orderBy: { priceInCents: 'asc' },
    });

    return services.map((s: any) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      priceInCents: s.priceInCents,
      durationMinutes: s.durationMinutes,
      icon: s.icon || undefined,
      popular: s.popular,
      badge: s.badge || undefined,
      image: s.image || undefined,
    }));
  } catch (error) {
    console.error('Erro ao listar serviços admin:', error);
    return [];
  }
}

export async function createService(data: {
  name: string;
  category?: string;
  description: string;
  priceInCents: number;
  durationMinutes: number;
  popular?: boolean;
  badge?: string;
  image?: string;
}): Promise<{ ok: boolean; service?: Service; error?: string }> {
  try {
    const slugBase = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const newService = await prisma.service.create({
      data: {
        slug,
        name: data.name.trim(),
        category: data.category || 'corte',
        description: data.description.trim(),
        priceInCents: Math.round(data.priceInCents),
        durationMinutes: Number(data.durationMinutes) || 30,
        popular: data.popular ?? false,
        badge: data.badge?.trim() || null,
        image: data.image?.trim() || null,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ok: true,
      service: {
        id: newService.id,
        slug: newService.slug,
        name: newService.name,
        description: newService.description,
        priceInCents: newService.priceInCents,
        durationMinutes: newService.durationMinutes,
        popular: newService.popular,
        badge: newService.badge || undefined,
        image: newService.image || undefined,
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar serviço:', error);
    return { ok: false, error: error?.message || 'Falha ao cadastrar serviço no banco de dados.' };
  }
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    category?: string;
    description?: string;
    priceInCents?: number;
    durationMinutes?: number;
    popular?: boolean;
    badge?: string | null;
    image?: string | null;
  },
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.category && { category: data.category }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.priceInCents !== undefined && { priceInCents: Math.round(data.priceInCents) }),
        ...(data.durationMinutes !== undefined && { durationMinutes: Number(data.durationMinutes) }),
        ...(data.popular !== undefined && { popular: data.popular }),
        ...(data.badge !== undefined && { badge: data.badge ? data.badge.trim() : null }),
        ...(data.image !== undefined && { image: data.image ? data.image.trim() : null }),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar serviço:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar serviço.' };
  }
}

export async function deleteService(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir serviço:', error);
    return { ok: false, error: error?.message || 'Falha ao excluir serviço.' };
  }
}
