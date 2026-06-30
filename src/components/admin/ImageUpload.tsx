import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const YEAR = 60 * 60 * 24 * 365;

export function ImageUpload({
  label,
  value,
  folder,
  onChange,
}: {
  label: string;
  value?: string | null;
  folder: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data, error } = await supabase.storage.from("media").createSignedUrl(path, YEAR);
      if (error) throw error;
      onChange(data.signedUrl);
      toast.success("Загружено");
    } catch (e: any) {
      toast.error(e.message ?? "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
              aria-label="Удалить"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-20 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
            нет фото
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4 mr-2" />
          {busy ? "Загрузка..." : "Загрузить файл"}
        </Button>
      </div>
    </div>
  );
}
