import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lookupSchema = z.object({
  query: z.string().trim().min(2).max(200),
});

export const findCertificate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => lookupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.query.trim();
    const like = `%${q.replace(/[%_]/g, "")}%`;

    const { data: rows, error } = await (supabaseAdmin.from("registrations") as any)
      .select("full_name, email, registration_code, checked_in_at")
      .or(`full_name.ilike.${like},email.ilike.${like},registration_code.ilike.${like}`)
      .limit(5);

    if (error) throw new Error(error.message);

    const list = (rows ?? []) as {
      full_name: string;
      email: string;
      registration_code: string | null;
      checked_in_at: string | null;
    }[];

    if (list.length === 0) return { status: "not_found" as const };

    const checked = list.find((r) => r.checked_in_at);
    if (!checked) return { status: "not_checked_in" as const };

    return {
      status: "ok" as const,
      full_name: checked.full_name,
      registration_code: checked.registration_code,
    };
  });
