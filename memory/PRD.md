# Beck Barbearia — PRD / Estado do Projeto

## Objetivo
Landing page premium + Clube da Barba + Gestão Completa (Admin CMS, Produtos, Página Sobre, Uploads de Imagens) para a **Beck Barbearia** em Balneário Arroio do Silva/SC.

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + React 18 + Tailwind CSS + Radix UI / Lucide
- **Animações**: GSAP 3.15 + `@gsap/react` (`useGSAP`, `ScrollTrigger` com `scrub: 1`, `matchMedia`)
- **Banco de Dados & Storage**: Supabase PostgreSQL + Supabase Storage (bucket público `beck-media`)
- **ORM**: Prisma 6 com provider PostgreSQL
- **Hospedagem**:
  - Frontend: **Vercel** (`barbeariabeck`) sob o domínio oficial `beckbarbearia.com.br` (DNS Cloudflare).
  - Backend na VPS: Containers Docker em `vps-backend/` (`api.beckbarbearia.com.br`).
- **Arquitetura de Dados**: 100% real no Supabase PostgreSQL (zero mocks em produção).
- **Upload de Fotos**: Sem campos de URL em texto. 100% upload de arquivos direto para o Supabase Storage.

## Diretrizes e Memória
Consulte a documentação viva em:
- [.agents/AGENTS.md](file:///.agents/AGENTS.md) — Diretrizes e regras invioláveis.
- [.agents/MEMORY.md](file:///.agents/MEMORY.md) — Memória detalhada da infraestrutura.
- [.agents/skills/beck-barbearia-core/SKILL.md](file:///.agents/skills/beck-barbearia-core/SKILL.md) — Skill operacional e comandos.
