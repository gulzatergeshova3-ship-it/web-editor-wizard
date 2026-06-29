import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LocalizedText { ru?: string; en?: string; kg?: string }
export interface LocalizedArray { ru?: string[]; en?: string[]; kg?: string[] }

export interface SiteSetting { key: string; value: any; updated_at: string }
export interface Section { id: string; sort_order: number; number: string | null; icon: string | null; title: LocalizedText; description: LocalizedText }
export interface Speaker { id: string; sort_order: number; name: string; title: LocalizedText; bio: LocalizedText; photo_url: string | null }
export interface ProgramItem { id: string; sort_order: number; time_label: string | null; title: LocalizedText; description: LocalizedText; speaker: string | null }
export interface Partner { id: string; sort_order: number; name: string; logo_url: string | null; url: string | null; tier: string | null }
export interface Registration { id: string; full_name: string; email: string; phone: string | null; organization: string | null; position: string | null; section: string | null; message: string | null; created_at: string }

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const map: Record<string, any> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  },
});

export const sectionsQuery = queryOptions({
  queryKey: ["sections"],
  queryFn: async () => {
    const { data, error } = await supabase.from("sections").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Section[];
  },
});

export const speakersQuery = queryOptions({
  queryKey: ["speakers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("speakers").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Speaker[];
  },
});

export const programQuery = queryOptions({
  queryKey: ["program_items"],
  queryFn: async () => {
    const { data, error } = await supabase.from("program_items").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as ProgramItem[];
  },
});

export const partnersQuery = queryOptions({
  queryKey: ["partners"],
  queryFn: async () => {
    const { data, error } = await supabase.from("partners").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Partner[];
  },
});

export const registrationsQuery = queryOptions({
  queryKey: ["registrations"],
  queryFn: async () => {
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Registration[];
  },
});
