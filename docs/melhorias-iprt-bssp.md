# Melhorias — Assessment IPRT (BSSP Pós-Graduação)

**Origem:** Reunião Consultoria BSSP <> GLA — 11/03/2026
**Participantes:** Gabriel Costa (GLA), Fabio Rodrigues (BSSP), Edgar Madruga (BSSP), Thiago Pires (BSSP)
**Gravação:** Fireflies ID `01KJZASSD8A1YBJA2M3JKVN7AW`

---

## Contexto

A ferramenta IPRT (Índice de Prontidão para a Reforma Tributária) foi apresentada ao vivo para a equipe BSSP. A recepção foi muito positiva ("ficou bem mais interessante do que quando tinha ouvido só falar" — Fabio). A reunião gerou uma lista de ajustes a serem feitos antes do lançamento.

**Objetivo do lançamento:** semana de 17/03/2026 (testes iniciais).

---

## FASE 1 — Quick Wins (pré-lançamento)

### 1. Remover botão "Refazer diagnóstico"

**Quem pediu:** Gabriel Costa
**Contexto:** "É uma distração, no final eu só quero que o cara converta, fale com a gente. Vou tirar esse refazer diagnóstico."

**Arquivo:** `src/components/IPRTResultView.tsx` (linhas 718-723)

**Implementação:**
```diff
- <button
-   onClick={() => window.location.reload()}
-   className="result-secondary-cta"
- >
-   Refazer diagnóstico
- </button>
```

Simplesmente remover o botão. Sem substituição.

**Esforço:** 5 minutos

---

### 2. CTA WhatsApp flutuante (sticky) no mobile

**Quem pediu:** Gabriel Costa
**Contexto:** "Esse call to action vira um bannerzinho que flutua, você vai navegando e tem um bannerzinho te acompanhando o tempo inteiro."

**Arquivo:** `src/components/IPRTResultView.tsx` + `src/app/globals.css`

**Implementação:**

Transformar o CTA principal "Falar com um especialista BSSP" (atualmente linhas 709-717) em um banner fixo no rodapé da tela.

```tsx
{/* Sticky CTA — fora do container principal, no final do componente */}
<div className="iprt-sticky-cta">
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="result-primary-cta"
    onClick={handleCtaClick}
  >
    Falar com um especialista BSSP
  </a>
</div>
```

CSS:
```css
.iprt-sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 12px 20px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, #ffffff 70%, transparent);
}

.iprt-sticky-cta .result-primary-cta {
  display: block;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}
```

Obs: O `paddingBottom: 90` do container principal (linha 413) já prevê espaço para o sticky. Manter.

**Esforço:** 15 minutos

---

### 3. WhatsApp com mensagem pré-preenchida (score + interesse)

**Quem pediu:** Gabriel Costa
**Contexto:** "Dá pra já vir com uma mensagem: 'Fiz o IPRT e quero saber mais sobre a especialização. Índice tal.' Porque aí o vendedor já sabe a zica do cara."

**Arquivo:** `src/components/IPRTResultView.tsx`

**Implementação:**

Gerar a URL do WhatsApp dinamicamente com `text` query param:

```tsx
const whatsappMessage = encodeURIComponent(
  `Olá! Fiz o diagnóstico IPRT e gostaria de saber mais sobre a Especialização em Reforma Tributária.\n\n` +
  `Meu índice: ${result.iprtScore}% (${result.stage})\n` +
  `Maior lacuna: ${result.weakestDimension.name} (${result.weakestDimension.percentage}%)\n` +
  `Perfil: ${result.qualification.perfil}`
);

// Se ctaWhatsappUrl já tem o número (ex: https://wa.me/5511999999999)
const whatsappUrl = ctaWhatsappUrl
  ? `${ctaWhatsappUrl}?text=${whatsappMessage}`
  : `#`;
```

Usar essa URL em ambos os CTAs (o inline antigo e o novo sticky).

**Esforço:** 10 minutos

---

## FASE 2 — Melhorias de engajamento (pós-lançamento imediato)

### 4. Share aprimorado: "Compartilhe" ao invés de "Baixar imagem"

**Quem pediu:** Gabriel Costa, Fabio Rodrigues, Thiago (BSSP)
**Contexto:** "Ao invés de baixar a imagem, a gente bota a imagem já e fala 'compartilhe isso aqui'. Compartilhar no story, LinkedIn." — "O pessoal aqui geralmente a galera gosta muito de compartilhar no LinkedIn."

**Arquivo:** `src/components/IPRTResultView.tsx` (linhas 667-685)

**Implementação:**

1. Mostrar preview da brag tag inline (não esconder o canvas)
2. Usar Web Share API quando disponível (mobile nativo), com fallback para download

```tsx
const handleShare = async () => {
  // Gerar imagem no canvas primeiro
  const canvas = canvasRef.current;
  if (!canvas) return;

  await generateBragTag(); // gera no canvas

  // Tentar Web Share API (mobile)
  if (navigator.share && navigator.canShare) {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `iprt-${firstName.toLowerCase()}.png`, { type: "image/png" });
      try {
        await navigator.share({
          title: `Meu IPRT: ${result.iprtScore}%`,
          text: `Fiz o diagnóstico de prontidão para a Reforma Tributária e meu índice é ${result.iprtScore}% (${result.stage}). Faça o seu também!`,
          files: [file],
        });
      } catch {
        // User cancelled share — fallback to download
        downloadImage(canvas);
      }
    }, "image/png");
  } else {
    // Desktop fallback — download
    downloadImage(canvas);
  }
};
```

3. Mudar label do botão:
```tsx
<button onClick={handleShare} className="diagnostic-brag-btn">
  📤 Compartilhar meu resultado
</button>
```

**Esforço:** 30 minutos

---

### 5. Condicionar destaque do share à nota alta

**Quem pediu:** Gabriel Costa
**Contexto:** "Dificilmente alguém com nota ruim vai compartilhar. A gente dá destaque ao share quando o cara tira nota boa."

**Arquivo:** `src/components/IPRTResultView.tsx`

**Implementação:**

- Se `stage === "Pronto para Liderar"` ou `"Em Construção"` (score > 55%): mostrar o share com destaque, posição proeminente, com copy de incentivo ("Mostre ao mercado que você está preparado!")
- Se score <= 55%: manter share discreto (menor, sem destaque)

```tsx
const showProminentShare = result.iprtScore > 55;

{showProminentShare ? (
  <div className="iprt-share-prominent">
    <p style={{ fontSize: 15, fontWeight: 600, color: "#166534", textAlign: "center" }}>
      Mostre ao mercado que você está preparado!
    </p>
    <button onClick={handleShare} className="diagnostic-brag-btn diagnostic-brag-btn--highlight">
      📤 Compartilhar meu resultado
    </button>
  </div>
) : (
  <div style={{ textAlign: "center", marginTop: 16 }}>
    <button onClick={handleShare} className="diagnostic-brag-btn diagnostic-brag-btn--subtle">
      Baixar resultado (imagem)
    </button>
  </div>
)}
```

**Esforço:** 15 minutos

---

## FASE 3 — Dependências externas (aguardando BSSP)

### 6. Revisão de perguntas, respostas e gabarito

**Quem pediu:** Gabriel Costa (para Fabio e Edgar)
**Contexto:** "Vocês conferirem pergunta a pergunta, resposta a resposta, tudo no detalhe." / "Pode mandar áudio no grupo de feedback, que a gente transcreve tudo."

**Status:** BLOQUEADO — aguardando feedback da BSSP

**Arquivo afetado:** Tabela `ax_bssp_q` no Supabase (perguntas e opções)

**Ação necessária:**
- Fabio e Edgar revisam as 15 perguntas, validam alternativas e gabarito
- Enviam feedback (áudio ou texto)
- Equipe Merlin atualiza no Supabase

**Impacto:** Pode afetar scoring se gabarito mudar. Testar `scoring-iprt.ts` após alterações.

---

### 7. Validação dos nomes dos 4 pilares

**Quem pediu:** Edgar Madruga
**Contexto:** "Eu queria dormir com isso, só pra pensar se tem alguma coisa diferente. Inicialmente, não tenho objeção."

**Status:** AGUARDANDO confirmação do Edgar

**Pilares atuais:**
1. Domínio Normativo (DN)
2. Aplicação Prática (AP)
3. Preparação Operacional (PO)
4. Visão Estratégica (VE)

**Arquivos afetados se mudar:**
- Tabela `ax_bssp_q` (campo `dimensions`)
- `src/lib/scoring-iprt.ts` (mapeamento de categorias)
- `src/components/IPRTResultView.tsx` (GAP_COPY, PROFILE_COPY, STAGE_COPY)

**Obs de Gabriel:** "Pra gente é muito ridículo de fazer mudar, então não tem problema não."

---

### 8. Vídeos de recomendação por lacuna

**Quem pediu:** Gabriel Costa
**Contexto:** "Algum vídeo nosso, algum conteúdo nosso, algum recurso, uma aula. Pra ele entender 'minha recomendação para vocês é isso'."

**Status:** BLOQUEADO — depende de a BSSP fornecer URLs de vídeos/conteúdos

**Implementação prevista:**

Adicionar um mapeamento de dimensão → vídeo recomendado:

```tsx
const DIMENSION_VIDEOS: Record<string, { title: string; url: string; thumbnail?: string }> = {
  DN: { title: "Fundamentos da Reforma Tributária", url: "https://..." },
  AP: { title: "Aplicação Prática: Casos Reais", url: "https://..." },
  PO: { title: "Como preparar seu escritório", url: "https://..." },
  VE: { title: "Oportunidades estratégicas da reforma", url: "https://..." },
};
```

Renderizar na seção de resultados, após a análise personalizada:

```tsx
<div className="diag-card diag-card--blue">
  <div className="diag-card__header">
    <span>🎬</span>
    <span className="diag-card__title">CONTEÚDO RECOMENDADO</span>
  </div>
  <p className="diag-card__text">
    Com base no seu resultado, esse conteúdo pode ajudar a fechar seus gaps:
  </p>
  {/* Embed ou link para vídeo da dimensão mais fraca */}
</div>
```

**Esforço:** 30 minutos (após receber URLs)

---

## FASE 4 — Integrações técnicas (responsabilidade Thiago/BSSP)

### 9. Integração com RD Station

**Quem pediu:** Thiago (BSSP)
**Contexto:** BSSP usa RD Station + CRM Água. Atualmente a ferramenta integra com HubSpot.

**Status:** A DEFINIR — duas opções:

**Opção A — API RD Station direto:**
- Adicionar endpoint `/api/quiz/sync-rd` que envia lead + dados do diagnóstico para RD Station via API
- Campos: nome, email, telefone, iprt_score, stage, weakest_dimension, lead_category
- Criar custom fields no RD Station para os dados do IPRT

**Opção B — Webhook genérico:**
- Thiago configura um webhook no lado BSSP
- Nossa API envia POST com payload padronizado ao completar o quiz
- Thiago roteia para RD Station e CRM Água

**Recomendação:** Opção B é mais desacoplada e mais rápida de implementar.

**Arquivo afetado:** `src/app/api/quiz/submit/route.ts` (adicionar webhook call pós-save)

---

### 10. Configuração de pixel

**Quem pediu:** Gabriel / Thiago
**Contexto:** "Thiago tem pixels também pra configurar."

**Status:** AGUARDANDO IDs de pixel da BSSP

**Implementação:**
- Adicionar Meta Pixel e/ou Google Tag ao layout do quiz BSSP
- Disparar eventos: `Lead` (ao capturar dados), `CompleteRegistration` (ao completar quiz)
- Pode ser feito via `quiz.settings` no Supabase (campo `tracking`)

---

### 11. Fluxo automático de WhatsApp para leads preocupantes

**Quem pediu:** Gabriel Costa
**Contexto:** "Se o cara respondeu isso, isso, isso, a gente manda um WhatsApp pra ele: 'Vi que você respondeu o diagnóstico, tá preocupante, quer conversar?'"

**Status:** FASE FUTURA — depende da integração com RD Station/CRM Água

**Fluxo proposto:**
1. Lead completa quiz → dados vão pro RD Station (via integração #9)
2. RD Station dispara automação baseada em `lead_category === "quente"` e `iprtScore <= 55`
3. Automação envia mensagem via WhatsApp Business API com texto personalizado

**Responsabilidade:** Thiago (BSSP) configura a automação no RD Station.

---

## FASE 5 — Features futuras (pós-validação)

### 12. Mecânica de desbloqueio por indicação

**Contexto:** "Tem 3 vídeos aqui que podem te ajudar. O primeiro tá liberado. Se você quiser liberar os outros dois, convida uma pessoa."

**Implementação:** Requer sistema de referral tracking (link único por respondente + tracking de conversões). Complexidade alta. Priorizar após validação do modelo base.

---

### 13. Gamificação com brindes

**Contexto:** "Se você trouxer 50 pessoas, eu te dou um moletom." / Edgar sugeriu brindes (mochilas, canecas) como substituto de descontos.

**Decisão da reunião:** "Talvez a gente comece rodando sem, pra começar logo, e aí a gente melhora depois, pra gente ter mais velocidade."

---

### 14. Campanha com micro-influenciadores

**Contexto:** Mapear alunos com audiência relevante, criar conteúdo + rodar anúncio para o público deles.

**Responsabilidade:** Gabriel (estratégia) + BSSP (mapeamento de alunos)

---

## Resumo de prioridades

| Fase | Item | Esforço | Bloqueio | Responsável |
|------|------|---------|----------|-------------|
| **1** | Remover "Refazer diagnóstico" | 5 min | Nenhum | Merlin Dev |
| **1** | CTA sticky flutuante | 15 min | Nenhum | Merlin Dev |
| **1** | WhatsApp pré-preenchido | 10 min | Nenhum | Merlin Dev |
| **2** | Share aprimorado (Web Share API) | 30 min | Nenhum | Merlin Dev |
| **2** | Share condicional (nota alta) | 15 min | Nenhum | Merlin Dev |
| **3** | Revisão perguntas/gabarito | Variável | Feedback BSSP | BSSP + Merlin Dev |
| **3** | Validação nomes dos pilares | Variável | Confirmação Edgar | BSSP |
| **3** | Vídeos por lacuna | 30 min | URLs da BSSP | BSSP + Merlin Dev |
| **4** | Integração RD Station | 2-4h | Definição de approach | Thiago + Merlin Dev |
| **4** | Pixels de tracking | 30 min | IDs de pixel | Thiago |
| **4** | WhatsApp automático | — | Integração RD | Thiago |
| **5** | Referral/desbloqueio | Alto | Validação modelo | Merlin Dev |
| **5** | Gamificação/brindes | — | Decisão de negócio | BSSP + GLA |
| **5** | Micro-influenciadores | — | Mapeamento | BSSP + GLA |

---

## Arquivos impactados (Fase 1 + 2)

| Arquivo | Mudanças |
|---------|----------|
| `src/components/IPRTResultView.tsx` | Remover "Refazer", sticky CTA, WhatsApp dinâmico, Web Share API, share condicional |
| `src/app/globals.css` | Classes `.iprt-sticky-cta`, `.diagnostic-brag-btn--highlight`, `.diagnostic-brag-btn--subtle` |

## O que NÃO muda

- Score card com donut + dimension bars
- STAGE_COPY, GAP_COPY, PROFILE_COPY (textos atuais validados)
- Neutralizadores ("Mito: ainda tem tempo" / "Mito: dá pra aprender sozinho")
- Análise personalizada via IA (Claude)
- Lead scoring (quente/morno/frio)
- Integração HubSpot (mantida como está; RD Station é adicional)
- Lógica de scoring (`scoring-iprt.ts`)
- Brag tag canvas (base mantida, apenas muda o botão de ação)
