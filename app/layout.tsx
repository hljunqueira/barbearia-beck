import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SITE } from '@/lib/site';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : undefined,
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/images/logo-removebg-preview.png', width: 536, height: 466, alt: SITE.name }],
  },
  icons: {
    icon: '/images/logo-removebg-preview.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);',
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-black font-sans text-brand-cream antialiased selection:bg-brand-gold selection:text-brand-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
