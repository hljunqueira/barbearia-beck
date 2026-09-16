'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/types';

export async function listAdminProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return products.map((prod: any) => ({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      category: prod.category as Product['category'],
      description: prod.description,
      priceInCents: prod.priceInCents,
      compareAtPriceInCents: prod.compareAtPriceInCents,
      imageUrl: prod.imageUrl,
      inStock: prod.inStock,
      stockQuantity: prod.stockQuantity ?? 10,
      minStockAlert: prod.minStockAlert ?? 2,
      showOnHome: prod.showOnHome ?? true,
      rating: prod.rating,
    }));
  } catch (error) {
    console.error('Erro ao listar produtos admin:', error);
    return [];
  }
}

export async function createProduct(data: {
  name: string;
  category: 'pomada' | 'oleo' | 'balm' | 'kit';
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number | null;
  imageUrl: string;
  inStock?: boolean;
  stockQuantity?: number;
  minStockAlert?: number;
  showOnHome?: boolean;
}): Promise<{ ok: boolean; product?: Product; error?: string }> {
  try {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    const stockQty = data.stockQuantity !== undefined ? Math.max(0, Number(data.stockQuantity)) : 10;

    const newProd = await prisma.product.create({
      data: {
        slug: finalSlug,
        name: data.name.trim(),
        category: data.category,
        description: data.description.trim(),
        priceInCents: Math.round(data.priceInCents),
        compareAtPriceInCents: data.compareAtPriceInCents ? Math.round(data.compareAtPriceInCents) : null,
        imageUrl: data.imageUrl || '/images/product-pomada-matte.webp',
        inStock: data.inStock ?? (stockQty > 0),
        stockQuantity: stockQty,
        minStockAlert: data.minStockAlert !== undefined ? Number(data.minStockAlert) : 2,
        showOnHome: data.showOnHome ?? true,
        rating: 5.0,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return {
      ok: true,
      product: {
        id: newProd.id,
        slug: newProd.slug,
        name: newProd.name,
        category: newProd.category as Product['category'],
        description: newProd.description,
        priceInCents: newProd.priceInCents,
        compareAtPriceInCents: newProd.compareAtPriceInCents,
        imageUrl: newProd.imageUrl,
        inStock: newProd.inStock,
        stockQuantity: newProd.stockQuantity,
        minStockAlert: newProd.minStockAlert,
        showOnHome: newProd.showOnHome,
        rating: newProd.rating,
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar produto:', error);
    return { ok: false, error: error?.message || 'Falha ao cadastrar produto.' };
  }
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    category: 'pomada' | 'oleo' | 'balm' | 'kit';
    description: string;
    priceInCents: number;
    compareAtPriceInCents: number | null;
    imageUrl: string;
    inStock: boolean;
    stockQuantity: number;
    minStockAlert: number;
    showOnHome: boolean;
  }>,
): Promise<{ ok: boolean; product?: Product; error?: string }> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.priceInCents !== undefined) updateData.priceInCents = Math.round(data.priceInCents);
    if (data.compareAtPriceInCents !== undefined) {
      updateData.compareAtPriceInCents = data.compareAtPriceInCents ? Math.round(data.compareAtPriceInCents) : null;
    }
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.stockQuantity !== undefined) {
      updateData.stockQuantity = Math.max(0, Number(data.stockQuantity));
      if (data.inStock === undefined) {
        updateData.inStock = updateData.stockQuantity > 0;
      }
    }
    if (data.minStockAlert !== undefined) updateData.minStockAlert = Number(data.minStockAlert);
    if (data.showOnHome !== undefined) updateData.showOnHome = data.showOnHome;

    const updatedProd = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return {
      ok: true,
      product: {
        id: updatedProd.id,
        slug: updatedProd.slug,
        name: updatedProd.name,
        category: updatedProd.category as Product['category'],
        description: updatedProd.description,
        priceInCents: updatedProd.priceInCents,
        compareAtPriceInCents: updatedProd.compareAtPriceInCents,
        imageUrl: updatedProd.imageUrl,
        inStock: updatedProd.inStock,
        stockQuantity: updatedProd.stockQuantity,
        minStockAlert: updatedProd.minStockAlert,
        showOnHome: updatedProd.showOnHome,
        rating: updatedProd.rating,
      },
    };
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar produto.' };
  }
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir produto:', error);
    return { ok: false, error: error?.message || 'Falha ao excluir produto.' };
  }
}

export async function toggleProductStock(id: string, inStock: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.product.update({
      where: { id },
      data: { inStock },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao alterar estoque do produto:', error);
    return { ok: false, error: error?.message || 'Falha ao alterar estoque.' };
  }
}

export async function toggleProductHomeVisibility(id: string, showOnHome: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.product.update({
      where: { id },
      data: { showOnHome },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao alterar visibilidade na Home:', error);
    return { ok: false, error: error?.message || 'Falha ao alterar visibilidade.' };
  }
}

