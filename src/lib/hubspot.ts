const HUBSPOT_TOKEN = () => process.env.HUBSPOT_PRIVATE_APP_TOKEN!;
const HUBSPOT_API = "https://api.hubapi.com";

async function hubspotFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_TOKEN()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`HubSpot API error [${res.status}] ${path}:`, body);
    return null;
  }

  return res.json();
}

// === Question → HubSpot property mapping (by order_index) ===
// Maps each quiz question to a HubSpot property name
const QUESTION_PROPERTY_MAP: Record<number, string> = {
  0: "ax_faturamento",
  1: "ax_papel",
  2: "ax_crm",
  3: "ax_sentimento_crescimento",
  4: "ax_confianca_1",
  5: "ax_confianca_2",
  6: "ax_confianca_3",
  7: "ax_confianca_4",
  8: "ax_confianca_5",
  9: "ax_demanda_1",
  10: "ax_demanda_2",
  11: "ax_demanda_3",
  12: "ax_demanda_4",
  13: "ax_vendas_1",
  14: "ax_vendas_2",
  15: "ax_vendas_3",
  16: "ax_vendas_4",
  17: "ax_vendas_5",
  18: "ax_expansao_1",
  19: "ax_expansao_2",
  20: "ax_expansao_3",
  21: "ax_expansao_4",
  22: "ax_preco_1",
  23: "ax_preco_2",
  24: "ax_preco_3",
  25: "ax_preco_4",
  26: "ax_custo_inacao",
};

// Dimension code → HubSpot score property
const DIMENSION_SCORE_MAP: Record<string, string> = {
  GD: "ax_score_demanda",
  EV: "ax_score_vendas",
  EB: "ax_score_expansao",
  PP: "ax_score_preco",
};

// Dimension code → readable name
const DIMENSION_NAME_MAP: Record<string, string> = {
  GD: "Geração de Demanda",
  EV: "Eficiência em Vendas",
  EB: "Expansão de Base",
  PP: "Posicionamento & Preço",
};

export interface QuizAnswer {
  question_id: string;
  selected_option_id: string | string[];
}

export interface QuestionInfo {
  id: string;
  order_index: number;
  options: { id: string; label: string }[];
}

export interface ComputedScores {
  scoreGeral: number;
  dimensions: {
    code: string;
    label: string;
    normalizedScore: number;
  }[];
}

/**
 * Map quiz answers to HubSpot property values.
 * Resolves option IDs to readable labels.
 */
function mapAnswersToProperties(
  answers: QuizAnswer[],
  questions: QuestionInfo[],
  scores: ComputedScores | null
): Record<string, string> {
  const props: Record<string, string> = {};

  // Build question lookup by ID
  const questionById = new Map(questions.map((q) => [q.id, q]));

  // Map each answer to its HubSpot property
  for (const answer of answers) {
    const question = questionById.get(answer.question_id);
    if (!question) continue;

    const propName = QUESTION_PROPERTY_MAP[question.order_index];
    if (!propName) continue;

    // Resolve option ID(s) to label(s)
    const optionIds = Array.isArray(answer.selected_option_id)
      ? answer.selected_option_id
      : [answer.selected_option_id];

    const labels = optionIds
      .map((optId) => question.options.find((o) => o.id === optId)?.label)
      .filter(Boolean);

    if (labels.length > 0) {
      props[propName] = labels.join("; ");
    }
  }

  // Map scores
  if (scores) {
    props.ax_score_geral = String(scores.scoreGeral);
    props.ax_score_label = getScoreLabel(scores.scoreGeral);

    let strongest = { code: "", score: -1 };
    let weakest = { code: "", score: 101 };

    for (const dim of scores.dimensions) {
      const scoreProp = DIMENSION_SCORE_MAP[dim.code];
      if (scoreProp) {
        props[scoreProp] = String(dim.normalizedScore);
      }
      if (dim.normalizedScore > strongest.score) {
        strongest = { code: dim.code, score: dim.normalizedScore };
      }
      if (dim.normalizedScore < weakest.score) {
        weakest = { code: dim.code, score: dim.normalizedScore };
      }
    }

    if (strongest.code) {
      props.ax_alavanca_forte = `${DIMENSION_NAME_MAP[strongest.code] || strongest.code} (${strongest.score}/100)`;
    }
    if (weakest.code) {
      props.ax_alavanca_fraca = `${DIMENSION_NAME_MAP[weakest.code] || weakest.code} (${weakest.score}/100)`;
    }
  }

  return props;
}

function getScoreLabel(score: number): string {
  if (score >= 81) return "Máquina Afinada";
  if (score >= 61) return "Em Aceleração";
  if (score >= 41) return "Crescimento Vulnerável";
  if (score >= 21) return "Na Armadilha";
  return "Alerta Vermelho";
}

/**
 * Create or update a HubSpot contact with all quiz data.
 * Uses email as dedup key.
 * Returns the HubSpot contact ID.
 */
export async function upsertContact({
  email,
  firstName,
  lastName,
  phone,
  quizName,
  answers,
  questions,
  scores,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  quizName: string;
  answers?: QuizAnswer[];
  questions?: QuestionInfo[];
  scores?: ComputedScores | null;
}): Promise<string | null> {
  const properties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    lead_source: `Assessment ${quizName}`,
    produto: "Consultoria",
  };

  if (phone) {
    properties.phone = phone;
  }

  // Map quiz answers and scores to HubSpot properties
  if (answers && questions) {
    const quizProps = mapAnswersToProperties(answers, questions, scores || null);
    Object.assign(properties, quizProps);
  }

  // Try to create first
  const createRes = await hubspotFetch("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  if (createRes?.id) {
    return createRes.id;
  }

  // If contact already exists (409 conflict), update by email
  const searchRes = await hubspotFetch("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            { propertyName: "email", operator: "EQ", value: email },
          ],
        },
      ],
      limit: 1,
    }),
  });

  const existingId = searchRes?.results?.[0]?.id;
  if (!existingId) return null;

  // Update existing contact
  await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });

  return existingId;
}

/**
 * Create a deal in HubSpot and associate it to a contact.
 */
export async function createDeal({
  contactId,
  contactName,
  quizName,
}: {
  contactId: string;
  contactName: string;
  quizName: string;
}): Promise<string | null> {
  const result = await hubspotFetch("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        dealname: `Consultoria — ${contactName}`,
        dealstage: "1219760709",
        evento_de_conversao: `Assessment ${quizName}`,
        produto: "Consultoria",
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3, // deal-to-contact
            },
          ],
        },
      ],
    }),
  });

  return result?.id || null;
}
