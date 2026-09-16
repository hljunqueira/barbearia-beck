'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/types';

export async function listAdminProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return products.map((prod) => ({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      category: prod.category as Product['category'],
      description: prod.description,
      priceInCents: prod.priceInCents,
      compareAtPriceInCents: prod.compareAtPriceInCents,
      imageUrl: prod.imageUrl,
      inStock: prod.inStock,
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
}): Promise<{ ok: boolean; product?: Product; error?: string }> {
  try {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const newProd = await prisma.product.create({
      data: {
        slug: finalSlug,
        name: data.name.trim(),
        category: data.category,
        description: data.description.trim(),
        priceInCents: Math.round(data.priceInCents),
        compareAtPriceInCents: data.compareAtPriceInCents ? Math.round(data.compareAtPriceInCents) : null,
        imageUrl: data.imageUrl || '/images/product-pomada-matte.webp',
        inStock: data.inStock ?? true,
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
  }>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        category: data.category,
        description: data.description?.trim(),
        priceInCents: data.priceInCents !== undefined ? Math.round(data.priceInCents) : undefined,
        compareAtPriceInCents: data.compareAtPriceInCents !== undefined ? (data.compareAtPriceInCents ? Math.round(data.compareAtPriceInCents) : null) : undefined,
        imageUrl: data.imageUrl,
        inStock: data.inStock,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
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
