# Guia de Configuração de DNS no Cloudflare — Beck Barbearia

Este guia documenta o passo a passo exato para configurar a zona de DNS do domínio oficial **`beckbarbearia.com.br`** no Cloudflare, integrando o Frontend na **Vercel** e o Backend na **VPS de Produção**.

---

## 1. Tabela de Registros de DNS no Cloudflare

Acesse o painel do Cloudflare, selecione a zona `beckbarbearia.com.br` e clique em **DNS > Records**:

| Tipo | Nome | Conteúdo / Destino | Proxy Status | Finalidade |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` | `cname.vercel-dns.com` | **DNS Only (Cinza)** ou **Proxied (Laranja)** | Aponta o domínio raiz para o frontend Next.js na Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | **Proxied (Laranja)** | Redireciona `www.beckbarbearia.com.br` para a Vercel |
| **A** | `api` | `<IP_DA_VPS>` *(preencher quando fornecer os dados)* | **DNS Only (Cinza)** inicialmente | Subdomínio dedicado à API/Backend na VPS Docker |
| **A** | `vps` | `<IP_DA_VPS>` *(opcional para SSH/gestão)* | **DNS Only (Cinza)** | Acesso direto ao servidor VPS |

> [!TIP]
> **Dica para ativação na Vercel**: Ao adicionar o domínio `beckbarbearia.com.br` no painel da Vercel pela primeira vez, mantenha o registro CNAME como **DNS Only (nuvem cinza)** por 5 minutos até a Vercel emitir o certificado Let's Encrypt. Após a validação verde na Vercel, você pode reativar o **Proxy do Cloudflare (nuvem laranja)** para ter proteção DDoS e CDN global.

---

## 2. Configurações Obrigatórias de SSL/TLS no Cloudflare

Acesse o menu **SSL/TLS** no painel da zona `beckbarbearia.com.br`:

1. **Modo de Criptografia SSL/TLS**:
   - Selecione **Full (strict)** / **Completo (estrito)**.
   - *Por que*: Garante que a comunicação entre o Cloudflare e a Vercel/VPS seja 100% criptografada de ponta a ponta.
2. **Edge Certificates**:
   - Ative a opção **Always Use HTTPS** (Sempre usar HTTPS).
   - Ative a opção **Automatic HTTPS Rewrites**.
   - Defina **Minimum TLS Version** como `TLS 1.2`.

---

## 3. Configuração do Domínio no Painel da Vercel

1. Acesse o projeto **`barbeariabeck`** na Vercel (`https://vercel.com/henriques-projects-31af9234/barbeariabeck/settings/domains`).
2. Adicione os dois domínios:
   - `beckbarbearia.com.br` (definir como Recommended / Principal)
   - `www.beckbarbearia.com.br` (com redirecionamento automático para `beckbarbearia.com.br`)
3. A Vercel verificará os registros CNAME configurados no Cloudflare e ativará o deploy com SSL automático.

---

## 4. Subdomínio da API (`api.beckbarbearia.com.br`) na VPS

Assim que você disponibilizar o IP e acesso SSH da sua VPS:
1. O registro tipo `A` com nome `api` apontará para o IP da sua VPS.
2. O container Docker em `vps-backend/` utilizará o proxy Caddy/Nginx com certificado SSL automático para responder em `https://api.beckbarbearia.com.br`.
