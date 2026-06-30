import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

type AdminClient = SupabaseClient<Database>;

const DEFAULT_SEED_EMAIL = "gulzatergeshova3@gmail.com";

const setupAdminSchema = z.object({
  setupToken: z.string().trim().min(1, "Введите setup token"),
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
});

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getSeedEmail() {
  return (process.env.ADMIN_SEED_EMAIL || DEFAULT_SEED_EMAIL).trim().toLowerCase();
}

function getAdminClient(): AdminClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Service role Supabase keys are not configured on the server.");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    global: { fetch: createSupabaseFetch(serviceRoleKey) },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function tokenMatches(providedToken: string, expectedToken: string) {
  const provided = await sha256(providedToken);
  const expected = await sha256(expectedToken);
  let diff = provided.length ^ expected.length;

  for (let i = 0; i < Math.max(provided.length, expected.length); i += 1) {
    diff |= (provided[i] ?? 0) ^ (expected[i] ?? 0);
  }

  return diff === 0;
}

async function assertSetupToken(providedToken: string) {
  const expectedToken = process.env.ADMIN_SETUP_SECRET;

  if (!expectedToken) {
    throw new Error("ADMIN_SETUP_SECRET is not configured. Add it in project secrets before using setup.");
  }

  if (!(await tokenMatches(providedToken.trim(), expectedToken.trim()))) {
    throw new Error("Неверный setup token.");
  }
}

async function getAdminCount(supabase: AdminClient) {
  const { count, error } = await supabase
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw error;
  return count ?? 0;
}

async function findUserByEmail(supabase: AdminClient, email: string) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user || data.users.length < 1000) return user ?? null;
  }

  return null;
}

async function hasAdminRole(supabase: AdminClient, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

async function auditSetup(supabase: AdminClient, email: string, status: string, reason?: string) {
  const { error } = await supabase.from("admin_setup_audit").insert({ email, status, reason });
  if (error) console.error("[admin-setup] audit insert failed", error.message);
}

export const getAdminSetupState = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getAdminClient();
  const seedEmail = getSeedEmail();
  const adminCount = await getAdminCount(supabase);
  const seedUser = await findUserByEmail(supabase, seedEmail);
  const seedHasAdminRole = seedUser ? await hasAdminRole(supabase, seedUser.id) : false;

  return {
    adminCount,
    hasAdmin: adminCount > 0,
    setupSecretConfigured: !!process.env.ADMIN_SETUP_SECRET,
    seedEmail,
    seedUserExists: !!seedUser,
    seedHasAdminRole,
    canCreateFirstAdmin: adminCount === 0,
    canRepairSeedAdmin: adminCount > 0 && !!seedEmail,
  };
});

export const setupAdminUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => setupAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getAdminClient();
    const setupData = {
      ...data,
      email: data.email.toLowerCase(),
      setupToken: data.setupToken.trim(),
    };
    const seedEmail = getSeedEmail();

    await assertSetupToken(setupData.setupToken);

    const adminCount = await getAdminCount(supabase);
    const isSeedEmail = setupData.email === seedEmail;

    if (adminCount > 0 && !isSeedEmail) {
      await auditSetup(supabase, setupData.email, "blocked", "admin_already_exists");
      throw new Error("Первый администратор уже создан. Для нового admin используйте существующий админ-кабинет.");
    }

    const existingUser = await findUserByEmail(supabase, setupData.email);
    let userId = existingUser?.id;

    if (existingUser) {
      const { data: updated, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: setupData.password,
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          admin_seed: isSeedEmail,
        },
      });

      if (error) throw error;
      userId = updated.user?.id ?? existingUser.id;
    } else {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: setupData.email,
        password: setupData.password,
        email_confirm: true,
        user_metadata: { admin_seed: isSeedEmail },
      });

      if (error) throw error;
      if (!created.user?.id) throw new Error("Не удалось создать admin-пользователя.");
      userId = created.user.id;
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    if (roleError) throw roleError;

    const status = adminCount > 0 ? "seed_repaired" : "first_admin_created";
    await auditSetup(supabase, setupData.email, status);

    return {
      ok: true,
      email: setupData.email,
      message:
        adminCount > 0
          ? "Seed admin восстановлен: пароль обновлён, роль admin выдана."
          : "Первый admin создан и получил роль admin.",
    };
  });