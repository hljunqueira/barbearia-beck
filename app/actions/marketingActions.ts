'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Coupon, PromotionCampaign } from '@/types';

/**
 * Lista todos os cupons cadastrados.
 */
export async function listCouponsAction(): Promise<Coupon[]> {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map((c: any) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType as 'percentage' | 'fixed',
      discountValue: c.discountValue,
      validUntil: c.validUntil,
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      active: c.active,
      createdAt: c.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    return [];
  }
}

/**
 * Cria um novo cupom de desconto.
 */
export async function createCouponAction(data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil?: string | null;
  maxUses?: number | null;
  active?: boolean;
}): Promise<{ ok: boolean; coupon?: Coupon; error?: string }> {
  try {
    const codeNormalized = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!codeNormalized || codeNormalized.length < 3) {
      return { ok: false, error: 'O código do cupom deve ter pelo menos 3 caracteres alfanuméricos.' };
    }

    if (data.discountValue <= 0) {
      return { ok: false, error: 'O valor de desconto deve ser maior que zero.' };
    }

    // Verificar se código já existe
    const existing = await prisma.coupon.findUnique({
      where: { code: codeNormalized },
    });
    if (existing) {
      return { ok: false, error: `O cupom "${codeNormalized}" já existe no sistema.` };
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: codeNormalized,
        discountType: data.discountType,
        discountValue: Math.round(data.discountValue),
        validUntil: data.validUntil?.trim() || null,
        maxUses: data.maxUses !== undefined && data.maxUses !== null ? Number(data.maxUses) : null,
        active: data.active ?? true,
      },
    });

    revalidatePath('/admin');
    return {
      ok: true,
      coupon: {
        id: newCoupon.id,
        code: newCoupon.code,
        discountType: newCoupon.discountType as 'percentage' | 'fixed',
        discountValue: newCoupon.discountValue,
        validUntil: newCoupon.validUntil,
        maxUses: newCoupon.maxUses,
        usedCount: newCoupon.usedCount,
        active: newCoupon.active,
        createdAt: newCoupon.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar cupom:', error);
    return { ok: false, error: error?.message || 'Falha ao criar cupom de desconto.' };
  }
}

/**
 * Atualiza um cupom existente.
 */
export async function updateCouponAction(
  id: string,
  data: Partial<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validUntil: string | null;
    maxUses: number | null;
    active: boolean;
  }>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (data.code !== undefined) {
      updateData.code = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    }
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = Math.round(data.discountValue);
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? data.validUntil.trim() : null;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses !== null ? Number(data.maxUses) : null;
    if (data.active !== undefined) updateData.active = data.active;

    await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar cupom:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar cupom.' };
  }
}

/**
 * Exclui um cupom.
 */
export async function deleteCouponAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir cupom:', error);
    return { ok: false, error: 'Falha ao excluir cupom.' };
  }
}

/**
 * Busca a campanha promocional ativa (para o banner de topo).
 */
export async function getPromotionCampaignAction(): Promise<PromotionCampaign | null> {
  try {
    const campaign = await prisma.promotionCampaign.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!campaign) return null;

    return {
      id: campaign.id,
      title: campaign.title,
      bannerText: campaign.bannerText,
      couponCode: campaign.couponCode,
      active: campaign.active,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Erro ao buscar campanha promocional:', error);
    return null;
  }
}

/**
 * Salva ou atualiza a campanha promocional.
 */
export async function updatePromotionCampaignAction(data: {
  title: string;
  bannerText: string;
  couponCode?: string | null;
  active: boolean;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const existing = await prisma.promotionCampaign.findFirst();

    if (existing) {
      await prisma.promotionCampaign.update({
        where: { id: existing.id },
        data: {
          title: data.title.trim(),
          bannerText: data.bannerText.trim(),
          couponCode: data.couponCode?.trim() || null,
          active: data.active,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        },
      });
    } else {
      await prisma.promotionCampaign.create({
        data: {
          title: data.title.trim(),
          bannerText: data.bannerText.trim(),
          couponCode: data.couponCode?.trim() || null,
          active: data.active,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao salvar campanha:', error);
    return { ok: false, error: 'Falha ao salvar campanha promocional.' };
  }
}
