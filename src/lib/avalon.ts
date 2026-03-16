const AVALON_API = "https://avalon.gomerlin.com.br/api/v1/events";
const AVALON_TOKEN = () => process.env.AVALON_API_TOKEN!;

function getSaoPauloNow(): { date: string; datetime: string } {
  const now = new Date();
  const date = now.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const datetime = now
    .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
    .replace(" ", "T");
  return { date, datetime };
}

interface AvalonConversionData {
  conversionName: string;
  name: string;
  email: string;
  phone?: string;
  avalonParameters: Record<string, string | number>;
}

export async function sendAvalonConversion(data: AvalonConversionData): Promise<boolean> {
  if (!process.env.AVALON_API_TOKEN) {
    console.error("Avalon: AVALON_API_TOKEN not set, skipping");
    return false;
  }

  const { date, datetime } = getSaoPauloNow();

  const payload = {
    name: "conversion",
    payload: {
      conversion_name: `${data.conversionName} ${date}`,
      company: "GLA",
      happened_at: datetime,
      name: data.name,
      contacts: [
        { kind: "email", value: data.email },
        ...(data.phone ? [{ kind: "phone", value: data.phone }] : []),
      ],
      magic_source: "",
      magic_medium: "direct",
      magic_campaign: "",
      avalon_parameters: data.avalonParameters,
    },
  };

  try {
    const res = await fetch(AVALON_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AVALON_TOKEN()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Avalon API error [${res.status}]:`, body);
      return false;
    }

    console.log("Avalon: conversion sent successfully");
    return true;
  } catch (err) {
    console.error("Avalon error:", err);
    return false;
  }
}
