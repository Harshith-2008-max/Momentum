// Supabase Edge Function: kid-friendly mission coach. Input is numbers and a short cause only (no free text), so it cannot be used to inject instructions.
import { z } from "npm:zod@3.23.8";
const In = z.object({ world: z.enum(["moon", "mars"]), won: z.boolean(), why: z.string().max(80), health: z.number().min(0).max(100), blackouts: z.number().int().min(0).max(20),
  storms: z.number().int().min(0).max(5), stormHit: z.number().int().min(0).max(5), shield: z.number().min(0).max(100), food: z.number().min(0).max(100), ls: z.number().min(0).max(100), score: z.number().min(0).max(100) });
const SYS = `You are a friendly mission coach for students aged 9 to 16 who just played a Moon or Mars outpost game. Using ONLY the facts provided, explain in 2 to 3 short, encouraging sentences what mattered most and one thing to try next time. Do not add new facts or numbers. No markdown, no emojis, no lists.`;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const facts = In.parse(await req.json());
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "not configured" }, 500);
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5", max_tokens: 220, system: SYS, messages: [{ role: "user", content: `Facts: ${JSON.stringify(facts)}` }] }) });
    if (!r.ok) return json({ error: "upstream" }, 502);
    const text = String((await r.json()).content?.[0]?.text ?? "").trim().slice(0, 450);
    return text ? json({ text }) : json({ error: "empty" }, 502);
  } catch { return json({ error: "bad request" }, 400); }
});
