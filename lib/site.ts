/**
 * Configurações públicas do site — dados oficiais da Beck Barbearia (flyers).
 */
export const SITE = {
  name: 'Beck Barbearia',
  tagline: 'Estilo não é moda, é atitude',
  domain: 'beckbarbearia.com.br',
  url: 'https://beckbarbearia.com.br',
  description:
    'Beck Barbearia em Balneário Arroio do Silva/SC — cortes, barba, luzes e platinado com atendimento por ordem de chegada. Planos mensais do Clube da Barba válidos de segunda a quarta-feira.',
  slogans: {
    hero: 'Seu estilo, nossa missão!',
    walkIn: 'Chegou, sentou, é seu!',
    attitude: 'Estilo não é moda, é atitude.',
  },
  // Formato internacional sem símbolos. Pode ser sobrescrito via NEXT_PUBLIC_WHATSAPP_NUMBER.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '554899578323',
  whatsappDisplay: '+55 48 9957-8323',
  instagram: 'https://instagram.com/beckbarbearia',
  address: {
    street: 'Avenida Barriga Verde, 300',
    district: 'Centro',
    city: 'Balneário Arroio do Silva',
    state: 'SC',
  },
  hours: [
    { days: 'Segunda-feira', time: '14h às 19h', open: true },
    { days: 'Terça a Sexta-feira', time: '08h às 19h', open: true },
    { days: 'Sábado', time: '08h às 18h', open: true },
    { days: 'Domingo', time: 'Fechado', open: false },
  ],
  serviceNotes: [
    'Sem fechar ao meio-dia',
    'Atendimento por ordem de chegada',
    'Qualidade, conforto e atendimento de respeito',
  ],
} as const;

export const fullAddress = (): string =>
  `${SITE.address.street} — ${SITE.address.district}, ${SITE.address.city}/${SITE.address.state}`;

/**
 * Gera link do WhatsApp com mensagem pré-preenchida.
 * Suporta número customizado (ex: envio direto para cliente aniversariante) ou oficial da barbearia.
 */
export const whatsappLink = (message: string, customPhone?: string): string => {
  const cleanPhone = customPhone ? customPhone.replace(/\D/g, '') : '';
  const targetPhone = cleanPhone
    ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`)
    : (SITE.whatsappNumber ?? '554899578323');

  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    : '#contato';
};

export const mapsLink = (): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;
