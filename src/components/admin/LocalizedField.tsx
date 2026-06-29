import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  value: { ru?: string; en?: string; kg?: string } | undefined | null;
  onChange: (v: { ru: string; en: string; kg: string }) => void;
  textarea?: boolean;
  rows?: number;
}

export function LocalizedField({ label, value, onChange, textarea, rows = 3 }: Props) {
  const v = { ru: value?.ru ?? "", en: value?.en ?? "", kg: value?.kg ?? "" };
  const upd = (lang: "ru" | "en" | "kg", val: string) => onChange({ ...v, [lang]: val });
  const Comp: any = textarea ? Textarea : Input;
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="grid md:grid-cols-3 gap-2">
        {(["ru", "en", "kg"] as const).map((l) => (
          <div key={l}>
            <div className="text-[10px] uppercase text-muted-foreground mb-1">{l}</div>
            <Comp value={v[l]} onChange={(e: any) => upd(l, e.target.value)} rows={rows} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocalizedArrayField({ label, value, onChange }: { label: string; value: { ru?: string[]; en?: string[]; kg?: string[] } | undefined | null; onChange: (v: { ru: string[]; en: string[]; kg: string[] }) => void }) {
  const v = { ru: (value?.ru ?? []).join("\n\n"), en: (value?.en ?? []).join("\n\n"), kg: (value?.kg ?? []).join("\n\n") };
  const upd = (lang: "ru" | "en" | "kg", val: string) => {
    const next = { ...v, [lang]: val };
    onChange({
      ru: next.ru.split(/\n\n+/).map(s => s.trim()).filter(Boolean),
      en: next.en.split(/\n\n+/).map(s => s.trim()).filter(Boolean),
      kg: next.kg.split(/\n\n+/).map(s => s.trim()).filter(Boolean),
    });
  };
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label} <span className="text-xs text-muted-foreground font-normal">(абзацы разделяются пустой строкой)</span></Label>
      <div className="grid md:grid-cols-3 gap-2">
        {(["ru", "en", "kg"] as const).map((l) => (
          <div key={l}>
            <div className="text-[10px] uppercase text-muted-foreground mb-1">{l}</div>
            <Textarea value={v[l]} onChange={(e) => upd(l, e.target.value)} rows={8}/>
          </div>
        ))}
      </div>
    </div>
  );
}
