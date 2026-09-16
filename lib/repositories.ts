import type { Plan, PlanRule, Product, Service } from '@/types';
import { prisma } from '@/lib/prisma';

/**
 * Camada de acesso a dados oficiais da Beck Barbearia.
 *
 * Conectada 100% diretamente ao Supabase PostgreSQL via Prisma.
 * Zero mocks em memória.
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

export const plansRepository: PlansRepository = {
  async list() {
    const plans = await prisma.plan.findMany({
      orderBy: { priceInCents: 'asc' },
    });

    return plans.map((p) => ({
      id: p.id,
      slug: p.slug as Plan['slug'],
      name: p.name,
      tagline: p.tagline,
      priceInCents: p.priceInCents,
      currency: (p.currency as Plan['currency']) || 'BRL',
      billingCycle: (p.billingCycle as Plan['billingCycle']) || 'monthly',
      features: (p.features as unknown as Plan['features']) || [],
      highlighted: p.highlighted,
      badge: p.badge,
    }));
  },

  async findBySlug(slug) {
    const p = await prisma.plan.findUnique({
      where: { slug },
    });
    if (!p) return null;

    return {
      id: p.id,
      slug: p.slug as Plan['slug'],
      name: p.name,
      tagline: p.tagline,
      priceInCents: p.priceInCents,
      currency: (p.currency as Plan['currency']) || 'BRL',
      billingCycle: (p.billingCycle as Plan['billingCycle']) || 'monthly',
      features: (p.features as unknown as Plan['features']) || [],
      highlighted: p.highlighted,
      badge: p.badge,
    };
  },

  async rules() {
    const rules = await prisma.planRule.findMany({
      orderBy: { step: 'asc' },
    });

    return rules.map((r: any) => ({
      id: r.id,
      icon: (r.icon as PlanRule['icon']) || 'calendar',
      title: r.title,
      description: r.description,
    }));
  },
};

export const productsRepository: ProductsRepository = {
  async list() {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
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
  },

  async findBySlug(slug) {
    const prod = await prisma.product.findUnique({
      where: { slug },
    });
    if (!prod) return null;

    return {
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
    };
  },
};

export const servicesRepository: ServicesRepository = {
  async list() {
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
      icon: (s.icon as Service['icon']) || undefined,
      popular: s.popular,
      badge: s.badge || undefined,
      image: s.image || undefined,
    }));
  },

  async findBySlug(slug) {
    const s: any = await prisma.service.findUnique({
      where: { slug },
    });
    if (!s) return null;

    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      priceInCents: s.priceInCents,
      durationMinutes: s.durationMinutes,
      icon: (s.icon as Service['icon']) || undefined,
      popular: s.popular,
      badge: s.badge || undefined,
      image: s.image || undefined,
    };
  },
};
