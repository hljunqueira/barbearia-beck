# Beck Barbearia — Diretrizes e Regras do Projeto (AGENTS.md)

Este arquivo contém as diretrizes fundamentais, convenções e regras que **TODOS** os agentes de IA devem seguir estritamente ao trabalhar neste repositório.

---

## 💈 Contexto Rápido do Projeto

- **Nome**: Beck Barbearia — Barbearia Tradicional & Clube da Barba
- **Domínio Oficial**: [https://beckbarbearia.com.br](https://beckbarbearia.com.br) (DNS gerenciado no Cloudflare)
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + GSAP 3.15 + Radix UI / Lucide (Hospedado na **Vercel**, projeto `barbeariabeck`)
- **Backend na VPS**: Container Docker na VPS de Produção (serviço backend, cron e proxy reverso para `api.beckbarbearia.com.br` em `vps-backend/`)
- **Banco de Dados**: **Supabase PostgreSQL** (`https://xjajzltltrlpdfrpinae.supabase.co`) via Prisma ORM e `@supabase/supabase-js`
- **Ambiente Local**: `npm run dev` na porta `3000` (`http://localhost:3000`)

---

## 🚫 Regras Obrigatórias e Invioláveis

1. **Sem Endereços IP Brutos**:
   - NUNCA inclua endereços IP públicos brutos (como IPv4 numéricos) na documentação, código, logs ou mensagens.
   - Utilize sempre os nomes de domínio (`beckbarbearia.com.br`, `api.beckbarbearia.com.br`), referências de host (`vps-beck`, `db.supabase`) ou `localhost`.

2. **Leitura Obrigatória no Início da Conversa**:
   - Ao iniciar qualquer atendimento neste repositório, consulte [.agents/MEMORY.md](file:///.agents/MEMORY.md) e [.agents/skills/beck-barbearia-core/SKILL.md](file:///.agents/skills/beck-barbearia-core/SKILL.md) para obter o mapa completo do banco de dados, frontend, backend e fluxos de trabalho.

3. **Sem Dados Fakes / Mocks em Produção**:
   - Não utilize arrays em memória (`global.__beck_*`, `MOCK_*`) como fonte definitiva de dados.
   - Toda persistência de assinantes, agendamentos, planos, serviços e produtos deve ler e gravar em dados reais no **Supabase PostgreSQL**.

4. **Diretrizes de UI, GSAP & Parallax**:
   - Sempre utilize o hook oficial `useGSAP()` com `scope: containerRef` ao invés de `useEffect` para gerenciar animações GSAP e evitar memory leaks.
   - Animações atreladas ao scroll devem usar `scrub: true` ou `scrub: 1`.
   - Respeite acessibilidade: desative efeitos pesados ou parallax se `prefers-reduced-motion` estiver ativo ou em telas mobile menores que 768px (`gsap.matchMedia`).
   - Mantenha a identidade visual premium: Paleta preta (`#0A0A0A`), grafite, carvão, dourado (`#C9A227`) e creme (`#F5F1E8`), fontes Cinzel (display) e Inter (sans).
   - Utilize sempre `<Image />` do Next.js com imagens `.webp` e carregamento otimizado.

5. **Client vs Server Components**:
   - Mantenha os componentes o mais próximos do servidor (Server Components) possível para SEO e velocidade.
   - Isole interações (`useGSAP`, `onClick`, modais, formulários) em Client Components pequenos com `'use client'`.

6. **Preservação de Schemas e Contratos**:
   - Toda alteração em modelos de dados deve ser refletida em `prisma/schema.prisma`, `types/index.ts` e executada via `npx prisma db push`.
   - Valide sempre `npx tsc --noEmit` ou `npm run build` após edições estruturais.

---

## 🔗 Links Úteis do Projeto

- [README.md](file:///README.md)
- [MEMORY.md](file:///.agents/MEMORY.md)
- [SKILL - Beck Barbearia Core](file:///.agents/skills/beck-barbearia-core/SKILL.md)
- [Guia DNS Cloudflare](file:///docs/DNS_CLOUDFLARE_GUIA.md)
- [Prisma Schema](file:///prisma/schema.prisma)
- [Supabase Client](file:///lib/supabase.ts)
- [Repositórios de Dados](file:///lib/repositories.ts)
- [Tipos Globais](file:///types/index.ts)
