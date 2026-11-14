import { G, build, RANKS } from "../src/data";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
// Same physics as src/Lander.tsx
function sim(body: string, burnFrom: number | null) {
  const g = G[body]; let y = 0, v = 0, f = 100, t = 0;
  while (y < 100 && t < 120) { const dt = 0.033, burn = burnFrom !== null && y >= burnFrom && v > 3 && f > 0;
    if (burn) f = Math.max(0, f - 25 * dt); v += (g - (burn ? 30 : 0)) * dt; y += v * dt; if (y < 0) { y = 0; v = 0; } t += dt; }
  return v;
}
ok(sim("Moon", null) >= 4, "Moon: free fall crashes");
ok(sim("Moon", 70) < 4, "Moon: braking burn lands softly");
ok(sim("Earth", null) >= 4, "Earth: free fall crashes");
ok([50, 55, 60, 65].some((b) => sim("Earth", b) < 4), "Earth: a soft landing is achievable with fuel");
for (const n of ["moon", "mars", "iss"]) {
  const m = build(n); const li = m.tasks.findIndex((t) => t.kind === "land");
  ok(li === 3 && m.tasks.length === 7 && m.tasks.every((t) => t.m < 10), `${m.name}: landing step inserted at 4th, 7 steps, all <10 min`);
}
ok(RANKS[0][0] === 0 && RANKS.every((r, i) => i === 0 || r[0] > RANKS[i - 1][0]), "ranks ascending from 0");
