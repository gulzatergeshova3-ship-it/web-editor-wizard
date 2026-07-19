import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registrationInputSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().nullable(),
  organization: z.string().trim().max(200).optional().nullable(),
  position: z.string().trim().max(150).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
});

export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      phone: data.phone?.trim() || null,
      organization: data.organization?.trim() || null,
      position: data.position?.trim() || null,
      country: data.country?.trim() || null,
    };

    const { data: registration, error } = await (supabaseAdmin.from("registrations") as any)
      .insert(payload)
      .select("id, registration_code, qr_token, full_name, email")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return registration as {
      id: string;
      registration_code: string | null;
      qr_token: string | null;
      full_name: string;
      email: string;
    };
  });