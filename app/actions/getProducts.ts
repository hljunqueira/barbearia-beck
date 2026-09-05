'use server';

import type { Product } from '@/types';
import { productsRepository } from '@/lib/repositories';

/**
 * Server Action — Produtos
 *
 * Retorna o catálogo de produtos (pomadas, óleos, balms e kits) com tipagem estrita.
 * Fonte simulada até a integração com Prisma / API karfex.
 */
export async function getProducts(): Promise<Product[]> {
  const products = await productsRepository.list();

  return products.filter((product) => product.inStock);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productsRepository.findBySlug(slug);
}
