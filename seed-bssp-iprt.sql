-- ============================================================
-- BSSP IPRT Assessment — Supabase Seed
-- ============================================================

-- 1. Insert the quiz
INSERT INTO assessment_quizzes (id, slug, title, description, dimensions, settings, prompt_template, is_published)
VALUES (
  'b5510000-0000-0000-0000-000000000001',
  'iprt-reforma-tributaria',
  'Índice de Prontidão para a Reforma Tributária',
  'Descubra seu Índice de Prontidão para a Reforma Tributária — e onde estão suas maiores lacunas antes que o novo sistema entre em vigor.',
  '[
    {"code": "DN", "name": "Domínio Normativo", "emoji": "📖", "description": "Conhecimento técnico das novas regras — IBS, CBS, Imposto Seletivo, Split Payment, Simples Nacional."},
    {"code": "AP", "name": "Aplicação Prática", "emoji": "⚙️", "description": "Capacidade de traduzir as regras para a realidade dos clientes — precificação, contratos, planejamento tributário, sistemas."},
    {"code": "PO", "name": "Preparação Operacional", "emoji": "🔧", "description": "Se o profissional está de fato agindo — sistemas, processos, equipe, contratos, timeline."},
    {"code": "VE", "name": "Visão Estratégica", "emoji": "🔭", "description": "Se o profissional enxerga as oportunidades de mercado que a reforma cria, não só os riscos."}
  ]'::jsonb,
  '{
    "platform": "BSSP Centro Educacional",
    "duration": "7 minutos",
    "target_audience": "Contadores, advogados tributaristas, administradores e gestores financeiros",
    "eligibility_rules": {},
    "tie_break_priority": [],
    "quiz_type": "iprt",
    "sections": [
      {"label": "Perfil", "categories": ["qualificacao"]},
      {"label": "Domínio Normativo", "categories": ["dominio_normativo"]},
      {"label": "Aplicação Prática", "categories": ["aplicacao_pratica"]},
      {"label": "Preparação", "categories": ["preparacao_operacional", "visao_estrategica"]}
    ],
    "transitions_before_section": {
      "0": ["bssp-social-proof"]
    },
    "transitions_after_section": {
      "0": ["bssp-social-proof"],
      "1": ["bssp-aplicacao-intro"]
    }
  }'::jsonb,
  '',
  true
);

-- 2. Insert questions

-- ============================================================
-- BLOCO 1: QUALIFICAÇÃO (Q1-Q3) — Não pontuam
-- ============================================================

-- Q1 — Perfil Profissional
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0001-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  0,
  'Qual sua principal área de atuação?',
  'single_choice',
  'qualificacao',
  '[
    {"id": "q1_contabilidade", "label": "Contabilidade ou Assessoria contábil", "scores": {}},
    {"id": "q1_advocacia", "label": "Advocacia tributária", "scores": {}},
    {"id": "q1_administracao", "label": "Administração ou Gestão financeira", "scores": {}},
    {"id": "q1_outro", "label": "Outro", "scores": {}}
  ]'::jsonb
);

-- Q2 — Escala de Impacto
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0002-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  1,
  'Quantos clientes ou empresas que você atende serão diretamente impactados pela Reforma Tributária?',
  'single_choice',
  'qualificacao',
  '[
    {"id": "q2_nenhum", "label": "Nenhum ou não sei", "scores": {}},
    {"id": "q2_1a10", "label": "1 a 10", "scores": {}},
    {"id": "q2_11a50", "label": "11 a 50", "scores": {}},
    {"id": "q2_mais50", "label": "Mais de 50", "scores": {}}
  ]'::jsonb
);

-- Q3 — Investimento em Formação
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0003-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  2,
  'Qual seu principal investimento em formação sobre a Reforma Tributária até agora?',
  'single_choice',
  'qualificacao',
  '[
    {"id": "q3_noticias", "label": "Acompanho por notícias e conteúdos gratuitos", "scores": {}},
    {"id": "q3_webinars", "label": "Participei de webinars, palestras ou eventos gratuitos", "scores": {}},
    {"id": "q3_cursos", "label": "Fiz cursos curtos ou workshops pagos", "scores": {}},
    {"id": "q3_pos", "label": "Fiz ou estou fazendo pós-graduação ou especialização no tema", "scores": {}}
  ]'::jsonb
);

-- ============================================================
-- BLOCO 2: DOMÍNIO NORMATIVO (Q4-Q7) — 10 pontos cada
-- ============================================================

-- Q4 — Split Payment vs. Substituição Tributária
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0004-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  3,
  'Sobre o Split Payment no novo modelo tributário, é correto afirmar que:',
  'single_choice',
  'dominio_normativo',
  '[
    {"id": "q4_a", "label": "Funciona de forma similar à substituição tributária atual, antecipando o recolhimento na cadeia.", "value": 0, "scores": {"DN": 0}},
    {"id": "q4_b", "label": "Atua na liquidação financeira, segregando automaticamente o tributo no momento do pagamento, sem antecipar fato gerador.", "value": 10, "scores": {"DN": 10}},
    {"id": "q4_c", "label": "Será opcional para empresas com faturamento abaixo de R$4,8 milhões.", "value": 0, "scores": {"DN": 0}},
    {"id": "q4_d", "label": "Substitui integralmente a substituição tributária em todos os setores a partir de 2027.", "value": 0, "scores": {"DN": 0}}
  ]'::jsonb
);

-- Q5 — Transição 2026
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0005-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  4,
  'Sobre o início da transição em 2026, é correto afirmar:',
  'single_choice',
  'dominio_normativo',
  '[
    {"id": "q5_a", "label": "O IBS e a CBS já serão cobrados em suas alíquotas definitivas, substituindo PIS/Cofins integralmente.", "value": 0, "scores": {"DN": 0}},
    {"id": "q5_b", "label": "Os valores recolhidos de IBS e CBS nesse período são compensáveis com PIS/Cofins — e se não houver débito suficiente, podem ser ressarcidos em até 60 dias.", "value": 10, "scores": {"DN": 10}},
    {"id": "q5_c", "label": "Empresas do Simples Nacional deverão recolher IBS e CBS separadamente, por fora do DAS, obrigatoriamente.", "value": 0, "scores": {"DN": 0}},
    {"id": "q5_d", "label": "A transição em 2026 é apenas teórica — nenhum recolhimento efetivo será exigido.", "value": 0, "scores": {"DN": 0}}
  ]'::jsonb
);

-- Q6 — Simples Nacional
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0006-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  5,
  'Sobre o Simples Nacional na Reforma Tributária, é correto afirmar:',
  'single_choice',
  'dominio_normativo',
  '[
    {"id": "q6_a", "label": "Empresas do Simples não serão impactadas — o regime se mantém integralmente como é hoje.", "value": 0, "scores": {"DN": 0}},
    {"id": "q6_b", "label": "As empresas podem optar por recolher IBS/CBS pelo regime regular, o que permite transferência integral de créditos mas sujeita às obrigações acessórias do regime regular.", "value": 10, "scores": {"DN": 10}},
    {"id": "q6_c", "label": "O Simples Nacional será extinto gradualmente durante o período de transição.", "value": 0, "scores": {"DN": 0}},
    {"id": "q6_d", "label": "Clientes que compram de empresas do Simples poderão se creditar da alíquota padrão de IBS/CBS, independentemente do regime escolhido.", "value": 0, "scores": {"DN": 0}}
  ]'::jsonb
);

-- Q7 — Neutralidade vs. Redução de Carga
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0007-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  6,
  'Com a unificação dos tributos sobre consumo em IBS e CBS, qual a afirmação correta sobre a carga tributária?',
  'single_choice',
  'dominio_normativo',
  '[
    {"id": "q7_a", "label": "A carga total do país vai diminuir significativamente — esse é o principal objetivo da simplificação.", "value": 0, "scores": {"DN": 0}},
    {"id": "q7_b", "label": "A reforma visa neutralidade arrecadatória global, mas a distribuição entre setores muda — alguns pagarão mais, outros menos.", "value": 10, "scores": {"DN": 10}},
    {"id": "q7_c", "label": "Todos os setores pagarão menos, porque a unificação elimina a cumulatividade residual.", "value": 0, "scores": {"DN": 0}},
    {"id": "q7_d", "label": "A alíquota única garante igualdade tributária entre todos os setores da economia.", "value": 0, "scores": {"DN": 0}}
  ]'::jsonb
);

-- ============================================================
-- BLOCO 3: APLICAÇÃO PRÁTICA (Q8-Q11) — 10 pontos cada
-- ============================================================

-- Q8 — Cenário: Preço do Cliente
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0008-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  7,
  'Um cliente do setor de serviços te procura preocupado: "Com a Reforma, o preço dos meus serviços vai subir?" Qual a melhor resposta?',
  'single_choice',
  'aplicacao_pratica',
  '[
    {"id": "q8_a", "label": "Sim, a alíquota do IVA é maior que o ISS atual, então o preço vai subir.", "value": 0, "scores": {"AP": 0}},
    {"id": "q8_b", "label": "Não, a simplificação vai reduzir custos operacionais e compensar qualquer aumento.", "value": 0, "scores": {"AP": 0}},
    {"id": "q8_c", "label": "Depende — preciso analisar sua cadeia de custos, créditos recuperáveis e o impacto líquido no seu setor específico antes de responder.", "value": 10, "scores": {"AP": 10}},
    {"id": "q8_d", "label": "Por enquanto não muda nada, a transição é gradual — vamos aguardar.", "value": 0, "scores": {"AP": 0}}
  ]'::jsonb
);

-- Q9 — Cenário: Contratos de Longo Prazo
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0009-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  8,
  'Você está revisando contratos de longo prazo de um cliente com vigência até 2030. Em relação à Reforma Tributária, qual a principal ação?',
  'single_choice',
  'aplicacao_pratica',
  '[
    {"id": "q9_a", "label": "Incluir cláusula de reequilíbrio econômico-financeiro para proteger margens durante a transição.", "value": 10, "scores": {"AP": 10}},
    {"id": "q9_b", "label": "Não é necessário alterar contratos vigentes — a reforma não afeta relações contratuais em andamento.", "value": 0, "scores": {"AP": 0}},
    {"id": "q9_c", "label": "Basta atualizar a nomenclatura dos tributos de ICMS/ISS para IBS/CBS.", "value": 0, "scores": {"AP": 0}},
    {"id": "q9_d", "label": "Aguardar a regulamentação completa para revisar todos os contratos de uma só vez.", "value": 0, "scores": {"AP": 0}}
  ]'::jsonb
);

-- Q10 — Cenário: Planejamento Tributário Antigo
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0010-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  9,
  'Um cliente pede que você mantenha a estratégia de planejamento tributário baseada em incentivos fiscais estaduais (guerra fiscal). Qual sua orientação?',
  'single_choice',
  'aplicacao_pratica',
  '[
    {"id": "q10_a", "label": "Manter a estratégia atual aproveitando os benefícios enquanto existirem, sem mudanças.", "value": 0, "scores": {"AP": 0}},
    {"id": "q10_b", "label": "Alertar que benefícios de guerra fiscal perdem razão de existir no modelo de tributação no destino, e propor revisão estratégica imediata.", "value": 10, "scores": {"AP": 10}},
    {"id": "q10_c", "label": "Migrar os benefícios para o Imposto Seletivo, que substitui os incentivos estaduais.", "value": 0, "scores": {"AP": 0}},
    {"id": "q10_d", "label": "Aguardar posição do Comitê Gestor do IBS sobre manutenção dos incentivos.", "value": 0, "scores": {"AP": 0}}
  ]'::jsonb
);

-- Q11 — Cenário: ERP e Split Payment
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0011-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  10,
  'O gestor financeiro de um cliente pergunta: "Preciso mexer no meu sistema fiscal agora ou posso esperar a reforma entrar em vigor de fato?" Sua resposta:',
  'single_choice',
  'aplicacao_pratica',
  '[
    {"id": "q11_a", "label": "Pode esperar — os fornecedores de ERP vão atualizar automaticamente quando for obrigatório.", "value": 0, "scores": {"AP": 0}},
    {"id": "q11_b", "label": "Recomendo mapear agora as adequações necessárias — o Split Payment exige integração entre sistema fiscal e financeiro que não existe hoje na maioria das empresas.", "value": 10, "scores": {"AP": 10}},
    {"id": "q11_c", "label": "Basta trocar de ERP para um sistema que já anuncie compatibilidade com a Reforma.", "value": 0, "scores": {"AP": 0}},
    {"id": "q11_d", "label": "O sistema fiscal muda pouco — a Reforma é principalmente sobre alíquotas.", "value": 0, "scores": {"AP": 0}}
  ]'::jsonb
);

-- ============================================================
-- BLOCO 4: PREPARAÇÃO OPERACIONAL (Q12-Q13) — 20 pontos total
-- ============================================================

-- Q12 — Checklist de Ações Realizadas (multiple_choice)
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0012-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  11,
  'Das ações abaixo, quais você ou seu escritório/empresa já realizou?',
  'multiple_choice',
  'preparacao_operacional',
  '[
    {"id": "q12_mapeamento", "label": "Mapeamento de impacto nos principais clientes ou setores", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_erp", "label": "Revisão de parametrizações fiscais no ERP", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_fluxo", "label": "Análise de impacto no fluxo de caixa com o Split Payment", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_contratos", "label": "Revisão de contratos de longo prazo com cláusulas de transição", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_treinamento", "label": "Treinamento da equipe fiscal e/ou financeira sobre o novo modelo", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_simulacao", "label": "Simulação de cenários de precificação sob as novas regras", "value": 1, "scores": {"PO": 1}},
    {"id": "q12_nenhuma", "label": "Nenhuma das anteriores", "value": 0, "scores": {"PO": 0}}
  ]'::jsonb
);

-- Q13 — Estágio de Preparação
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0013-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  12,
  'Em que estágio está sua preparação prática para a Reforma Tributária?',
  'single_choice',
  'preparacao_operacional',
  '[
    {"id": "q13_a", "label": "Acompanhando notícias e aguardando definições mais claras.", "value": 0, "scores": {"PO": 0}},
    {"id": "q13_b", "label": "Estudando o tema, mas ainda sem ações concretas de preparação.", "value": 3, "scores": {"PO": 3}},
    {"id": "q13_c", "label": "Já iniciei mapeamento de impactos e algumas adequações em clientes ou empresa.", "value": 7, "scores": {"PO": 7}},
    {"id": "q13_d", "label": "Tenho plano de transição em execução — sistemas, contratos, equipe, precificação.", "value": 10, "scores": {"PO": 10}}
  ]'::jsonb
);

-- ============================================================
-- BLOCO 5: VISÃO ESTRATÉGICA (Q14-Q15) — 20 pontos total
-- ============================================================

-- Q14 — Percepção de Impacto na Carreira
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0014-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  13,
  'Qual o MAIOR impacto da Reforma Tributária na sua carreira nos próximos 3 anos?',
  'single_choice',
  'visao_estrategica',
  '[
    {"id": "q14_a", "label": "Mais complexidade e trabalho operacional para me adaptar.", "value": 3, "scores": {"VE": 3}},
    {"id": "q14_b", "label": "Risco de perder clientes para profissionais mais atualizados.", "value": 5, "scores": {"VE": 5}},
    {"id": "q14_c", "label": "Oportunidade de me posicionar como especialista num mercado que vai precisar muito de orientação qualificada.", "value": 10, "scores": {"VE": 10}},
    {"id": "q14_d", "label": "Não vejo impacto significativo na minha atuação profissional.", "value": 0, "scores": {"VE": 0}}
  ]'::jsonb
);

-- Q15 — Oportunidades Mapeadas (multiple_choice)
INSERT INTO assessment_questions (id, quiz_id, order_index, text, type, category, options)
VALUES (
  'b5510001-0015-0000-0000-000000000001',
  'b5510000-0000-0000-0000-000000000001',
  14,
  'Das oportunidades de mercado que a Reforma Tributária cria, para quantas você já está se preparando?',
  'multiple_choice',
  'visao_estrategica',
  '[
    {"id": "q15_consultoria", "label": "Consultoria de transição tributária", "value": 1, "scores": {"VE": 1}},
    {"id": "q15_contratos", "label": "Revisão massiva de contratos empresariais", "value": 1, "scores": {"VE": 1}},
    {"id": "q15_advisory", "label": "Advisory para precificação estratégica", "value": 1, "scores": {"VE": 1}},
    {"id": "q15_treinamentos", "label": "Treinamentos corporativos in-company", "value": 1, "scores": {"VE": 1}},
    {"id": "q15_cadeia", "label": "Reestruturação de cadeias de fornecimento", "value": 1, "scores": {"VE": 1}},
    {"id": "q15_nenhuma", "label": "Nenhuma — ainda não mapeei oportunidades", "value": 0, "scores": {"VE": 0}}
  ]'::jsonb
);
