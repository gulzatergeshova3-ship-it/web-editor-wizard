import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function RegistrationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { tr } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", organization: "", position: "", section: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("registrations").insert(form);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(tr("reg_success"));
    setForm({ full_name: "", email: "", phone: "", organization: "", position: "", section: "", message: "" });
    onOpenChange(false);
  };

  const upd = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{tr("reg_dialog_title")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>{tr("reg_full_name")}*</Label><Input required value={form.full_name} onChange={upd("full_name")} maxLength={120}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{tr("reg_email")}*</Label><Input required type="email" value={form.email} onChange={upd("email")} maxLength={200}/></div>
            <div><Label>{tr("reg_phone")}</Label><Input value={form.phone} onChange={upd("phone")} maxLength={40}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{tr("reg_org")}</Label><Input value={form.organization} onChange={upd("organization")} maxLength={150}/></div>
            <div><Label>{tr("reg_position")}</Label><Input value={form.position} onChange={upd("position")} maxLength={150}/></div>
          </div>
          <div><Label>{tr("reg_section")}</Label><Input value={form.section} onChange={upd("section")} maxLength={150}/></div>
          <div><Label>{tr("reg_message")}</Label><Textarea value={form.message} onChange={upd("message")} maxLength={1000} rows={3}/></div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground border-0">{loading ? "..." : tr("reg_submit")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
