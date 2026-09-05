import type { Service } from '@/types';

/**
 * Tabela de serviços — valores oficiais do flyer.
 * Fonte temporária até a integração com Prisma (prisma.service.findMany).
 */
export const MOCK_SERVICES: readonly Service[] = [
  {
    id: '3c9a7e10-2b4d-4f6a-8c1e-5d7f9b2a4c01',
    slug: 'corte',
    name: 'Corte',
    description: 'Clássico, degradê ou moderno — com acabamento na navalha.',
    priceInCents: 3500,
    durationMinutes: 30,
    image: '/images/gallery/fade-navalhado.jpg',
    gallery: [
      {
        url: '/images/gallery/fade-navalhado.jpg',
        title: 'Degradê Navalhado (Skin Fade)',
        description: 'Transição suave milimétrica com lâmina e acabamento nítido.',
      },
      {
        url: '/images/gallery/corte-fade-extra.jpg',
        title: 'Corte Estilizado & Fade Moderno',
        description: 'Design contemporâneo executado na tesoura e máquina com precisão.',
      },
      {
        url: '/images/gallery/corte-classico.webp',
        title: 'Corte Social / Clássico',
        description: 'Alinhamento refinado com acabamento impecável.',
      },
    ],
  },
  {
    id: '3c9a7e10-2b4d-4f6a-8c1e-5d7f9b2a4c02',
    slug: 'barba',
    name: 'Barba',
    description: 'Alinhamento, toalha quente e finalização com navalha.',
    priceInCents: 3000,
    durationMinutes: 30,
    image: '/images/gallery/barba-ritual.jpg',
    gallery: [
      {
        url: '/images/gallery/barba-ritual.jpg',
        title: 'Barba Terapia Tradicional',
        description: 'Toalha quente para abertura dos poros, massagem com balm e navalha afiada.',
      },
      {
        url: '/images/gallery/barba-navalha-extra.jpg',
        title: 'Alinhamento & Contorno com Lâmina',
        description: 'Desenho preciso dos contornos da bochecha e pescoço com finalização refrescante.',
      },
    ],
  },
  {
    id: '3c9a7e10-2b4d-4f6a-8c1e-5d7f9b2a4c03',
    slug: 'corte-barba',
    name: 'Corte + Barba',
    description: 'O combo completo com toalha quente e preço especial.',
    priceInCents: 6000,
    durationMinutes: 60,
    popular: true,
    badge: 'Mais Pedido',
    image: '/images/gallery/corte-classico.webp',
    gallery: [
      {
        url: '/images/gallery/corte-classico.webp',
        title: 'Combo Clássico Completo',
        description: 'Corte refinado somado ao alinhamento de barba com produtos premium.',
      },
      {
        url: '/images/gallery/fade-navalhado.jpg',
        title: 'Skin Fade + Barba Desenhada',
        description: 'Combinação marcante com transição do degradê para a costeleta.',
      },
      {
        url: '/images/gallery/barba-ritual.jpg',
        title: 'Ritual de Toalha Quente',
        description: 'Relaxamento total na cadeira com tratamento completo para pele e barba.',
      },
    ],
  },
  {
    id: '3c9a7e10-2b4d-4f6a-8c1e-5d7f9b2a4c04',
    slug: 'luzes',
    name: 'Luzes',
    description: 'Mechas para dar profundidade e estilo ao visual.',
    priceInCents: 13000,
    durationMinutes: 90,
    image: '/images/gallery/luzes.jpg',
    gallery: [
      {
        url: '/images/gallery/luzes.jpg',
        title: 'Luzes & Mechas Masculinas',
        description: 'Destaque e textura moderna para cortes curtos ou médios com contraste elegante.',
      },
    ],
  },
  {
    id: '3c9a7e10-2b4d-4f6a-8c1e-5d7f9b2a4c05',
    slug: 'platinado',
    name: 'Platinado',
    description: 'Descoloração completa com matização profissional.',
    priceInCents: 15000,
    durationMinutes: 120,
    badge: 'Estilo Marcante',
    image: '/images/gallery/platinado.jpg',
    gallery: [
      {
        url: '/images/gallery/platinado.jpg',
        title: 'Platinado Global & Matização',
        description: 'Tom branco puro sem agredir o couro cabeludo, com hidratação pós-química.',
      },
    ],
  },
];
