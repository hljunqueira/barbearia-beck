# Beck Barbearia — PRD / Estado do Projeto

## Objetivo
Landing page premium (preto / dourado / branco) + fundação técnica para a Beck Barbearia.

## Stack
- Next.js 15 (App Router) + TypeScript + React 18 + Tailwind 3.4 + shadcn (tokens)
- GSAP 3.15 + @gsap/react (useGSAP, ScrollTrigger, matchMedia)
- Prisma 6 (provider MongoDB, ids UUID) — schema em `prisma/schema.prisma`, client em `lib/prisma.ts`
- Server Actions: `app/actions/getPlans.ts`, `app/actions/getProducts.ts` (mock tipado)
- API REST espelho (read-only): `app/api/[[...path]]/route.ts` → `/api`, `/api/plans`, `/api/products`

## Arquitetura
- `app/page.tsx` = Server Component (busca planos/produtos via Server Actions)
- `components/HeroParallax.tsx` = Client Component; todas as animações GSAP isoladas aqui
  - `useGSAP` com `scope: useRef`, `ScrollTrigger` com `scrub: 1`
  - `gsap.matchMedia`: parallax só em `(min-width: 769px)` e sem `prefers-reduced-motion`
- Fonte de dados trocável em `lib/repositories.ts` (mock → Prisma → karfex)
- `lib/karfex.ts` = contrato reservado para a futura API karfex (checkout/assinaturas)
- `lib/site.ts` = config pública (WhatsApp via `NEXT_PUBLIC_WHATSAPP_NUMBER`, horários, endereço)

## Design System
- Cores: `brand.black #0A0A0A`, `brand.charcoal`, `brand.graphite`, `brand.gold #C9A227` (+light/dark), `brand.cream #F5F1E8`
- Fontes: Cinzel (display) + Inter (texto) via next/font
- Botão reutilizável: `components/BrandButton.tsx` (variants gold/outline/ghost/dark)
- Imagens `.webp` em `public/images` (logo, hero-bg, hero-bg-2, 6 produtos)

## Seções
Navbar fixa · Hero (parallax, logo, CTAs) · Marquee de serviços · Experiência · Clube da Barba (3 planos) · Produtos (6) · CTA final · Footer (#contato)

## Status
- MVP completo; backend testado (9/9 testes passando); frontend validado por screenshot (desktop + mobile)
- Pendências futuras: integração karfex (checkout), WhatsApp real, Prisma `db push` + seed, painel admin
