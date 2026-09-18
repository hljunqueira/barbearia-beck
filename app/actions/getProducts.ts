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

  // Retorna os produtos e bebidas marcados para exibição na Home
  return products.filter((product) => product.showOnHome !== false);
}

/**
 * Retorna todos os produtos e bebidas cadastrados no catálogo da Beck Barbearia.
 */
export async function getAllProducts(): Promise<Product[]> {
  const products = await productsRepository.list();
  return [...products];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productsRepository.findBySlug(slug);
}

