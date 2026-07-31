export type FieldType = "text" | "email" | "tel" | "textarea" | "select";

export interface RegField {
  key: string;
  label: { ru?: string; en?: string; kg?: string };
  type: FieldType;
  required: boolean;
  enabled: boolean;
  options?: string[];
  builtin?: boolean;
}

/** Columns that exist directly on the registrations table. */
export const BUILTIN_KEYS = [
  "full_name",
  "email",
  "phone",
  "organization",
  "position",
  "country",
] as const;

export const DEFAULT_FIELDS: RegField[] = [
  { key: "full_name", label: { ru: "ФИО", en: "Full name", kg: "Толук аты-жөнү" }, type: "text", required: true, enabled: true, builtin: true },
  { key: "email", label: { ru: "Email", en: "Email", kg: "Email" }, type: "email", required: true, enabled: true, builtin: true },
  { key: "phone", label: { ru: "Телефон", en: "Phone", kg: "Телефон" }, type: "tel", required: true, enabled: true, builtin: true },
  { key: "organization", label: { ru: "Организация", en: "Organization", kg: "Уюм" }, type: "text", required: true, enabled: true, builtin: true },
  { key: "position", label: { ru: "Должность", en: "Position", kg: "Кызматы" }, type: "text", required: true, enabled: true, builtin: true },
  { key: "country", label: { ru: "Страна", en: "Country", kg: "Өлкө" }, type: "text", required: true, enabled: true, builtin: true },
];

export function normalizeFields(raw: unknown): RegField[] {
  const arr = Array.isArray(raw) ? raw : Array.isArray((raw as any)?.fields) ? (raw as any).fields : null;
  if (!arr || arr.length === 0) return DEFAULT_FIELDS.map((f) => ({ ...f }));
  return arr
    .filter((f: any) => f && typeof f.key === "string" && f.key.trim())
    .map((f: any) => ({
      key: String(f.key).trim(),
      label: f.label ?? {},
      type: (["text", "email", "tel", "textarea", "select"].includes(f.type) ? f.type : "text") as FieldType,
      required: !!f.required,
      enabled: f.enabled !== false,
      options: Array.isArray(f.options) ? f.options.filter(Boolean).map(String) : undefined,
      builtin: (BUILTIN_KEYS as readonly string[]).includes(String(f.key).trim()),
    }));
}

export function slugKey(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}
