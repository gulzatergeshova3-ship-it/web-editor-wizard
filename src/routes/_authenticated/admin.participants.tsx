import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Download, FileSpreadsheet, FileText, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_authenticated/admin/participants")({ component: Page });

type Registration = {
  id: string;
  registration_code: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  position: string | null;
  country: string | null;
  created_at: string;
  checked_in_at: string | null;
};

function Page() {
  const [items, setItems] = useState<Registration[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "registered" | "checked_in">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("id, registration_code, full_name, email, phone, organization, position, country, created_at, checked_in_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Registration[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      if (status === "registered" && r.checked_in_at) return false;
      if (status === "checked_in" && !r.checked_in_at) return false;
      if (!needle) return true;
      return (
        r.full_name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        (r.organization ?? "").toLowerCase().includes(needle)
      );
    });
  }, [items, q, status]);

  const exportRows = () =>
    filtered.map((r) => ({
      "Registration ID": r.registration_code ?? "",
      "ФИО": r.full_name,
      "Email": r.email,
      "Телефон": r.phone ?? "",
      "Организация": r.organization ?? "",
      "Должность": r.position ?? "",
      "Страна": r.country ?? "",
      "Дата регистрации": new Date(r.created_at).toLocaleString(),
      "Статус": r.checked_in_at ? "Checked In" : "Registered",
      "Check-in": r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : "",
    }));

  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `ScienceTech2026-participants-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportCsv = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ScienceTech2026-participants-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const del = async (id: string) => {
    if (!confirm("Удалить участника?")) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const undoCheckin = async (id: string) => {
    if (!confirm("Сбросить статус Check-in?")) return;
    const { error } = await supabase.from("registrations").update({ checked_in_at: null, checked_in_by: null }).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Participants</h1>
          <p className="text-sm text-muted-foreground">Всего: {items.length} · Показано: {filtered.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><FileText className="size-4 mr-2"/>CSV</Button>
          <Button onClick={exportXlsx}><FileSpreadsheet className="size-4 mr-2"/>Excel</Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск: ФИО, Email, Организация" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">ФИО</th>
              <th className="p-3">Организация</th>
              <th className="p-3">Email</th>
              <th className="p-3">Телефон</th>
              <th className="p-3 whitespace-nowrap">Дата регистрации</th>
              <th className="p-3">Статус</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Загрузка…</td></tr>}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{r.registration_code}</div>
                </td>
                <td className="p-3">
                  <div>{r.organization}</div>
                  <div className="text-xs text-muted-foreground">{r.position}</div>
                </td>
                <td className="p-3"><a className="text-primary" href={`mailto:${r.email}`}>{r.email}</a></td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">
                  {r.checked_in_at ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-medium" title={new Date(r.checked_in_at).toLocaleString()}>
                      <CheckCircle2 className="size-3"/> Checked In
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 text-blue-600 px-2 py-0.5 text-xs font-medium">Registered</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    {r.checked_in_at && (
                      <Button size="sm" variant="outline" onClick={() => undoCheckin(r.id)} title="Сбросить check-in">↺</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}><Trash2 className="size-4"/></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Ничего не найдено</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
