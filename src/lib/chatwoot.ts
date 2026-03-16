const CHATWOOT_TOKEN = () => process.env.CHATWOOT_API_TOKEN!;
const CHATWOOT_API = "https://app.chatwoot.com/api/v1/accounts/142956";
const ASSESSMENT_INBOX_ID = 100342;

interface ChatwootResponse {
  ok: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

async function chatwootFetch(path: string, options: RequestInit = {}): Promise<ChatwootResponse> {
  const res = await fetch(`${CHATWOOT_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      api_access_token: CHATWOOT_TOKEN(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Chatwoot API error [${res.status}] ${path}:`, body);
    return { ok: false, data: null };
  }

  const data = await res.json();
  return { ok: true, data };
}

// ============================================================
// Search
// ============================================================

/**
 * Search contact by phone first, then by email as fallback.
 * Returns the full contact object (id + existing custom_attributes).
 */
async function searchContact(
  phone?: string,
  email?: string
): Promise<{ id: number; custom_attributes: Record<string, string | number> } | null> {
  // Try phone first (matching n8n flow)
  if (phone) {
    const cleanNumber = phone.replace(/\D/g, "");
    if (cleanNumber.length >= 10) {
      const res = await chatwootFetch(`/contacts/search?q=${encodeURIComponent(cleanNumber)}`);
      if (res.ok) {
        const match = res.data?.payload?.find(
          (c: { phone_number: string }) =>
            c.phone_number && c.phone_number.replace(/\D/g, "").includes(cleanNumber)
        );
        if (match) {
          return { id: match.id, custom_attributes: match.custom_attributes || {} };
        }
      }
    }
  }

  // Fallback to email
  if (email) {
    const res = await chatwootFetch(`/contacts/search?q=${encodeURIComponent(email)}`);
    if (res.ok) {
      const match = res.data?.payload?.find(
        (c: { email: string }) => c.email?.toLowerCase() === email.toLowerCase()
      );
      if (match) {
        return { id: match.id, custom_attributes: match.custom_attributes || {} };
      }
    }
  }

  return null;
}

// ============================================================
// Create / Update
// ============================================================

/**
 * Create contact with inbox_id (so it gets a source_id for conversations).
 */
async function createContact(data: {
  name: string;
  email: string;
  phone?: string;
  customAttributes: Record<string, string | number | null>;
}): Promise<{ contactId: number; sourceId: string; inboxId: number } | null> {
  const cleanPhone = data.phone ? `+${data.phone.replace(/\D/g, "")}` : undefined;

  const res = await chatwootFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone_number: cleanPhone,
      identifier: cleanPhone?.replace(/\D/g, "") || data.email,
      inbox_id: ASSESSMENT_INBOX_ID,
      custom_attributes: data.customAttributes,
    }),
  });

  if (!res.ok || !res.data?.payload?.contact?.id) return null;

  const contact = res.data.payload.contact;
  const contactInbox = contact.contact_inboxes?.[0];

  return {
    contactId: contact.id,
    sourceId: contactInbox?.source_id || "",
    inboxId: res.data.payload.contact_inbox?.inbox?.id || ASSESSMENT_INBOX_ID,
  };
}

/**
 * Update contact custom attributes (merges with existing).
 */
async function updateContactAttributes(
  contactId: number,
  customAttributes: Record<string, string | number | null>
): Promise<void> {
  await chatwootFetch(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify({ custom_attributes: customAttributes }),
  });
}

// ============================================================
// Conversations
// ============================================================

/**
 * Get existing conversations for a contact.
 */
async function getContactConversations(
  contactId: number
): Promise<{ id: number; custom_attributes: Record<string, string | number> } | null> {
  const res = await chatwootFetch(`/contacts/${contactId}/conversations`);
  if (!res.ok) return null;

  const conv = res.data?.payload?.[0];
  if (!conv) return null;

  return { id: conv.id, custom_attributes: conv.custom_attributes || {} };
}

/**
 * Create a new conversation for a contact.
 */
async function createConversation(
  contactId: number,
  initialMessage: string,
  customAttributes: Record<string, string | number | null>
): Promise<number | null> {
  const res = await chatwootFetch("/conversations", {
    method: "POST",
    body: JSON.stringify({
      contact_id: contactId,
      inbox_id: ASSESSMENT_INBOX_ID,
      custom_attributes: customAttributes,
      message: {
        content: initialMessage,
        message_type: "outgoing",
      },
    }),
  });
  return res.data?.id || null;
}

/**
 * Update custom attributes on an existing conversation.
 */
async function updateConversationAttributes(
  conversationId: number,
  customAttributes: Record<string, string | number | null>
): Promise<void> {
  await chatwootFetch(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ custom_attributes: customAttributes }),
  });
}

// ============================================================
// Attribute builders
// ============================================================

interface QuizData {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  quizTitle: string;
  scoreGeral: number;
  scoreGeralLabel: string;
  dimensions: { name: string; emoji: string; normalizedScore: number }[];
  strongest: { name: string; emoji: string; normalizedScore: number };
  weakest: { name: string; emoji: string; normalizedScore: number };
  answerLabels?: Record<string, string>;
  utmParams?: Record<string, string>;
}

/**
 * Build custom attributes for the diagnostic quiz (Máquina de Receita).
 */
function buildCustomAttributes(
  data: QuizData,
  existingFatos?: string
): Record<string, string | number | null> {
  const conversionEvent = `Assessment ${data.quizTitle}`;

  // Build fatos (accumulate history like n8n)
  let fatos: string;
  if (!existingFatos) {
    fatos = `Lead veio do ${conversionEvent}`;
  } else {
    fatos = `${existingFatos}; Preencheu o ${conversionEvent}`;
  }

  const attrs: Record<string, string | number | null> = {
    fatos,
    produto: "Consultoria",
    assessment_nome: data.quizTitle,
    score_geral: data.scoreGeral,
    classificacao: data.scoreGeralLabel,
    alavanca_forte: `${data.strongest.name} (${data.strongest.normalizedScore}/100)`,
    alavanca_fraca: `${data.weakest.name} (${data.weakest.normalizedScore}/100)`,
  };

  // Dimension scores
  for (const dim of data.dimensions) {
    const key = `score_${dim.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")}`;
    attrs[key] = dim.normalizedScore;
  }

  // Answer labels (mapped by question property name)
  if (data.answerLabels) {
    for (const [key, value] of Object.entries(data.answerLabels)) {
      attrs[key] = value;
    }
  }

  // UTM parameters
  if (data.utmParams) {
    if (data.utmParams.utm_source) attrs.utm_source = data.utmParams.utm_source;
    if (data.utmParams.utm_medium) attrs.utm_medium = data.utmParams.utm_medium;
    if (data.utmParams.utm_campaign) attrs.utm_campaign = data.utmParams.utm_campaign;
    if (data.utmParams.utm_content) attrs.utm_content = data.utmParams.utm_content;
    if (data.utmParams.utm_term) attrs.utm_term = data.utmParams.utm_term;
  }

  return attrs;
}

/**
 * Build the initial conversation message with quiz results.
 */
function buildResultMessage(data: QuizData): string {
  const firstName = data.recipientName.split(" ")[0];
  const dimLines = data.dimensions
    .map((d) => `  ${d.emoji} ${d.name}: **${d.normalizedScore}/100**`)
    .join("\n");

  return `📊 **Resultado do ${data.quizTitle}**

Olá ${firstName}! Aqui está o resumo do seu diagnóstico:

**Score Geral: ${data.scoreGeral}/100** — ${data.scoreGeralLabel}

🟢 Alavanca mais forte: ${data.strongest.emoji} ${data.strongest.name} (${data.strongest.normalizedScore}/100)
🔴 Alavanca mais fraca: ${data.weakest.emoji} ${data.weakest.name} (${data.weakest.normalizedScore}/100)

**Suas 4 Alavancas:**
${dimLines}

Se quiser conversar sobre como melhorar seus resultados, estamos aqui! 🚀`;
}

// ============================================================
// Main sync function
// ============================================================

/**
 * Sync quiz result to Chatwoot (mirrors n8n flow):
 * 1. Search by phone → fallback email
 * 2. If found → update contact attrs + get/update conversation attrs
 * 3. If not found → create contact with inbox → create conversation
 * 4. Custom attributes on both contact AND conversation
 */
export async function syncToChatwoot(data: QuizData): Promise<{
  contactId: number | null;
  conversationId: number | null;
}> {
  if (!process.env.CHATWOOT_API_TOKEN) {
    console.error("Chatwoot: CHATWOOT_API_TOKEN not set, skipping sync");
    return { contactId: null, conversationId: null };
  }

  const existing = await searchContact(data.recipientPhone, data.recipientEmail);

  if (existing) {
    // ===== EXISTING CONTACT =====
    const customAttributes = buildCustomAttributes(
      data,
      existing.custom_attributes?.fatos as string | undefined
    );

    // Update contact attributes
    await updateContactAttributes(existing.id, customAttributes);
    console.log("Chatwoot: existing contact updated, id:", existing.id);

    // Get existing conversation and update attributes, or create new one
    const conv = await getContactConversations(existing.id);
    if (conv) {
      await updateConversationAttributes(conv.id, customAttributes);
      console.log("Chatwoot: existing conversation updated, id:", conv.id);
      return { contactId: existing.id, conversationId: conv.id };
    } else {
      const message = buildResultMessage(data);
      const conversationId = await createConversation(existing.id, message, customAttributes);
      console.log("Chatwoot: new conversation created for existing contact, id:", conversationId);
      return { contactId: existing.id, conversationId };
    }
  } else {
    // ===== NEW CONTACT =====
    const customAttributes = buildCustomAttributes(data);

    const created = await createContact({
      name: data.recipientName,
      email: data.recipientEmail,
      phone: data.recipientPhone,
      customAttributes,
    });

    if (!created) {
      console.error("Chatwoot: could not create contact for", data.recipientEmail);
      return { contactId: null, conversationId: null };
    }

    console.log("Chatwoot: new contact created, id:", created.contactId);

    // Create conversation with custom attributes
    const message = buildResultMessage(data);
    const conversationId = await createConversation(created.contactId, message, customAttributes);
    console.log("Chatwoot: conversation created, id:", conversationId);

    return { contactId: created.contactId, conversationId };
  }
}
