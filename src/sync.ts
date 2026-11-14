// Optional cloud sync. Works fully offline if the env vars below are not set.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Prog } from "./store";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL, key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const sb: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
  : null;

// Anonymous sign-in: no login screen or prompt. Needs "Anonymous sign-ins" enabled in Supabase.
async function uid(): Promise<string | null> {
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.user.id;
  const r = await sb.auth.signInAnonymously();
  return r.data.user?.id ?? null;
}
export async function pull(): Promise<Prog | null> {
  try { const id = await uid(); if (!id || !sb) return null;
    const { data } = await sb.from("progress").select("data").eq("user_id", id).maybeSingle();
    return (data?.data as Prog) ?? null; } catch { return null; }
}
export async function push(p: Prog) {
  try { const id = await uid(); if (!id || !sb) return;
    await sb.from("progress").upsert({ user_id: id, data: p, updated_at: new Date().toISOString() }); } catch {}
}

export async function invokeBreakdown(goal: string): Promise<unknown | null> {
  try {
    if (!sb) return null;
    await uid();
    const { data, error } = await sb.functions.invoke("breakdown", { body: { goal } });
    return error ? null : data;
  } catch { return null; }
}

export async function invokeCoach(summary: unknown): Promise<unknown | null> {
  try {
    if (!sb) return null;
    await uid();
    const { data, error } = await sb.functions.invoke("coach", { body: summary as Record<string, unknown> });
    return error ? null : data;
  } catch { return null; }
}
