# Beck Barbearia — Memória do Projeto (MEMORY.md)

Este documento contém a memória persistente, o mapeamento de infraestrutura e o estado técnico da **Beck Barbearia — Barbearia Tradicional & Clube da Barba**.

---

## 💈 1. Contexto Geral e Diretrizes Invioláveis

- **Nome Comercial**: Beck Barbearia
- **Slogan Oficial**: "Estilo não é moda, é atitude" | "Chegou, sentou, é seu!"
- **Endereço Oficial**: Avenida Barriga Verde, 300 — Centro, Balneário Arroio do Silva/SC
- **WhatsApp Oficial**: +55 48 9957-8323 (`554899578323`)
- **Domínio Oficial**: [https://beckbarbearia.com.br](https://beckbarbearia.com.br)
- **Regras Invioláveis**:
  1. **Sem Endereços IP Brutos**: NUNCA utilizar IPs numéricos em código, docs ou mensagens. Usar `beckbarbearia.com.br`, `api.beckbarbearia.com.br`, `vps-beck` ou `localhost`.
  2. **Sem Mocks em Produção**: Todas as consultas e gravações de assinantes, agendamentos, planos, serviços, produtos e conteúdos do site são persistidas no PostgreSQL real do Supabase.
  3. **Zero Campos de URL para Imagens**: Todos os cadastros e edições de imagem no painel administrativo utilizam upload direto de arquivo (`ImageUploadField`) com envio para o bucket `beck-media` do Supabase Storage.
  4. **Design Sóbrio Sem Cara de IA**: Visual clássico masculino, editorial, sem emojis decorativos (⚡, 🚀, ✂️), sem ícones decorativos repetidos e com tipografia Cinzel + Inter.

---

## 🌐 2. Domínio, Cloudflare DNS & Hospedagem

### 2.1 Domínio `beckbarbearia.com.br` (DNS no Cloudflare)
- **Frontend (Vercel)**:
  - Tipo: `CNAME` | Nome: `@` (ou A record `76.76.21.21` via flattening) | Destino: `cname.vercel-dns.com`
  - Tipo: `CNAME` | Nome: `www` | Destino: `cname.vercel-dns.com`
  - SSL/TLS Cloudflare: **Full (Strict)**
- **Backend na VPS (Container Docker em `vps-backend/`)**:
  - Tipo: `A` | Nome: `api` | Destino: `<HOST_DA_VPS>` (aguardando dados da VPS)
  - Subdomínio: `https://api.beckbarbearia.com.br`
- **Vercel Project**:
  - Projeto: `barbeariabeck`
  - Project ID: `prj_8yffirIxX2kjaMzLUGyBf5SExCLx`
  - Organização: `team_c2RRUlx6FWBp7uQVwnrgI2Si`

---

## 🗄️ 3. Banco de Dados & Storage (Supabase PostgreSQL)

- **Supabase Project URL**: `https://xjajzltltrlpdfrpinae.supabase.co`
- **Project Ref**: `xjajzltltrlpdfrpinae`
- **Direct Connection Host**: `db.xjajzltltrlpdfrpinae.supabase.co:5432`
- **Pooler Connection**: `aws-0-sa-east-1.pooler.supabase.com:6543` (Transaction Pooler)
- **Storage Bucket Público**: `beck-media` (armazena fotos de produtos, banners e fotos do espaço)
  - Endpoint público de visualização: `https://xjajzltltrlpdfrpinae.supabase.co/storage/v1/object/public/beck-media/<arquivo>`

### 3.1 Mapeamento das Tabelas (Prisma / PostgreSQL)
1. **`SiteContent`**: Conteúdo dinâmico da Landing Page (Hero, slogans, endereço, telefones, horários de atendimento, avisos do Clube).
2. **`AboutContent`**: Conteúdo dinâmico da Página Sobre (história da barbearia, manifesto da navalha tradicional, perfil do fundador, galeria).
3. **`Product`**: Produtos para barba e cabelo (pomada, óleo, balm, kit), preços, fotos via upload e estoque.
4. **`Service`**: Serviços avulsos da barbearia (corte masculino, barba na navalha, combo, luzes, platinado).
5. **`Plan`**: Planos mensais do Clube da Barba (Cabelo R$ 99,90, Barba R$ 89,90, Corte + Barba R$ 159,90).
6. **`Barber`**: Barbeiros da equipe da barbearia (nome, foto via upload, bio, status ativo).
7. **`Subscription`**: Assinantes ativos do Clube da Barba, histórico e próximo vencimento.
8. **`Appointment`**: Agendamentos da barbearia (regras estritas para o Clube da Barba: seg a qua).
9. **`PlanRule`**: Regras oficiais de funcionamento do Clube da Barba.
10. **`AdminUser`**: Usuários administradores do sistema com senha criptografada via scrypt (Usuário padrão: `henrique` / `Henrique`).

---


## 🖥️ 4. Estrutura da Aplicação

- **`app/page.tsx`**: Landing page oficial com animações GSAP Parallax (`components/HeroParallax.tsx`), tabela de serviços, planos do clube e produtos lidos do PostgreSQL.
- **`app/sobre/page.tsx`**: Página institucional editorial da Beck Barbearia.
- **`app/admin/page.tsx`**: Painel de controle completo (Assinaturas, Agenda, Produtos, Página Inicial, Página Sobre).
- **`app/assinante/page.tsx`**: Portal do assinante para agendamento online de segunda a quarta-feira.
- **`components/admin/ImageUploadField.tsx`**: Componente de upload de imagens sem campo de URL de texto.
- **`vps-backend/`**: Estrutura Docker pronta para subir na VPS assim que o usuário fornecer os dados.
