'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Server Actions para gerenciamento de conteúdo da Beck Barbearia.
 * Persistência direta no Supabase PostgreSQL via Prisma.
 */

export interface ExperienceItem {
  title: string;
  text: string;
}

export interface OpeningHourSlot {
  days: string;
  time: string;
  open: boolean;
}

export interface GoogleReviewItem {
  name: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
}

export interface SiteContentData {
  id: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSlogan: string;
  heroImage: string;

  // Seção Experiência Beck & Ritual
  experienceTitle: string;
  experienceDescription: string;
  experiencePhoto: string;
  experienceItemsJson: ExperienceItem[] | null;

  // Horários e Banner de Funcionamento
  walkInTitle: string;
  walkInSubtitle: string;
  hoursJson: OpeningHourSlot[] | null;

  // Avaliações Google
  googleRating: number;
  googleReviewsCount: number;
  reviewsJson: GoogleReviewItem[] | null;

  // Contatos e Redes
  whatsappNumber: string;
  whatsappDisplay: string;
  addressStreet: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  mapsUrl: string | null;
  instagramUrl: string;

  // Aviso do Clube
  noticeTitle: string;
  noticeText: string;
}

export interface AboutContentData {
  id: string;
  title: string;
  subtitle: string;
  storyText: string;
  manifestoText: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderPhoto: string;
  shopPhotos: string[];
}

const DEFAULT_EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    title: 'Barbeiros especialistas',
    text: 'Técnica clássica e tendências atuais, executadas com precisão.',
  },
  {
    title: 'Toalha quente & navalha',
    text: 'O ritual tradicional de barba, do jeito que tem que ser.',
  },
  {
    title: 'Conforto na espera',
    text: 'Sofá, TV e bebida gelada enquanto chega a sua vez.',
  },
  {
    title: 'Ordem de chegada & Clube',
    text: 'Sem burocracia: chegou, sentou, é seu. E sem fechar ao meio-dia.',
  },
];

const DEFAULT_HOURS: OpeningHourSlot[] = [
  { days: 'Segunda a Sexta', time: '08:00 às 19:30', open: true },
  { days: 'Sábado', time: '08:00 às 17:00', open: true },
  { days: 'Domingo', time: 'Fechado', open: false },
];

const DEFAULT_REVIEWS: GoogleReviewItem[] = [
  {
    name: 'Matheus Silveira',
    role: 'Cliente frequente',
    rating: 5,
    date: 'Há 1 semana',
    comment:
      'Melhor barbearia de Arroio do Silva e região! O atendimento por ordem de chegada é rápido, sem frescura. Cerveja gelada na espera e o degradê na navalha sai impecável toda vez.',
  },
  {
    name: 'Rodrigo Becker',
    role: 'Assinante do Clube da Barba',
    rating: 5,
    date: 'Há 3 semanas',
    comment:
      'O Clube da Barba de seg a qua foi a melhor coisa que inventaram. Corto toda semana e mantenho o visual alinhado gastando uma fração do que gastava avulso. Vale cada centavo.',
  },
  {
    name: 'Carlos Eduardo Ramos',
    role: 'Cliente frequente',
    rating: 5,
    date: 'Há 1 mês',
    comment:
      'O ritual da toalha quente e navalha é de outro nível. Profissionais atenciosos, ambiente muito agradável e clássico. Recomendo de olhos fechados para quem valoriza qualidade.',
  },
];

export async function getSiteContent(): Promise<SiteContentData> {
  try {
    let content = await prisma.siteContent.findUnique({
      where: { id: 'default' },
    });

    if (!content) {
      content = await prisma.siteContent.create({
        data: {
          id: 'default',
          logoUrl: '/images/logo-removebg-preview.png',
          heroTitle: 'Beck Barbearia',
          heroSubtitle: 'Estilo não é moda, é atitude.',
          heroSlogan: 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
          heroImage: '/images/hero-bg.webp',
          experienceTitle: 'Mais que um corte, um ritual',
          experienceDescription:
            'Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença. Aqui, cada visita é um momento seu.',
          experiencePhoto: '/images/hero-bg-2.webp',
          experienceItemsJson: DEFAULT_EXPERIENCE_ITEMS as any,
          walkInTitle: 'Chegou, sentou, é seu!',
          walkInSubtitle: 'Atendimento por ordem de chegada — sem hora marcada',
          hoursJson: DEFAULT_HOURS as any,
          googleRating: 4.9,
          googleReviewsCount: 150,
          reviewsJson: DEFAULT_REVIEWS as any,
          whatsappNumber: '554899578323',
          whatsappDisplay: '+55 48 9957-8323',
          addressStreet: 'Avenida Barriga Verde, 300',
          addressDistrict: 'Centro',
          addressCity: 'Balneário Arroio do Silva',
          addressState: 'SC',
          instagramUrl: 'https://instagram.com/beckbarbearia',
          noticeTitle: 'Atenção aos dias de atendimento do Clube',
          noticeText:
            'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
        },
      });
    }

    return {
      id: content.id,
      logoUrl: content.logoUrl || '/images/logo-removebg-preview.png',
      heroTitle: content.heroTitle || 'Beck Barbearia',
      heroSubtitle: content.heroSubtitle || 'Estilo não é moda, é atitude.',
      heroSlogan: content.heroSlogan || 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
      heroImage: content.heroImage || '/images/hero-bg.webp',
      experienceTitle: content.experienceTitle || 'Mais que um corte, um ritual',
      experienceDescription:
        content.experienceDescription ||
        'Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença.',
      experiencePhoto: content.experiencePhoto || '/images/hero-bg-2.webp',
      experienceItemsJson: (content.experienceItemsJson as unknown as ExperienceItem[]) || DEFAULT_EXPERIENCE_ITEMS,
      walkInTitle: content.walkInTitle || 'Chegou, sentou, é seu!',
      walkInSubtitle: content.walkInSubtitle || 'Atendimento por ordem de chegada — sem hora marcada',
      hoursJson: (content.hoursJson as unknown as OpeningHourSlot[]) || DEFAULT_HOURS,
      googleRating: content.googleRating ?? 4.9,
      googleReviewsCount: content.googleReviewsCount ?? 150,
      reviewsJson: (content.reviewsJson as unknown as GoogleReviewItem[]) || DEFAULT_REVIEWS,
      whatsappNumber: content.whatsappNumber || '554899578323',
      whatsappDisplay: content.whatsappDisplay || '+55 48 9957-8323',
      addressStreet: content.addressStreet || 'Avenida Barriga Verde, 300',
      addressDistrict: content.addressDistrict || 'Centro',
      addressCity: content.addressCity || 'Balneário Arroio do Silva',
      addressState: content.addressState || 'SC',
      mapsUrl: content.mapsUrl || null,
      instagramUrl: content.instagramUrl || 'https://instagram.com/beckbarbearia',
      noticeTitle: content.noticeTitle || 'Atenção aos dias de atendimento do Clube',
      noticeText:
        content.noticeText ||
        'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
    };
  } catch (error) {
    console.error('Erro ao buscar site content:', error);
    return {
      id: 'default',
      logoUrl: '/images/logo-removebg-preview.png',
      heroTitle: 'Beck Barbearia',
      heroSubtitle: 'Estilo não é moda, é atitude.',
      heroSlogan: 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
      heroImage: '/images/hero-bg.webp',
      experienceTitle: 'Mais que um corte, um ritual',
      experienceDescription:
        'Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença.',
      experiencePhoto: '/images/hero-bg-2.webp',
      experienceItemsJson: DEFAULT_EXPERIENCE_ITEMS,
      walkInTitle: 'Chegou, sentou, é seu!',
      walkInSubtitle: 'Atendimento por ordem de chegada — sem hora marcada',
      hoursJson: DEFAULT_HOURS,
      googleRating: 4.9,
      googleReviewsCount: 150,
      reviewsJson: DEFAULT_REVIEWS,
      whatsappNumber: '554899578323',
      whatsappDisplay: '+55 48 9957-8323',
      addressStreet: 'Avenida Barriga Verde, 300',
      addressDistrict: 'Centro',
      addressCity: 'Balneário Arroio do Silva',
      addressState: 'SC',
      mapsUrl: null,
      instagramUrl: 'https://instagram.com/beckbarbearia',
      noticeTitle: 'Atenção aos dias de atendimento do Clube',
      noticeText:
        'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
    };
  }
}

export async function updateSiteContent(
  data: Partial<Omit<SiteContentData, 'id'>>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.siteContent.upsert({
      where: { id: 'default' },
      update: {
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.heroTitle !== undefined && { heroTitle: data.heroTitle }),
        ...(data.heroSubtitle !== undefined && { heroSubtitle: data.heroSubtitle }),
        ...(data.heroSlogan !== undefined && { heroSlogan: data.heroSlogan }),
        ...(data.heroImage !== undefined && { heroImage: data.heroImage }),
        ...(data.experienceTitle !== undefined && { experienceTitle: data.experienceTitle }),
        ...(data.experienceDescription !== undefined && { experienceDescription: data.experienceDescription }),
        ...(data.experiencePhoto !== undefined && { experiencePhoto: data.experiencePhoto }),
        ...(data.experienceItemsJson !== undefined && { experienceItemsJson: data.experienceItemsJson as any }),
        ...(data.walkInTitle !== undefined && { walkInTitle: data.walkInTitle }),
        ...(data.walkInSubtitle !== undefined && { walkInSubtitle: data.walkInSubtitle }),
        ...(data.hoursJson !== undefined && { hoursJson: data.hoursJson as any }),
        ...(data.googleRating !== undefined && { googleRating: Number(data.googleRating) }),
        ...(data.googleReviewsCount !== undefined && { googleReviewsCount: Number(data.googleReviewsCount) }),
        ...(data.reviewsJson !== undefined && { reviewsJson: data.reviewsJson as any }),
        ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
        ...(data.whatsappDisplay !== undefined && { whatsappDisplay: data.whatsappDisplay }),
        ...(data.addressStreet !== undefined && { addressStreet: data.addressStreet }),
        ...(data.addressDistrict !== undefined && { addressDistrict: data.addressDistrict }),
        ...(data.addressCity !== undefined && { addressCity: data.addressCity }),
        ...(data.addressState !== undefined && { addressState: data.addressState }),
        ...(data.mapsUrl !== undefined && { mapsUrl: data.mapsUrl }),
        ...(data.instagramUrl !== undefined && { instagramUrl: data.instagramUrl }),
        ...(data.noticeTitle !== undefined && { noticeTitle: data.noticeTitle }),
        ...(data.noticeText !== undefined && { noticeText: data.noticeText }),
      },
      create: {
        id: 'default',
        logoUrl: data.logoUrl || '/images/logo-removebg-preview.png',
        heroTitle: data.heroTitle || 'Beck Barbearia',
        heroSubtitle: data.heroSubtitle || 'Estilo não é moda, é atitude.',
        heroSlogan: data.heroSlogan || 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
        heroImage: data.heroImage || '/images/hero-bg.webp',
        experienceTitle: data.experienceTitle || 'Mais que um corte, um ritual',
        experienceDescription:
          data.experienceDescription ||
          'Ambiente clássico, atendimento de primeira e a atenção aos detalhes que faz a diferença.',
        experiencePhoto: data.experiencePhoto || '/images/hero-bg-2.webp',
        experienceItemsJson: (data.experienceItemsJson as any) || (DEFAULT_EXPERIENCE_ITEMS as any),
        walkInTitle: data.walkInTitle || 'Chegou, sentou, é seu!',
        walkInSubtitle: data.walkInSubtitle || 'Atendimento por ordem de chegada — sem hora marcada',
        hoursJson: (data.hoursJson as any) || (DEFAULT_HOURS as any),
        googleRating: data.googleRating !== undefined ? Number(data.googleRating) : 4.9,
        googleReviewsCount: data.googleReviewsCount !== undefined ? Number(data.googleReviewsCount) : 150,
        reviewsJson: (data.reviewsJson as any) || (DEFAULT_REVIEWS as any),
        whatsappNumber: data.whatsappNumber || '554899578323',
        whatsappDisplay: data.whatsappDisplay || '+55 48 9957-8323',
        addressStreet: data.addressStreet || 'Avenida Barriga Verde, 300',
        addressDistrict: data.addressDistrict || 'Centro',
        addressCity: data.addressCity || 'Balneário Arroio do Silva',
        addressState: data.addressState || 'SC',
        instagramUrl: data.instagramUrl || 'https://instagram.com/beckbarbearia',
        noticeTitle: data.noticeTitle || 'Atenção aos dias de atendimento do Clube',
        noticeText:
          data.noticeText ||
          'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
      },
    });

    revalidatePath('/');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar site content:', error);
    return { ok: false, error: error?.message || 'Falha ao salvar conteúdo da página inicial.' };
  }
}

export async function getAboutContent(): Promise<AboutContentData> {
  try {
    let about = await prisma.aboutContent.findUnique({
      where: { id: 'default' },
    });

    if (!about) {
      about = await prisma.aboutContent.create({
        data: {
          id: 'default',
          title: 'Tradição, Navalha & Respeito ao Cavalheiro',
          subtitle: 'A essência da barbearia clássica viva no coração de Balneário Arroio do Silva.',
          storyText: 'A Beck Barbearia nasceu da paixão pela cutelaria clássica e pelo corte preciso.',
          manifestoText: 'Acreditamos que estilo não é moda passageira, é atitude construída em cada detalhe.',
          founderName: '',
          founderRole: '',
          founderBio: '',
          founderPhoto: '',
          shopPhotos: [],
        },
      });
    }

    return {
      ...about,
      shopPhotos: (about.shopPhotos as string[]) || [],
    };
  } catch (error) {
    console.error('Erro ao buscar about content:', error);
    return {
      id: 'default',
      title: 'Tradição, Navalha & Respeito ao Cavalheiro',
      subtitle: 'A essência da barbearia clássica viva no coração de Balneário Arroio do Silva.',
      storyText: 'A Beck Barbearia nasceu da paixão pela cutelaria clássica e pelo corte preciso.',
      manifestoText: 'Acreditamos que estilo não é moda passageira, é atitude construída em cada detalhe.',
      founderName: '',
      founderRole: '',
      founderBio: '',
      founderPhoto: '',
      shopPhotos: [],
    };
  }
}

export async function updateAboutContent(
  data: Partial<Omit<AboutContentData, 'id'>>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.aboutContent.upsert({
      where: { id: 'default' },
      update: {
        ...data,
        shopPhotos: data.shopPhotos ? (data.shopPhotos as any) : undefined,
      },
      create: {
        id: 'default',
        title: data.title || 'Tradição, Navalha & Respeito ao Cavalheiro',
        subtitle: data.subtitle || 'A essência da barbearia clássica viva no coração de Balneário Arroio do Silva.',
        storyText: data.storyText || '',
        manifestoText: data.manifestoText || '',
        founderName: data.founderName || '',
        founderRole: data.founderRole || '',
        founderBio: data.founderBio || '',
        founderPhoto: data.founderPhoto || '',
        shopPhotos: (data.shopPhotos as any) || [],
      },
    });

    revalidatePath('/sobre');
    revalidatePath('/');
    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar about content:', error);
    return { ok: false, error: error?.message || 'Falha ao salvar conteúdo da página Sobre.' };
  }
}
