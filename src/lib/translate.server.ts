import { streamText } from "ai";
import { z } from "zod";
import { createTranslationGateway } from "@/lib/ai-gateway.server";

export const translateInputSchema = z.object({
  lang: z.enum(["en", "kg"]),
  texts: z.array(z.string().trim().min(1).max(4000)).min(1).max(60),
});

type TranslationInput = z.infer<typeof translateInputSchema>;

const languageNames = {
  en: "English",
  kg: "Kyrgyz (Кыргызча)",
} as const;

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseTranslations(raw: string, expectedLength: number): string[] | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== expectedLength) return null;
    return parsed.map((item) => (typeof item === "string" ? item.trim() : ""));
  } catch {
    return null;
  }
}

export async function translateSiteTexts(data: TranslationInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const unique = Array.from(new Set(data.texts.map((text) => text.trim()).filter(Boolean)));
  const hashes = await Promise.all(unique.map(sha));
  const result: Record<string, string> = {};

  const { data: cached } = await (supabaseAdmin.from("translations") as any)
    .select("source_hash, source_text, translated_text")
    .eq("lang", data.lang)
    .in("source_hash", hashes);

  for (const row of cached ?? []) result[row.source_text] = row.translated_text;

  const missing = unique.filter((text) => !(text in result));
  if (missing.length === 0) return result;

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Automatic translation is temporarily unavailable");

  const gateway = createTranslationGateway(apiKey);
  const generation = streamText({
    model: gateway("google/gemini-3-flash-preview"),
    system:
      `You translate an academic conference website into ${languageNames[data.lang]}. ` +
      "Translate every input string. Preserve personal names, organization names, URLs, email addresses, numbers, dates, punctuation, and formatting. " +
      "Translate academic titles and degrees naturally. Return only a valid JSON array of strings in exactly the same order and length, with no markdown.",
    prompt: JSON.stringify(missing),
    maxRetries: 0,
  });
  const translated = parseTranslations(await generation.text, missing.length);
  if (!translated) throw new Error("The translation service returned an invalid response");

  const rows: Array<Record<string, string>> = [];
  for (let index = 0; index < missing.length; index += 1) {
    const source = missing[index];
    const output = translated[index];
    if (!source || !output) continue;
    result[source] = output;
    rows.push({
      lang: data.lang,
      source_hash: await sha(source),
      source_text: source,
      translated_text: output,
    });
  }

  if (rows.length > 0) {
    await (supabaseAdmin.from("translations") as any).upsert(rows, {
      onConflict: "lang,source_hash",
    });
  }

  return result;
}