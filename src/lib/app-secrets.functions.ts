import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const NAME = "resend_api_key";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles").select("role").eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

function mask(v: string | null | undefined) {
  if (!v) return null;
  if (v.length <= 8) return "•".repeat(v.length);
  return v.slice(0, 3) + "•••••••" + v.slice(-4);
}

export const getResendKeyStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin.from("app_secrets") as any)
      .select("value, updated_at").eq("name", NAME).maybeSingle();
    const envSet = !!process.env.RESEND_API_KEY;
    return {
      db_set: !!data?.value,
      db_masked: mask(data?.value ?? null),
      db_updated_at: data?.updated_at ?? null,
      env_set: envSet,
      env_masked: mask(process.env.RESEND_API_KEY ?? null),
      active_source: data?.value ? "db" : envSet ? "env" : "none",
    };
  });

export const setResendKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ value: z.string().trim().min(10).max(200).regex(/^re_/, "Ключ Resend должен начинаться с re_") }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);

    // Verify with Resend before saving
    const verify = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${data.value}` },
    });
    if (!verify.ok) {
      const text = await verify.text();
      throw new Error(`Resend отклонил ключ (${verify.status}): ${text.slice(0, 200)}`);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin.from("app_secrets") as any).upsert({
      name: NAME,
      value: data.value,
      updated_at: new Date().toISOString(),
      updated_by: (context as any).userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteResendKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin.from("app_secrets") as any).delete().eq("name", NAME);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
