'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Barber } from '@/types';

/**
 * Normaliza número de telefone removendo pontuação.
 */
const normalizePhone = (phone?: string | null): string =>
  phone ? phone.replace(/\D/g, '') : '';

/**
 * Lista todos os barbeiros cadastrados no Supabase PostgreSQL.
 * Ordena primeiro os ativos, depois por data de criação.
 */
export async function listBarbersAction(): Promise<Barber[]> {
  try {
    const barbers = await prisma.barber.findMany({
      orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
    });

    return barbers.map((b: any) => ({
      id: b.id,
      name: b.name,
      role: b.role,
      phone: b.phone || null,
      photoUrl: b.photoUrl || null,
      bio: b.bio || null,
      active: b.active,
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao listar barbeiros:', error);
    return [];
  }
}

/**
 * Cria um novo barbeiro no banco de dados.
 */
export async function createBarberAction(data: {
  name: string;
  role?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  active?: boolean;
}): Promise<{ ok: boolean; barber?: Barber; error?: string }> {
  try {
    const nameTrimmed = data.name?.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      return { ok: false, error: 'O nome do barbeiro é obrigatório (mínimo 2 letras).' };
    }

    const newBarber = await prisma.barber.create({
      data: {
        name: nameTrimmed,
        role: data.role?.trim() || 'Barbeiro Profissional',
        phone: data.phone ? normalizePhone(data.phone) : null,
        photoUrl: data.photoUrl?.trim() || null,
        bio: data.bio?.trim() || null,
        active: data.active ?? true,
      } as any,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/barbeiros');
    revalidatePath('/sobre');
    revalidatePath('/assinante');
    revalidatePath('/');

    return {
      ok: true,
      barber: {
        id: newBarber.id,
        name: newBarber.name,
        role: newBarber.role,
        phone: (newBarber as any).phone || null,
        photoUrl: newBarber.photoUrl || null,
        bio: newBarber.bio || null,
        active: newBarber.active,
        createdAt: newBarber.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar barbeiro:', error);
    return { ok: false, error: error?.message || 'Falha ao cadastrar barbeiro.' };
  }
}

/**
 * Atualiza os dados de um barbeiro existente.
 */
export async function updateBarberAction(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    phone: string | null;
    photoUrl: string | null;
    bio: string | null;
    active: boolean;
  }>
): Promise<{ ok: boolean; barber?: Barber; error?: string }> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.role !== undefined) updateData.role = data.role.trim();
    if (data.phone !== undefined) updateData.phone = data.phone ? normalizePhone(data.phone) : null;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl ? data.photoUrl.trim() : null;
    if (data.bio !== undefined) updateData.bio = data.bio ? data.bio.trim() : null;
    if (data.active !== undefined) updateData.active = data.active;

    const updated = await prisma.barber.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/barbeiros');
    revalidatePath('/sobre');
    revalidatePath('/assinante');
    revalidatePath('/');

    return {
      ok: true,
      barber: {
        id: updated.id,
        name: updated.name,
        role: updated.role,
        phone: (updated as any).phone || null,
        photoUrl: updated.photoUrl || null,
        bio: updated.bio || null,
        active: updated.active,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao atualizar barbeiro:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar dados do barbeiro.' };
  }
}

/**
 * Exclui um barbeiro do banco de dados com segurança.
 */
export async function deleteBarberAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.barber.delete({
      where: { id },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/barbeiros');
    revalidatePath('/sobre');
    revalidatePath('/assinante');
    revalidatePath('/');

    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir barbeiro:', error);
    return { ok: false, error: error?.message || 'Falha ao excluir barbeiro.' };
  }
}
