import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { ProductsCatalog } from '@/components/ProductsCatalog';
import { getAllProducts } from '@/app/actions/getProducts';
import { getSiteContent } from '@/app/actions/siteContentActions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Catálogo de Produtos & Bar | Beck Barbearia',
  description:
    'Conheça a linha completa de produtos para cabelo e barba, além das bebidas geladas e cervejas especiais da Beck Barbearia em Balneário Arroio do Silva/SC.',
};

export default async function ProdutosPage() {
  const [products, siteContent] = await Promise.all([
    getAllProducts(),
    getSiteContent(),
  ]);

  const fullAddress = `${siteContent?.addressStreet || 'Avenida Barriga Verde, 300'}, ${
    siteContent?.addressDistrict || 'Centro'
  } - ${siteContent?.addressCity || 'Balneário Arroio do Silva'}/${
    siteContent?.addressState || 'SC'
  }`;

  return (
    <>
      <Navbar
        logoUrl={siteContent?.logoUrl}
        whatsappNumber={siteContent?.whatsappNumber}
      />

      <main className="min-h-screen bg-brand-black text-brand-cream pt-20">
        {/* Barra Superior de Navegação & Botão de Volta */}
        <section className="border-b border-white/10 bg-[#121212] py-4">
          <div className="container flex items-center justify-between">
            <Link
              href="/#produtos"
              className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-brand-gold hover:text-brand-cream transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Voltar ao Início</span>
            </Link>

            <span className="text-[11px] font-mono text-brand-cream/40 hidden sm:inline-block">
              {products.length} itens cadastrados
            </span>
          </div>
        </section>

        {/* Cabeçalho Editorial */}
        <section className="container max-w-4xl pt-12 pb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-brand-gold/60" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
              Linha Exclusiva &amp; Bar
            </span>
            <span className="h-px w-8 bg-brand-gold/60" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-cream">
            Catálogo Completo &amp; Bar
          </h1>

          <p className="mt-4 text-sm sm:text-base text-brand-cream/70 max-w-2xl mx-auto font-light leading-relaxed">
            Pomadas de alta fixação, óleos nutritivos para barba e tônicos para cuidados diários, acompanhados de cervejas geladas e energéticos disponíveis na barbearia.
          </p>
        </section>

        {/* Grade do Catálogo com Abas, Busca e Filtros */}
        <section className="container pb-28">
          <ProductsCatalog
            products={products}
            allowCategoryFilter={true}
            allowSearch={true}
            defaultTab="cosmetics"
          />
        </section>
      </main>

      <Footer
        logoUrl={siteContent?.logoUrl}
        whatsappNumber={siteContent?.whatsappNumber}
        whatsappDisplay={siteContent?.whatsappDisplay}
        addressText={fullAddress}
        mapsUrl={siteContent?.mapsUrl}
        instagramUrl={siteContent?.instagramUrl}
        hours={siteContent?.hoursJson || undefined}
      />
      <FloatingWhatsApp whatsappNumber={siteContent?.whatsappNumber} />
    </>
  );
}
