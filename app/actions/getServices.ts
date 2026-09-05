'use server';

import type { Service } from '@/types';
import { servicesRepository } from '@/lib/repositories';

/**
 * Server Action — Tabela de serviços (corte, barba, luzes, platinado...).
 * Fonte simulada até a integração com Prisma.
 */
export async function getServices(): Promise<Service[]> {
  const services = await servicesRepository.list();

  return [...services];
}
