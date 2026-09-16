---
name: beck-barbearia-core
description: Skill operacional e guia mestre da Beck Barbearia. Gerencia migrações Prisma com Supabase PostgreSQL, uploads para o bucket beck-media, build e deploy na Vercel e containers na VPS.
---

# Beck Barbearia Core — Skill Operacional

Esta skill reúne todos os procedimentos técnicos, comandos e fluxos de trabalho da **Beck Barbearia**.

---

## 1. Banco de Dados & Prisma (Supabase PostgreSQL)

### Comandos Essenciais
- **Gerar Prisma Client**:
  ```bash
  npx prisma generate
  ```
- **Sincronizar Schema no Supabase PostgreSQL**:
  ```bash
  npx prisma db push
  ```
- **Popular o Banco com o Seed Oficial**:
  ```bash
  node scripts/seed.mjs
  ```
- **Abrir Prisma Studio para Gestão Visual**:
  ```bash
  npx prisma studio
  ```

---

## 2. Uploads de Fotos (Supabase Storage)

- **Bucket Público**: `beck-media`
- **Tamanho Máximo por Imagem**: 10MB
- **Formatos Aceitos**: `.webp`, `.png`, `.jpg`, `.jpeg`, `.avif`
- **Endpoint da API**: `POST /api/upload` (envio de FormData com campo `file`)
- **Regra**: Nunca use inputs de texto de URL manual para fotos. Sempre utilize o componente `ImageUploadField`.

---

## 3. Desenvolvimento e Build

- **Ambiente Local**:
  ```bash
  npm run dev
  ```
  Acessível em `http://localhost:3000`.
- **Verificação de Tipos TypeScript**:
  ```bash
  npx tsc --noEmit
  ```
- **Build de Produção**:
  ```bash
  npm run build
  ```

---

## 4. Frontend na Vercel & Domínio Oficial

- **Domínio**: `https://beckbarbearia.com.br`
- **DNS**: Gerenciado no Cloudflare com SSL Full (Strict) apontando para `cname.vercel-dns.com`.
- **Variáveis de Ambiente na Vercel**:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`

---

## 5. Backend na VPS de Produção (`vps-backend/`)

- Quando os dados de acesso da VPS forem disponibilizados, o deploy é realizado com:
  ```bash
  cd vps-backend
  docker compose up -d --build
  ```
- O proxy reverso Caddy/Nginx gerencia SSL automático para `api.beckbarbearia.com.br`.
