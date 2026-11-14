// NASA DONKI (Space Weather Database): strongest recent solar flare, used as the in-game storm.
export type RealStorm = { date: string; cls: string };
const rank = (c: string) => (c.startsWith("X") ? 3 : c.startsWith("M") ? 2 : 1);
export function pickFlare(j: any): RealStorm | null {
  if (!Array.isArray(j)) return null;
  const ev = j.filter((x) => x && typeof x.classType === "string" && (x.peakTime || x.beginTime))
    .sort((a, b) => rank(b.classType) - rank(a.classType) || String(b.peakTime || b.beginTime).localeCompare(String(a.peakTime || a.beginTime)))[0];
  return ev ? { date: String(ev.peakTime || ev.beginTime).slice(0, 10), cls: ev.classType } : null;
}
export async function latestFlare(): Promise<RealStorm | null> {
  try {
    const key = process.env.EXPO_PUBLIC_NASA_KEY || "DEMO_KEY", f = (d: Date) => d.toISOString().slice(0, 10);
    const r = await fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${f(new Date(Date.now() - 30 * 864e5))}&endDate=${f(new Date())}&api_key=${key}`);
    return r.ok ? pickFlare(await r.json()) : null;
  } catch { return null; }
}
