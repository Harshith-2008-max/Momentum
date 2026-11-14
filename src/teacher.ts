// Teacher mode without accounts: a class code defines the scenario; students share a results line; the teacher pastes the lines to see the class.
import { Mod, World } from "./outpost";
const MODS: Mod[] = ["stormy", "dusty", "fragile", "hungry", "lean"], L = "ABCDE";
export const makeCode = (world: World, mod: Mod, crew: boolean) =>
  (world === "moon" ? "L" : "M") + L[MODS.indexOf(mod)] + (crew ? "C" : "S") + Array.from({ length: 3 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
export function parseCode(raw: string): { world: World; mod: Mod; crew: boolean; code: string } | null {
  const c = raw.trim().toUpperCase();
  if (!/^[LM][A-E][CS][A-Z0-9]{3}$/.test(c)) return null;
  return { world: c[0] === "L" ? "moon" : "mars", mod: MODS[L.indexOf(c[1])], crew: c[2] === "C", code: c };
}
const clean = (x: string) => x.replace(/[|\n\r]/g, " ").trim().slice(0, 40);
export const resultLine = (r: { code: string; name: string; score: number; won: boolean; why: string; pre?: number; post?: number }) =>
  ["OC1", r.code, clean(r.name || "Student"), r.score, r.won ? "win" : "lose", clean(r.why), r.pre ?? "", r.post ?? ""].join("|");
export function parseResults(text: string) {
  const rows = text.split(/\r?\n/).map((l) => l.trim().split("|")).filter((p) => p[0] === "OC1" && p.length >= 8 && !isNaN(+p[3]))
    .map((p) => ({ code: p[1], name: p[2], score: +p[3], won: p[4] === "win", why: p[5], pre: p[6] === "" ? undefined : +p[6], post: p[7] === "" ? undefined : +p[7] }));
  const n = rows.length, avg = n ? Math.round(rows.reduce((a, r) => a + r.score, 0) / n) : 0, pass = n ? Math.round((100 * rows.filter((r) => r.won).length) / n) : 0;
  const causes: Record<string, number> = {}; rows.filter((r) => !r.won && r.why).forEach((r) => { const k = r.why.replace(/\(mission score.*$/, "").trim(); causes[k] = (causes[k] || 0) + 1; });
  const top = Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const g = rows.filter((r) => r.pre !== undefined && r.post !== undefined), gain = g.length ? +(g.reduce((a, r) => a + (r.post! - r.pre!), 0) / g.length).toFixed(1) : null;
  return { rows, n, avg, pass, top, gain, gainN: g.length };
}
