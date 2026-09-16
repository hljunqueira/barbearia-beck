/**
 * Tipagens de domínio — Beck Barbearia
 * Compartilhadas entre Server Actions, repositórios (Supabase PostgreSQL via Prisma) e UI.
 */

export type Currency = 'BRL';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export type PlanSlug = 'barba' | 'corte' | 'corte-barba';

export type PlanRuleIcon = 'calendar' | 'payment' | 'lock' | 'weekdays';

/** Regra de funcionamento do Clube (ex.: "Válido por 30 dias"). */
export interface PlanRule {
  readonly id: string;
  readonly icon: PlanRuleIcon;
  readonly title: string;
  readonly description: string;
}

export type ServiceIcon = 'scissors' | 'beard' | 'combo' | 'highlights' | 'platinum';

export interface ServiceGalleryPhoto {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
}

/** Serviço avulso da tabela de preços (corte, barba, luzes...). */
export interface Service {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly priceInCents: number;
  /** Duração estimada — base para o futuro agendamento online. */
  readonly durationMinutes: number;
  readonly icon?: ServiceIcon;
  readonly popular?: boolean;
  readonly badge?: string;
  readonly image?: string;
  readonly gallery?: readonly ServiceGalleryPhoto[];
}

export interface PlanFeature {
  readonly label: string;
  readonly included: boolean;
}

export interface Plan {
  readonly id: string;
  readonly slug: PlanSlug;
  readonly name: string;
  readonly tagline: string;
  readonly priceInCents: number;
  readonly currency: Currency;
  readonly billingCycle: BillingCycle;
  readonly features: readonly PlanFeature[];
  readonly highlighted: boolean;
  readonly badge: string | null;
}

export type ProductCategory = 'pomada' | 'oleo' | 'balm' | 'kit';

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly description: string;
  readonly priceInCents: number;
  readonly compareAtPriceInCents: number | null;
  readonly imageUrl: string;
  readonly inStock: boolean;
  /** Avaliação média de 0 a 5. */
  readonly rating: number;
}

/** Envelope padrão para respostas de Server Actions que podem falhar. */
export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

export type SubscriptionStatus = 'active' | 'pending' | 'canceled' | 'past_due';

export interface Subscription {
  readonly id: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly customerEmail: string;
  readonly planSlug: PlanSlug;
  readonly planName: string;
  readonly priceInCents: number;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly nextBillingDate: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';

export interface Appointment {
  readonly id: string;
  readonly subscriptionId?: string | null;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly planName?: string;
  readonly serviceType: string;
  readonly barberName?: string;
  readonly priceInCents?: number;
  readonly durationMinutes?: number;
  readonly date: string; // YYYY-MM-DD
  readonly timeSlot: string; // HH:mm
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly createdAt: string;
}

export interface Barber {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly phone?: string | null;
  readonly photoUrl?: string | null;
  readonly bio?: string | null;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface AdminUserItem {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: string;
}

