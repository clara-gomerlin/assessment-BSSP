const HUBSPOT_TOKEN = () => process.env.HUBSPOT_PRIVATE_APP_TOKEN!;
const HUBSPOT_API = "https://api.hubapi.com";

interface HubSpotResponse {
  ok: boolean;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

async function hubspotFetch(path: string, options: RequestInit = {}): Promise<HubSpotResponse> {
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
    return { ok: false, status: res.status, data: null };
  }

  const data = await res.json();
  return { ok: true, status: res.status, data };
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
  utmParams,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  quizName: string;
  utmParams?: Record<string, string>;
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

  if (utmParams) {
    if (utmParams.utm_source) properties.utm_source = utmParams.utm_source;
    if (utmParams.utm_medium) properties.utm_medium = utmParams.utm_medium;
    if (utmParams.utm_campaign) properties.utm_campaign = utmParams.utm_campaign;
    if (utmParams.utm_content) properties.utm_content = utmParams.utm_content;
    if (utmParams.utm_term) properties.utm_term = utmParams.utm_term;
  }

  // Try to create contact
  const createRes = await hubspotFetch("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  if (createRes.ok && createRes.data?.id) {
    return createRes.data.id;
  }

  // If contact already exists (409 conflict) or creation failed, search by email
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

  const existingId = searchRes.data?.results?.[0]?.id;
  if (!existingId) {
    console.error("HubSpot: could not create or find contact for", email);
    return null;
  }

  // Update existing contact with standard properties
  await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });

  return existingId;
}

/**
 * Create a deal in HubSpot and associate it to a contact.
 * Includes quiz answer and score properties on the deal.
 */
export async function createDeal({
  contactId,
  contactName,
  contactEmail,
  contactPhone,
  quizName,
  answers,
  questions,
  scores,
  utmParams,
}: {
  contactId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  quizName: string;
  utmParams?: Record<string, string>;
  answers?: QuizAnswer[];
  questions?: QuestionInfo[];
  scores?: ComputedScores | null;
}): Promise<string | null> {
  const properties: Record<string, string> = {
    dealname: contactName,
    pipeline: "823967148",
    dealstage: "1219760709",
    evento_de_conversao: `Assessment ${quizName}`,
    produto: "Consultoria",
  };

  if (contactEmail) {
    properties.email = contactEmail;
  }
  if (contactPhone) {
    properties.phone = contactPhone;
  }

  if (utmParams) {
    if (utmParams.utm_source) properties.utm_source = utmParams.utm_source;
    if (utmParams.utm_medium) properties.utm_medium = utmParams.utm_medium;
    if (utmParams.utm_campaign) properties.utm_campaign = utmParams.utm_campaign;
    if (utmParams.utm_content) properties.utm_content = utmParams.utm_content;
    if (utmParams.utm_term) properties.utm_term = utmParams.utm_term;
  }

  // Map quiz answers and scores to deal properties
  if (answers && questions) {
    const quizProps = mapAnswersToProperties(answers, questions, scores || null);
    Object.assign(properties, quizProps);
    // Map ax_papel to cargo (HubSpot select field)
    if (quizProps.ax_papel) {
      const cargoMap: Record<string, string> = {
        "Fundador / CEO": "Diretor/C-Level",
        "C-level / VP (Vendas, Receita, Operações)": "Diretor/C-Level",
        "C-level / VP (Marketing, Growth)": "Diretor/C-Level",
        "Gerente / Coordenador": "Gerente/Head",
        "Analista / Assistente": "Analista/Especialista",
      };
      properties.cargo = cargoMap[quizProps.ax_papel] || "Diretor/C-Level";
    }
  }

  const result = await hubspotFetch("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({
      properties,
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

  return result.data?.id || null;
}
