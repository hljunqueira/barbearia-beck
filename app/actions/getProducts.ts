'use server';

import type { Product } from '@/types';
import { productsRepository } from '@/lib/repositories';

/**
 * Server Action — Produtos
 *
 * Retorna o catálogo de produtos persistidos no Supabase PostgreSQL via Prisma.
 */
export async function getProducts(): Promise<Product[]> {
  const products = await productsRepository.list();

  return products.filter((product) => product.inStock);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productsRepository.findBySlug(slug);
}
