import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}


async function main() {
  console.log('🌱 Iniciando seed do banco de dados Supabase da Beck Barbearia...');

  // 1. Conteúdo da Landing Page (SiteContent)
  console.log('📌 Populando SiteContent...');
  await prisma.siteContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
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
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Avenida+Barriga+Verde,+300+-+Centro,+Balne%C3%A1rio+Arroio+do+Silva/SC',
      instagramUrl: 'https://instagram.com/beckbarbearia',
      hoursJson: [
        { days: 'Segunda-feira', time: '14h às 19h', open: true },
        { days: 'Terça a Sexta-feira', time: '08h às 19h', open: true },
        { days: 'Sábado', time: '08h às 18h', open: true },
        { days: 'Domingo', time: 'Fechado', open: false },
      ],
      noticeTitle: 'Atenção aos dias de atendimento do Clube',
      noticeText: 'Os planos do Clube da Barba são válidos exclusivamente para atendimentos de segunda a quarta-feira.',
    },
  });

  // 2. Conteúdo da Página Sobre (AboutContent)
  console.log('📌 Populando AboutContent...');
  await prisma.aboutContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      title: 'Tradição, Navalha & Respeito ao Cavalheiro',
      subtitle: 'A essência da barbearia clássica viva no coração de Balneário Arroio do Silva.',
      storyText:
        'A Beck Barbearia nasceu da paixão pela cutelaria clássica e pelo corte preciso. Em um mundo de atendimentos apressados e padronizados, decidimos preservar o ritual: a toalha fumegante aromática, o deslizar suave da navalha afiada, o café fresco e o ambiente acolhedor onde todo cavalheiro encontra seu momento de pausa e renovação de postura.\n\nLocalizada no Centro de Balneário Arroio do Silva, nos tornamos ponto de encontro de homens que entendem que o cuidado com o cabelo e com a barba não é vaidade passageira — é autoconfiança, respeito próprio e assinatura pessoal.',
      manifestoText:
        'Acreditamos que estilo não é moda passageira, é atitude construída em cada detalhe. Do corte fade mais cirúrgico ao alinhamento clássico de barba com toalha quente, cada serviço é executado com rigor técnico, produtos de altíssima qualidade e dedicação sem atalhos.',
      founderName: 'Henrique Becker',
      founderRole: 'Fundador & Mestre Barbeiro',
      founderBio:
        'Com anos de experiência dedicada à arte da barbearia tradicional, Henrique Becker fundou a Beck Barbearia com o compromisso de resgatar o padrão de excelência das barbearias clássicas de cavalheiros, aliando técnica refinada e atendimento transparente por ordem de chegada e clube de assinatura.',
      founderPhoto: '/images/hero-bg-2.webp',
      shopPhotos: [
        '/images/hero-bg.webp',
        '/images/hero-bg-2.webp',
        '/images/product-pomada-matte.webp',
        '/images/product-oleo-barba.webp',
      ],
    },
  });

  // 3. Planos do Clube da Barba
  console.log('📌 Populando Planos do Clube da Barba...');
  const plansData = [
    {
      slug: 'corte',
      name: 'Cabelo',
      tagline: 'Cortes ilimitados no mês com técnica clássica e acabamento de respeito.',
      priceInCents: 9990,
      currency: 'BRL',
      billingCycle: 'monthly',
      highlighted: false,
      badge: null,
      features: [
        { label: 'Cortes de cabelo ilimitados no mês', included: true },
        { label: 'Válido de segunda a quarta-feira', included: true },
        { label: 'Lavagem com produtos profissionais', included: true },
        { label: 'Finalização e penteado', included: true },
        { label: 'Sem taxa de adesão', included: true },
      ],
    },
    {
      slug: 'barba',
      name: 'Barba',
      tagline: 'Alinhamento completo, navalha e toalha quente quantas vezes precisar.',
      priceInCents: 8990,
      currency: 'BRL',
      billingCycle: 'monthly',
      highlighted: false,
      badge: null,
      features: [
        { label: 'Barba ilimitada no mês', included: true },
        { label: 'Válido de segunda a quarta-feira', included: true },
        { label: 'Ritual completo com toalha quente', included: true },
        { label: 'Hidratação com óleo essencial', included: true },
        { label: 'Pós-barba refrescante', included: true },
      ],
    },
    {
      slug: 'corte-barba',
      name: 'Corte + Barba',
      tagline: 'A experiência completa do Clube. Cabelo e barba impecáveis o mês todo.',
      priceInCents: 15990,
      currency: 'BRL',
      billingCycle: 'monthly',
      highlighted: true,
      badge: 'Mais Escolhido',
      features: [
        { label: 'Cortes e barbas ilimitados no mês', included: true },
        { label: 'Válido de segunda a quarta-feira', included: true },
        { label: 'Ritual completo de navalha e toalha quente', included: true },
        { label: 'Lavagem e finalização premium', included: true },
        { label: '10% de desconto na linha de produtos', included: true },
        { label: 'Café ou bebida na espera', included: true },
      ],
    },
  ];

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  // 4. Catálogo de Produtos Oficiais
  console.log('📌 Populando Catálogo de Produtos...');
  const productsData = [
    {
      slug: 'pomada-matte',
      name: 'Pomada Matte Efeito Seco 100g',
      category: 'pomada',
      description: 'Fixação forte com acabamento fosco e natural. Não deixa resíduos e sai facilmente na água.',
      priceInCents: 4500,
      compareAtPriceInCents: 5500,
      imageUrl: '/images/product-pomada-matte.webp',
      inStock: true,
      rating: 4.9,
    },
    {
      slug: 'pomada-brilho',
      name: 'Pomada Clássica Alto Brilho 100g',
      category: 'pomada',
      description: 'Brilho clássico para penteados alinhados como pompadour e slicked back. Fixação média a alta.',
      priceInCents: 4500,
      compareAtPriceInCents: null,
      imageUrl: '/images/product-pomada-brilho.webp',
      inStock: true,
      rating: 4.8,
    },
    {
      slug: 'oleo-barba',
      name: 'Óleo para Barba Wood & Spice 30ml',
      category: 'oleo',
      description: 'Fórmula rica em óleos nobres que hidratam fios ásperos e nutrem a pele, com aroma amadeirado elegante.',
      priceInCents: 3990,
      compareAtPriceInCents: 4990,
      imageUrl: '/images/product-oleo-barba.webp',
      inStock: true,
      rating: 5.0,
    },
    {
      slug: 'balm-barba',
      name: 'Balm Hidratante & Alinhador 120g',
      category: 'balm',
      description: 'Modela os fios rebeldes da barba, reduz o frizz e alivia a coceira sem deixar aspecto oleoso.',
      priceInCents: 4200,
      compareAtPriceInCents: null,
      imageUrl: '/images/product-balm-barba.webp',
      inStock: true,
      rating: 4.9,
    },
    {
      slug: 'shampoo-barba-cabelo',
      name: 'Shampoo 2 em 1 Cabelo & Barba 250ml',
      category: 'kit',
      description: 'Limpeza profunda com extrato de menta e tea tree. Estimula o couro cabeludo e deixa sensação refrescante.',
      priceInCents: 3800,
      compareAtPriceInCents: null,
      imageUrl: '/images/product-shampoo-barba.webp',
      inStock: true,
      rating: 4.7,
    },
    {
      slug: 'kit-cavalheiro',
      name: 'Kit Completo do Cavalheiro Beck',
      category: 'kit',
      description: 'O combo definitivo: Pomada Matte + Óleo Wood & Spice + Balm Hidratante em caixa presenteável.',
      priceInCents: 11990,
      compareAtPriceInCents: 13990,
      imageUrl: '/images/product-kit-cavalheiro.webp',
      inStock: true,
      rating: 5.0,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }

  // 5. Tabela de Serviços Avulsos
  console.log('📌 Populando Serviços da Barbearia...');
  const servicesData = [
    {
      slug: 'corte-masculino',
      name: 'Corte Tradicional / Fade',
      category: 'corte',
      description: 'Corte personalizado na tesoura ou máquina com degradê preciso, lavagem e finalização com pomada.',
      durationMinutes: 35,
      priceInCents: 3500,
      popular: true,
      badge: 'Mais pedido',
      image: '/images/hero-bg.webp',
    },
    {
      slug: 'barba-navalha',
      name: 'Barba Terapia com Toalha Quente',
      category: 'barba',
      description: 'Ritual clássico de barbear com aplicação de toalha quente, espuma densa, navalha afiada e pós-barba.',
      durationMinutes: 30,
      priceInCents: 3000,
      popular: true,
      badge: null,
      image: '/images/hero-bg-2.webp',
    },
    {
      slug: 'combo-corte-barba',
      name: 'Combo Cabelo & Barba',
      category: 'combo',
      description: 'A transformação completa: corte estilizado acompanhado do ritual clássico de barba na toalha quente.',
      durationMinutes: 60,
      priceInCents: 6000,
      popular: true,
      badge: 'Completo',
      image: '/images/hero-bg.webp',
    },
    {
      slug: 'luzes-cabelo',
      name: 'Luzes / Mechas Masculinas',
      category: 'quimica',
      description: 'Técnica de descoloração sutil ou marcante com produtos que preservam a integridade dos fios.',
      durationMinutes: 90,
      priceInCents: 9000,
      popular: false,
      badge: null,
      image: '/images/hero-bg-2.webp',
    },
    {
      slug: 'platinado-global',
      name: 'Platinado Global',
      category: 'quimica',
      description: 'Descoloração global com matização profissional para atingir o tom branco/prata perfeito.',
      durationMinutes: 120,
      priceInCents: 15000,
      popular: false,
      badge: 'Exclusivo',
      image: '/images/hero-bg.webp',
    },
  ];

  for (const srv of servicesData) {
    await prisma.service.upsert({
      where: { slug: srv.slug },
      update: srv,
      create: srv,
    });
  }

  // 6. Barbeiros da Equipe
  console.log('📌 Populando Barbeiros...');
  const barbersData = [
    {
      name: 'Henrique Becker',
      role: 'Mestre Barbeiro & Especialista em Navalha',
      photoUrl: '/images/hero-bg-2.webp',
      bio: 'Fundador da Beck Barbearia, especialista em visagismo masculino, cortes clássicos e toalha quente.',
      active: true,
    },
  ];

  for (const barb of barbersData) {
    const existing = await prisma.barber.findFirst({ where: { name: barb.name } });
    if (!existing) {
      await prisma.barber.create({ data: barb });
    }
  }

  // 7. Regras do Clube da Barba
  console.log('📌 Populando Regras do Clube da Barba...');
  const rulesData = [
    {
      step: 1,
      icon: 'calendar',
      title: 'Segunda a Quarta',
      description: 'Atendimentos do Clube válidos exclusivamente de segunda a quarta-feira nos horários normais.',
    },
    {
      step: 2,
      icon: 'weekdays',
      title: 'Sem Limite de Visitas',
      description: 'Venha quantas vezes quiser dentro do mês para manter o corte e a barba sempre em dia.',
    },
    {
      step: 3,
      icon: 'payment',
      title: 'Mensalidade Fixa',
      description: 'Cobrança mensal recorrente com total transparência e cancelamento fácil a qualquer momento.',
    },
    {
      step: 4,
      icon: 'lock',
      title: 'Uso Pessoal & Intransferível',
      description: 'O plano é de uso exclusivo do assinante cadastrado, identificado pelo CPF ou telefone.',
    },
  ];

  const existingRules = await prisma.planRule.count();
  if (existingRules === 0) {
    for (const rule of rulesData) {
      await prisma.planRule.create({ data: rule });
    }
  }

  // 8. Assinantes Iniciais Oficiais
  console.log('📌 Populando Assinantes Iniciais...');
  const initialSubs = [
    {
      customerName: 'Carlos Eduardo Ramos',
      customerPhone: '48991234567',
      customerEmail: 'carlos.ramos@gmail.com',
      planSlug: 'corte-barba',
      planName: 'Corte + Barba',
      priceInCents: 15990,
      status: 'active',
      startDate: '2026-02-01',
      nextBillingDate: '2026-03-01',
    },
    {
      customerName: 'Rodrigo Silveira',
      customerPhone: '48998765432',
      customerEmail: 'rodrigo.silveira@outlook.com',
      planSlug: 'corte',
      planName: 'Cabelo',
      priceInCents: 9990,
      status: 'active',
      startDate: '2026-02-10',
      nextBillingDate: '2026-03-10',
    },
    {
      customerName: 'Marcos Vinicius Lima',
      customerPhone: '48984112233',
      customerEmail: 'marcos.v@hotmail.com',
      planSlug: 'barba',
      planName: 'Barba',
      priceInCents: 8990,
      status: 'active',
      startDate: '2026-01-20',
      nextBillingDate: '2026-02-20',
    },
  ];

  for (const sub of initialSubs) {
    const existing = await prisma.subscription.findFirst({
      where: { customerEmail: sub.customerEmail },
    });
    if (!existing) {
      await prisma.subscription.create({ data: sub });
    }
  }

  // 9. Administrador Padrão (Henrique)
  console.log('📌 Populando AdminUser (Henrique)...');
  await prisma.adminUser.upsert({
    where: { username: 'henrique' },
    update: {
      name: 'Henrique',
      password: hashPassword('183834@Hlj'),
      role: 'admin',
    },
    create: {
      username: 'henrique',
      name: 'Henrique',
      password: hashPassword('183834@Hlj'),
      role: 'admin',
    },
  });

  console.log('✅ Seed executado com sucesso no Supabase PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
