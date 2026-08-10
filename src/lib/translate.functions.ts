import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  lang: z.enum(["en", "kg"]),
  texts: z.array(z.string().trim().min(1).max(4000)).min(1).max(60),
});

const LANG_NAMES: Record<string, string> = {
  en: "English",
  kg: "Kyrgyz (Кыргызча)",
};

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const unique = Array.from(new Set(data.texts.map((t) => t.trim()).filter(Boolean)));
    const hashes = await Promise.all(unique.map(sha));
    const byHash = new Map<string, string>();
    unique.forEach((t, i) => byHash.set(hashes[i]!, t));

    const result: Record<string, string> = {};

    const { data: cached } = await (supabaseAdmin.from("translations") as any)
      .select("source_hash, source_text, translated_text")
      .eq("lang", data.lang)
      .in("source_hash", hashes);

    for (const row of cached ?? []) result[row.source_text] = row.translated_text;

    const missing = unique.filter((t) => !(t in result));
    if (missing.length === 0) return result;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return result;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              `You are a professional translator for an academic conference website. Translate each input string into ${LANG_NAMES[data.lang]}. ` +
              `Keep names of people, organizations, numbers, dates and formatting. Translate academic titles and degrees naturally. ` +
              `Reply ONLY with a JSON array of translated strings, same length and order as the input array. No extra text.`,
          },
          { role: "user", content: JSON.stringify(missing) },
        ],
      }),
    });

    if (!res.ok) return result;

    const json: any = await res.json();
    let content: string = json?.choices?.[0]?.message?.content ?? "";
    content = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let arr: unknown;
    try {
      arr = JSON.parse(content);
    } catch {
      return result;
    }
    if (!Array.isArray(arr) || arr.length !== missing.length) return result;

    const rows: any[] = [];
    for (let i = 0; i < missing.length; i++) {
      const src = missing[i]!;
      const out = typeof arr[i] === "string" ? (arr[i] as string) : "";
      if (!out) continue;
      result[src] = out;
      rows.push({ lang: data.lang, source_hash: await sha(src), source_text: src, translated_text: out });
    }

    if (rows.length) {
      await (supabaseAdmin.from("translations") as any).upsert(rows, { onConflict: "lang,source_hash" });
    }

    return result;
  });
