import type { Plan, PlanRule, Product, Service } from '@/types';
import { MOCK_PLANS, PLAN_RULES } from '@/lib/data/plans';
import { MOCK_PRODUCTS } from '@/lib/data/products';
import { MOCK_SERVICES } from '@/lib/data/services';

/**
 * Camada de acesso a dados.
 *
 * As Server Actions consomem apenas estas interfaces, então trocar a fonte
 * (mock -> Prisma -> karfex) não exige alterações no frontend.
 *
 * Próximos passos previstos:
 *  - prismaPlansRepository:  () => prisma.plan.findMany({ orderBy: { priceInCents: 'asc' } })
 *  - karfexPlansRepository:  () => karfex.listPlans()  (ver lib/karfex.ts)
 */

export interface PlansRepository {
  list(): Promise<readonly Plan[]>;
  findBySlug(slug: Plan['slug']): Promise<Plan | null>;
  rules(): Promise<readonly PlanRule[]>;
}

export interface ProductsRepository {
  list(): Promise<readonly Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
}

export interface ServicesRepository {
  list(): Promise<readonly Service[]>;
  findBySlug(slug: string): Promise<Service | null>;
}

const mockPlansRepository: PlansRepository = {
  async list() {
    return MOCK_PLANS;
  },
  async findBySlug(slug) {
    return MOCK_PLANS.find((plan) => plan.slug === slug) ?? null;
  },
  async rules() {
    return PLAN_RULES;
  },
};

const mockServicesRepository: ServicesRepository = {
  async list() {
    return MOCK_SERVICES;
  },
  async findBySlug(slug) {
    return MOCK_SERVICES.find((service) => service.slug === slug) ?? null;
  },
};

const mockProductsRepository: ProductsRepository = {
  async list() {
    return MOCK_PRODUCTS;
  },
  async findBySlug(slug) {
    return MOCK_PRODUCTS.find((product) => product.slug === slug) ?? null;
  },
};

// Ponto único de troca da fonte de dados.
export const plansRepository: PlansRepository = mockPlansRepository;
export const productsRepository: ProductsRepository = mockProductsRepository;
export const servicesRepository: ServicesRepository = mockServicesRepository;
