'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Server Actions para gerenciamento de conteúdo da Beck Barbearia.
 * Persistência direta no Supabase PostgreSQL via Prisma.
 */

export interface SiteContentData {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSlogan: string;
  heroImage: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  addressStreet: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  mapsUrl: string | null;
  instagramUrl: string;
  hoursJson: any;
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

export async function getSiteContent(): Promise<SiteContentData> {
  try {
    let content = await prisma.siteContent.findUnique({
      where: { id: 'default' },
    });

    if (!content) {
      content = await prisma.siteContent.create({
        data: {
          id: 'default',
          heroTitle: 'Beck Barbearia',
          heroSubtitle: 'Estilo não é moda, é atitude.',
          heroSlogan: 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
          heroImage: '/images/hero-bg.webp',
          whatsappNumber: '554899578323',
          whatsappDisplay: '+55 48 9957-8323',
          addressStreet: 'Avenida Barriga Verde, 300',
          addressDistrict: 'Centro',
          addressCity: 'Balneário Arroio do Silva',
          addressState: 'SC',
          instagramUrl: 'https://instagram.com/beckbarbearia',
          noticeTitle: 'Atenção aos dias de atendimento do Clube',
          noticeText: 'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
        },
      });
    }

    return content as unknown as SiteContentData;
  } catch (error) {
    console.error('Erro ao buscar site content:', error);
    return {
      id: 'default',
      heroTitle: 'Beck Barbearia',
      heroSubtitle: 'Estilo não é moda, é atitude.',
      heroSlogan: 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
      heroImage: '/images/hero-bg.webp',
      whatsappNumber: '554899578323',
      whatsappDisplay: '+55 48 9957-8323',
      addressStreet: 'Avenida Barriga Verde, 300',
      addressDistrict: 'Centro',
      addressCity: 'Balneário Arroio do Silva',
      addressState: 'SC',
      mapsUrl: null,
      instagramUrl: 'https://instagram.com/beckbarbearia',
      hoursJson: null,
      noticeTitle: 'Atenção aos dias de atendimento do Clube',
      noticeText: 'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
    };
  }
}

export async function updateSiteContent(
  data: Partial<Omit<SiteContentData, 'id'>>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.siteContent.upsert({
      where: { id: 'default' },
      update: { ...data },
      create: {
        id: 'default',
        heroTitle: data.heroTitle || 'Beck Barbearia',
        heroSubtitle: data.heroSubtitle || 'Estilo não é moda, é atitude.',
        heroSlogan: data.heroSlogan || 'Seu estilo, nossa missão! Chegou, sentou, é seu!',
        heroImage: data.heroImage || '/images/hero-bg.webp',
        whatsappNumber: data.whatsappNumber || '554899578323',
        whatsappDisplay: data.whatsappDisplay || '+55 48 9957-8323',
        addressStreet: data.addressStreet || 'Avenida Barriga Verde, 300',
        addressDistrict: data.addressDistrict || 'Centro',
        addressCity: data.addressCity || 'Balneário Arroio do Silva',
        addressState: data.addressState || 'SC',
        instagramUrl: data.instagramUrl || 'https://instagram.com/beckbarbearia',
        hoursJson: data.hoursJson || null,
        noticeTitle: data.noticeTitle || 'Atenção aos dias de atendimento do Clube',
        noticeText: data.noticeText || 'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
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
          founderName: 'Henrique Becker',
          founderRole: 'Fundador & Mestre Barbeiro',
          founderBio: 'Especialista em visagismo masculino, cortes clássicos e toalha quente.',
          founderPhoto: '/images/hero-bg-2.webp',
          shopPhotos: ['/images/hero-bg.webp', '/images/hero-bg-2.webp'],
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
      founderName: 'Henrique Becker',
      founderRole: 'Fundador & Mestre Barbeiro',
      founderBio: 'Especialista em visagismo masculino, cortes clássicos e toalha quente.',
      founderPhoto: '/images/hero-bg-2.webp',
      shopPhotos: ['/images/hero-bg.webp', '/images/hero-bg-2.webp'],
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
        founderName: data.founderName || 'Henrique Becker',
        founderRole: data.founderRole || 'Fundador & Mestre Barbeiro',
        founderBio: data.founderBio || '',
        founderPhoto: data.founderPhoto || '/images/hero-bg-2.webp',
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
