---
trigger: always_on
---

# GEMINI.md — Beck Barbearia Antigravity Protocol

Este arquivo define como o agente de IA deve se comportar exclusivamente neste repositório da Beck Barbearia.

---

## 💈 Protocolo de Execução Padrão

1. **Leitura Obrigatória Prévia**:
   - Sempre consulte [.agents/MEMORY.md](file:///.agents/MEMORY.md) e a skill [.agents/skills/beck-barbearia-core/SKILL.md](file:///.agents/skills/beck-barbearia-core/SKILL.md) antes de criar, alterar código ou sugerir comandos.
2. **Proibição de Dados Fakes / Mocks**:
   - Toda alteração que envolva planos, produtos, assinaturas, agendamentos e conteúdos deve conectar e persistir no **Supabase PostgreSQL**.
   - NUNCA reintroduza variáveis globais em memória como `global.__beck_*` ou arrays estáticos simulando banco.
3. **Upload Real de Imagens**:
   - Campos de foto nunca recebem URL por input de texto simples. Devem utilizar `ImageUploadField` conectado ao endpoint `/api/upload` e bucket `beck-media`.
4. **Design Sem Cara de IA**:
   - Sem emojis, sem faíscas decorativas (⚡, 🚀, ✨), sem excesso de ícones decorativos.
   - Padrão sóbrio e elegante: tipografia Cinzel + Inter, paleta preto, carvão, ouro velho e creme.
5. **Acessibilidade e GSAP**:
   - Animações via `useGSAP(scope)`. Parallax suave (`scrub: 1`).
   - Respeito a `prefers-reduced-motion` e mobile (`gsap.matchMedia`).
