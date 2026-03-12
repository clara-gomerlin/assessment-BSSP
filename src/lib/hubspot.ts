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

/**
 * Create or update a HubSpot contact.
 * Uses email as dedup key — if a contact with that email exists, it updates.
 * Returns the HubSpot contact ID.
 */
export async function upsertContact({
  email,
  firstName,
  lastName,
  phone,
  quizName,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  quizName: string;
}): Promise<string | null> {
  const properties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    evento_de_conversao: `Assessment ${quizName}`,
    produto: "Consultoria",
  };

  if (phone) {
    properties.phone = phone;
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
