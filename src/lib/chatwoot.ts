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

/**
 * Search for an existing contact by email.
 */
async function searchContact(email: string): Promise<number | null> {
  const res = await chatwootFetch(`/contacts/search?q=${encodeURIComponent(email)}`);
  if (!res.ok) return null;

  const match = res.data?.payload?.find(
    (c: { email: string }) => c.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id || null;
}

/**
 * Create a new contact.
 */
async function createContact(data: {
  name: string;
  email: string;
  phone?: string;
  customAttributes: Record<string, string | number>;
}): Promise<number | null> {
  const res = await chatwootFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone_number: data.phone || undefined,
      custom_attributes: data.customAttributes,
    }),
  });
  return res.data?.payload?.contact?.id || null;
}

/**
 * Update custom attributes on an existing contact.
 */
async function updateContactAttributes(
  contactId: number,
  customAttributes: Record<string, string | number>
): Promise<void> {
  await chatwootFetch(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify({ custom_attributes: customAttributes }),
  });
}

/**
 * Create a conversation for a contact in the Assessment inbox.
 */
async function createConversation(
  contactId: number,
  initialMessage: string
): Promise<number | null> {
  const res = await chatwootFetch("/conversations", {
    method: "POST",
    body: JSON.stringify({
      contact_id: contactId,
      inbox_id: ASSESSMENT_INBOX_ID,
      message: {
        content: initialMessage,
        message_type: "outgoing",
      },
    }),
  });
  return res.data?.id || null;
}

/**
 * Build quiz result custom attributes for Chatwoot contact.
 */
function buildQuizAttributes(data: {
  quizTitle: string;
  scoreGeral: number;
  scoreGeralLabel: string;
  dimensions: { name: string; normalizedScore: number }[];
  strongest: { name: string; normalizedScore: number };
  weakest: { name: string; normalizedScore: number };
}): Record<string, string | number> {
  const attrs: Record<string, string | number> = {
    assessment_nome: data.quizTitle,
    assessment_score: data.scoreGeral,
    assessment_classificacao: data.scoreGeralLabel,
    assessment_alavanca_forte: `${data.strongest.name} (${data.strongest.normalizedScore}/100)`,
    assessment_alavanca_fraca: `${data.weakest.name} (${data.weakest.normalizedScore}/100)`,
  };

  for (const dim of data.dimensions) {
    const key = `assessment_${dim.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")}`;
    attrs[key] = dim.normalizedScore;
  }

  return attrs;
}

/**
 * Build the initial conversation message with quiz results.
 */
function buildResultMessage(data: {
  recipientName: string;
  quizTitle: string;
  scoreGeral: number;
  scoreGeralLabel: string;
  dimensions: { name: string; emoji: string; normalizedScore: number }[];
  strongest: { name: string; emoji: string; normalizedScore: number };
  weakest: { name: string; emoji: string; normalizedScore: number };
}): string {
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

/**
 * Main function: sync quiz result to Chatwoot.
 * Searches for contact, creates if not found, updates attributes, creates conversation.
 */
export async function syncToChatwoot(data: {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  quizTitle: string;
  scoreGeral: number;
  scoreGeralLabel: string;
  dimensions: { name: string; emoji: string; normalizedScore: number }[];
  strongest: { name: string; emoji: string; normalizedScore: number };
  weakest: { name: string; emoji: string; normalizedScore: number };
}): Promise<{ contactId: number | null; conversationId: number | null }> {
  if (!process.env.CHATWOOT_API_TOKEN) {
    console.error("Chatwoot: CHATWOOT_API_TOKEN not set, skipping sync");
    return { contactId: null, conversationId: null };
  }

  const customAttributes = buildQuizAttributes(data);

  // 1. Search or create contact
  let contactId = await searchContact(data.recipientEmail);

  if (contactId) {
    // Update existing contact with quiz attributes
    await updateContactAttributes(contactId, customAttributes);
  } else {
    // Create new contact with quiz attributes
    contactId = await createContact({
      name: data.recipientName,
      email: data.recipientEmail,
      phone: data.recipientPhone,
      customAttributes,
    });
  }

  if (!contactId) {
    console.error("Chatwoot: could not create or find contact for", data.recipientEmail);
    return { contactId: null, conversationId: null };
  }

  console.log("Chatwoot: contact synced, id:", contactId);

  // 2. Create conversation with result message
  const message = buildResultMessage(data);
  const conversationId = await createConversation(contactId, message);

  console.log("Chatwoot: conversation created, id:", conversationId);

  return { contactId, conversationId };
}
