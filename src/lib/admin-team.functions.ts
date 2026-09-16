import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertCallerIsAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Доступ только для администратора.");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error } = await (supabaseAdmin.from("user_roles") as any)
      .select("id, user_id, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);

    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw new Error(usersError.message);

    const byId = new Map(users.users.map((u) => [u.id, u]));
    return (roles ?? []).map((r: any) => ({
      id: r.id as string,
      user_id: r.user_id as string,
      email: byId.get(r.user_id)?.email ?? "—",
      last_sign_in_at: byId.get(r.user_id)?.last_sign_in_at ?? null,
      is_self: r.user_id === context.userId,
    }));
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email("Введите корректный email"),
        password: z.string().min(8, "Пароль минимум 8 символов"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw new Error(listError.message);
    let user = users.users.find((u) => u.email?.toLowerCase() === email) ?? null;

    if (user) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: data.password,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
      user = created.user;
    }

    if (!user) throw new Error("Не удалось создать пользователя.");

    const { error: roleError } = await (supabaseAdmin.from("user_roles") as any).upsert(
      { user_id: user.id, role: "admin" },
      { onConflict: "user_id,role" },
    );
    if (roleError) throw new Error(roleError.message);

    return { ok: true, email };
  });

export const revokeAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ user_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context.supabase, context.userId);
    if (data.user_id === context.userId) throw new Error("Нельзя снять доступ у самого себя.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin.from("user_roles") as any)
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
