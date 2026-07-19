import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  registration_id: z.string().uuid(),
  registration_code: z.string().min(1),
  full_name: z.string().min(1),
  email: z.string().email(),
  qr_data_url: z.string().startsWith("data:image/"),
});

const EVENT_DATE = "18 сентября 2026";
const EVENT_LOCATION = "Бишкек, Кыргызстан";

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderHtml(input: z.infer<typeof schema>) {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,.08)">
        <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff">
          <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.85">Science Tech 2026</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px">Международная научная конференция</div>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <h1 style="margin:0 0 8px;font-size:22px">Здравствуйте, ${escape(input.full_name)}!</h1>
          <p style="margin:0 0 16px;color:#475569;line-height:1.55">
            Благодарим вас за регистрацию на международную научную конференцию
            <b>Science Tech 2026</b>. Ваша заявка подтверждена.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background:#f8fafc;border-radius:12px;padding:16px;margin:8px 0 20px">
            <tr><td style="padding:6px 0"><b>📅 Дата:</b> ${EVENT_DATE}</td></tr>
            <tr><td style="padding:6px 0"><b>📍 Место:</b> ${EVENT_LOCATION}</td></tr>
            <tr><td style="padding:6px 0"><b>🆔 Registration ID:</b>
              <span style="font-family:ui-monospace,monospace">${input.registration_code}</span></td></tr>
          </table>
          <div style="text-align:center;margin:24px 0 12px">
            <img src="cid:qr@sciencetech" alt="QR" width="240" height="240"
              style="border:1px solid #e2e8f0;border-radius:12px;padding:8px;background:#fff" />
          </div>
          <p style="margin:8px 0 0;color:#475569;line-height:1.55;text-align:center">
            Пожалуйста, сохраните данный QR-код.<br/>Он понадобится для входа на конференцию.
          </p>
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center">
          © 2026 Science Tech. Все права защищены.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function updateStatus(id: string, patch: Record<string, unknown>) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin.from("registrations") as any).update(patch).eq("id", id);
  } catch (e) {
    console.error("[registration-email] status update failed", e);
  }
}

export const sendRegistrationEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: secretRow } = await (supabaseAdmin.from("app_secrets") as any)
      .select("value").eq("name", "resend_api_key").maybeSingle();
    const apiKey = secretRow?.value || process.env.RESEND_API_KEY;
    const from = process.env.REGISTRATION_EMAIL_FROM ?? "Science Tech 2026 <onboarding@resend.dev>";

    if (!apiKey) {
      await updateStatus(data.registration_id, {
        email_status: "failed",
        email_error: "RESEND_API_KEY is not configured",
      });
      return { sent: false, reason: "no_api_key" as const };
    }

    const [, base64] = data.qr_data_url.split(",");
    const html = renderHtml(data);

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [data.email],
          subject: `Science Tech 2026 — регистрация подтверждена (${data.registration_code})`,
          html,
          attachments: base64
            ? [
                {
                  filename: `ScienceTech2026-${data.registration_code}.png`,
                  content: base64,
                  content_id: "qr@sciencetech",
                },
              ]
            : undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[registration-email] send failed", res.status, text);
        await updateStatus(data.registration_id, {
          email_status: "failed",
          email_error: `Resend ${res.status}: ${text.slice(0, 400)}`,
        });
        return { sent: false, reason: "send_failed" as const };
      }

      await updateStatus(data.registration_id, {
        email_status: "sent",
        email_error: null,
        email_sent_at: new Date().toISOString(),
      });
      return { sent: true };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error("[registration-email] exception", msg);
      await updateStatus(data.registration_id, { email_status: "failed", email_error: msg });
      return { sent: false, reason: "exception" as const };
    }
  });
