import type { Product } from '@/types';

/**
 * Catálogo padrão de produtos da Beck Barbearia.
 */
export const MOCK_PRODUCTS: readonly Product[] = [
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c01',
    slug: 'pomada-classica-brilho',
    name: 'Pomada Clássica Efeito Brilho',
    category: 'pomada',
    description:
      'Fixação média com acabamento brilhante. Base solúvel em água, fácil de remover e remodelar ao longo do dia.',
    priceInCents: 5990,
    compareAtPriceInCents: null,
    imageUrl: '/images/pomada-classica.webp',
    inStock: true,
    rating: 4.9,
  },
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c02',
    slug: 'pomada-matte-forte',
    name: 'Pomada Matte Fixação Forte',
    category: 'pomada',
    description:
      'Efeito seco e natural com fixação extraforte. Ideal para cortes texturizados e visual despojado.',
    priceInCents: 6490,
    compareAtPriceInCents: null,
    imageUrl: '/images/pomada-matte.webp',
    inStock: true,
    rating: 4.8,
  },
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c03',
    slug: 'oleo-barba-signature',
    name: 'Óleo para Barba Beck Signature',
    category: 'oleo',
    description:
      'Blend de argan, jojoba e amêndoas doces. Hidrata os fios, reduz a coceira e deixa a barba macia com brilho sutil.',
    priceInCents: 4990,
    compareAtPriceInCents: null,
    imageUrl: '/images/oleo-barba.webp',
    inStock: true,
    rating: 5,
  },
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c04',
    slug: 'balm-barba-cedro-baunilha',
    name: 'Balm para Barba Cedro & Baunilha',
    category: 'balm',
    description:
      'Modela, alinha e nutre. Manteiga de karité e cera de abelha com fragrância amadeirada de longa duração.',
    priceInCents: 5490,
    compareAtPriceInCents: null,
    imageUrl: '/images/balm-barba.webp',
    inStock: true,
    rating: 4.7,
  },
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c05',
    slug: 'kit-barbear-classico',
    name: 'Kit de Barbear Clássico',
    category: 'kit',
    description:
      'Navalha, pincel de cerdas naturais e sabão de barbear. O ritual tradicional completo para fazer em casa.',
    priceInCents: 18990,
    compareAtPriceInCents: 21990,
    imageUrl: '/images/kit-barbear.webp',
    inStock: true,
    rating: 4.9,
  },
  {
    id: '7b1e9c3a-5d2f-4a6b-9c8d-2e3f4a5b6c06',
    slug: 'kit-completo-beck',
    name: 'Kit Completo Beck',
    category: 'kit',
    description:
      'Pomada, óleo e balm em um só kit. Tudo o que você precisa para manter cabelo e barba no padrão Beck.',
    priceInCents: 14990,
    compareAtPriceInCents: 16970,
    imageUrl: '/images/kit-completo.webp',
    inStock: true,
    rating: 4.8,
  },
];
