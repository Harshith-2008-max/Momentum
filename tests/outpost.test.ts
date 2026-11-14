import { DAYS, Orders, State, WORK, Work, choose, endDay, eventFor, newMission, score } from "../src/outpost";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };

function play(world: "moon" | "mars", policy: (s: State) => Orders, pick: (i: number) => number = () => 0) {
  let s = newMission(world);
  while (!s.over) { const ev = eventFor(s); if (ev) s = choose(s, ev, Math.min(pick(s.day), ev.choices.length - 1)); s = endDay(s, policy(s)); }
  return s;
}
// A thoughtful player: keeps systems healthy, manages the battery through night/dust.
const smart = (s: State): Orders => {
  const work: Work[] = [];
  const night = s.world === "moon" && s.day >= 9 && s.day <= 12 || s.dust > 0;
  if (s.ls < 75) work.push("repair");
  if (s.shield < 70) work.push("shield");
  if (s.solar < 75 && !night) work.push("solar");
  if (s.health < 60) work.push("rest");
  if (s.food < 70 && work.length < 2) work.push("farm");
  if (work.length < 2) work.push("science");
  return { work, lights: !night && s.power > 40, lab: !night && s.power > 40 };
};
const idle = (): Orders => ({ work: [], lights: true, lab: true });

for (const w of ["moon", "mars"] as const) {
  const a = play(w, smart), b = play(w, idle), sa = score(a), sb = score(b);
  ok(a.over === "win", `${w}: a thoughtful player survives all ${DAYS} days (score ${sa.total}, ${sa.rank})`);
  ok(sa.total >= 60, `${w}: thoughtful play scores well (${sa.total})`);
  ok(b.over === "lose", `${w}: doing nothing fails or scores far lower (${b.over ?? "survived"}, ${sb.total}) because ${b.why || "weak play"}`);
  const c = play(w, smart, () => 1), sc = score(c);
  ok(sc.total <= 100 && sc.total >= 0, `${w}: alternative event choices still produce a valid score (${sc.total})`);
}
ok(Object.keys(WORK).length === 6, "6 work orders available");
const r1 = JSON.stringify(play("moon", smart)), r2 = JSON.stringify(play("moon", smart));
ok(r1 === r2, "simulation is deterministic (same choices, same result)");
// Radiation shielding matters during a storm
let lo = newMission("moon"); lo.shield = 0; lo.day = 5; let hi = newMission("moon"); hi.shield = 100; hi.day = 5;
const evS = eventFor(lo)!; lo = choose(lo, evS, 1); hi = choose(hi, evS, 1);
const loE = endDay(lo, idle()), hiE = endDay(hi, idle());
ok(loE.dose > hiE.dose * 3 && loE.health < hiE.health, `shielding cuts storm dose (${loE.dose.toFixed(1)} vs ${hiE.dose.toFixed(1)} mSv)`);
// Sheltering cuts dose
let sh = newMission("moon"); sh.shield = 20; sh.day = 5; let kw = JSON.parse(JSON.stringify(sh));
sh = choose(sh, evS, 0); kw = choose(kw, evS, 1);
ok(endDay(sh, idle()).dose < endDay(kw, idle()).dose, "sheltering reduces storm radiation");
// Blackout when power is exhausted
let bo = newMission("moon"); bo.day = 10; bo.power = 5;
ok(endDay(bo, idle()).health < bo.health, "lunar night with a low battery causes a blackout and hurts the crew");

// ---- Engagement layer ----
import { BADGES, MODS, advice, dailyChallenge, earned, rating, shareGrid } from "../src/outpost";
const d1 = dailyChallenge("2026-11-12"), d2 = dailyChallenge("2026-11-12"), d3 = dailyChallenge("2026-11-13");
ok(JSON.stringify(d1) === JSON.stringify(d2), "daily challenge is the same for everyone on a date");
ok(new Set(Array.from({ length: 30 }, (_, i) => dailyChallenge(`2026-11-${String(i + 1).padStart(2, "0")}`).mod)).size >= 3, "daily modifiers vary across days");
function playMods(world: "moon" | "mars", mods: any[]) { let s = newMission(world, undefined, mods); while (!s.over) { const ev = eventFor(s); if (ev) s = choose(s, ev, 0); s = endDay(s, smart(s)); } return s; }
for (const m of Object.keys(MODS)) { const r = playMods("moon", [m]); ok(r.hist.length === DAYS || r.over === "lose", `modifier ${m}: plays through (${r.over}, ${score(r).total})`); }
const win = play("moon", smart); const e = earned(win);
ok(e.includes("moon") && win.hist.length === DAYS, `a strong Moon win earns badges: ${e.join(", ")}`);
ok(earned(play("moon", idle)).length === 0, "a failed mission earns no badges");
ok(Object.keys(BADGES).includes("cmd") && e.every((b) => b in BADGES), "all earned badge ids exist");
ok(shareGrid(win).length === DAYS * 2, "share grid has one square per day (emoji are 2 code units)");
ok(advice(newMission("moon")).length > 0 && advice(Object.assign(newMission("moon"), { shield: 10 })).includes("Shielding"), "advisor gives contextual tips");
ok(rating(40) === 0 && rating(55) === 1 && rating(75) === 2 && rating(90) === 3, "star ratings from best score");
// Rewind: replaying from a snapshot with the same choices gives the same result
let a = newMission("moon"); const snaps = [JSON.parse(JSON.stringify(a))];
while (!a.over) { const ev = eventFor(a); if (ev) a = choose(a, ev, 0); a = endDay(a, smart(a)); snaps.push(JSON.parse(JSON.stringify(a))); }
let b = JSON.parse(JSON.stringify(snaps[4])); while (!b.over) { const ev = eventFor(b); if (ev) b = choose(b, ev, 0); b = endDay(b, smart(b)); }
ok(JSON.stringify(b) === JSON.stringify(a), "rewinding to day 5 and replaying the same choices reproduces the run");
const alt = JSON.parse(JSON.stringify(snaps[4])); const stormCard = eventFor(alt)!; const sheltered = choose(alt, stormCard, 0);
ok(endDay(sheltered, smart(sheltered)).dose < endDay(choose(alt, stormCard, 1), smart(alt)).dose, "what-if: sheltering on day 5 changes the outcome");


// ---- Mission History ----
import { SCENARIOS, nightDay } from "../src/outpost";
const dark = (s: State) => nightDay(s) || (s.world === "moon" && s.day >= s.night[0] - 1 && s.day <= s.night[1]) || s.dust > 0;
const hSmart = (s: State): Orders => { const w: Work[] = []; if (s.ls < 75) w.push("repair"); if (s.shield < 70) w.push("shield"); if (s.solar < 90 && (s.dust > 0 || !dark(s))) w.push("solar"); if (s.health < 60) w.push("rest"); if (w.length < 2) w.push("science"); return { work: w, lights: !dark(s) && s.power > 40, lab: !dark(s) && s.power > 40 }; };
const hPlay = (id: string, pol: (s: State) => Orders) => { let s = newMission("moon", undefined, [], { scn: id }); while (!s.over) { const ev = eventFor(s); if (ev) s = choose(s, ev, 0); s = endDay(s, pol(s)); } return s; };
ok(Object.keys(SCENARIOS).length === 3 && Object.values(SCENARIOS).every((x) => x.real.length > 80 && x.brief.length > 20 && x.src), "3 history missions, each with a brief and a what-really-happened story");
for (const id of Object.keys(SCENARIOS)) { const w = hPlay(id, hSmart); ok(w.over === "win", `${id}: a thoughtful player can beat history (score ${score(w).total})`); ok(earned(w).includes(id), `${id}: winning earns its own badge`); }
ok(hPlay("opportunity", idle).over === "lose" && hPlay("opportunity", idle).why === "a power blackout", "Opportunity: doing nothing fails because of the power blackout (accurate cause)");
ok(hPlay("chandrayaan", idle).over === "lose", "Chandrayaan: leaving lights and lab on through the night fails");
ok(newMission("moon", undefined, [], { scn: "opportunity" }).world === "mars", "scenario sets the correct world");
const ap = newMission("moon", undefined, [], { scn: "apollo72" }); ap.day = 6; ok(eventFor(ap)!.title.includes("1972"), "Apollo 1972 storm card is named after the real event");
const sm = newMission("moon"); ok(!!sm && Object.keys(sm.dmg).length === 0, "damage tracker starts empty");


// ---- Design your outpost ----
import { BUDGET, DEFAULT_DESIGN, Design, PARTS, designHint, designTip, validDesign } from "../src/outpost";
const D = (a: number, b: number, c: number, d: number, e: number): Design => ({ panels: a, battery: b, shield: c, farm: d, spares: e });
ok(validDesign(DEFAULT_DESIGN) && Object.values(DEFAULT_DESIGN).reduce((a, b) => a + b, 0) === BUDGET, "default loadout uses the full launch budget");
ok(!validDesign(D(4, 4, 4, 0, 0)) && !validDesign(D(5, 0, 0, 0, 0)) && !validDesign(D(-1, 2, 2, 2, 2)) && validDesign(D(0, 0, 0, 0, 0)), "launch budget and per-part limits are enforced");
ok(JSON.stringify(newMission("moon", undefined, [], { design: D(4, 4, 4, 4, 4) }).design) === JSON.stringify(DEFAULT_DESIGN), "an invalid design falls back to the balanced loadout");
const A = newMission("moon", undefined, [], { design: D(4, 0, 0, 4, 2) }), B = newMission("moon", undefined, [], { design: D(0, 4, 4, 0, 2) });
ok(A.genK > B.genK && B.cap > A.cap && B.shieldCap > A.shieldCap && A.farmK > B.farmK, "each part changes the outpost: panels make power, batteries store it, shielding raises the cap, greenhouse grows food");
const legacy = JSON.stringify(endDay(newMission("moon"), idle())), explicit = JSON.stringify(endDay(newMission("moon", undefined, [], { design: DEFAULT_DESIGN }), idle()));
ok(legacy === explicit && newMission("moon").cap === 100 && newMission("moon").shield === 20, "the balanced loadout matches the original game exactly");
// the launch design decides success or failure
const designs: Design[] = []; for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) for (let d = 0; d <= 4; d++) for (let e = 0; e <= 4; e++) if (a + b + c + d + e === 10) designs.push(D(a, b, c, d, e));
const runD = (world: "moon" | "mars", scn: string | undefined, d: Design) => { let s = newMission(world, undefined, [], { scn, design: d }); while (!s.over) { const ev = eventFor(s); if (ev) s = choose(s, ev, 0); s = endDay(s, hSmart(s)); } return s; };
const marsWins = designs.filter((d) => runD("mars", undefined, d).over === "win").length / designs.length;
ok(marsWins > 0.25 && marsWins < 0.9, `on Mars the launch design decides the outcome: ${Math.round(marsWins * 100)}% of designs survive with good play`);
const oppWins = designs.filter((d) => runD("mars", "opportunity", d).over === "win").length / designs.length;
ok(oppWins > 0.15 && oppWins < 0.8, `in the Opportunity replay only ${Math.round(oppWins * 100)}% of designs survive`);
const moonScores = designs.map((d) => score(runD("moon", undefined, d)).total); ok(Math.max(...moonScores) - Math.min(...moonScores) >= 20, `on the Moon the design moves the score by ${Math.max(...moonScores) - Math.min(...moonScores)} points`);
ok(runD("mars", undefined, DEFAULT_DESIGN).over === "win", "the balanced loadout is still winnable on Mars");
ok(PARTS.length === 5 && PARTS.every((p) => p.why.length > 30) && designHint("mars").includes("43%") && designHint("moon", "apollo72").includes("Shielding"), "design screen content is complete and mission-specific");
const bad = runD("mars", undefined, D(0, 0, 2, 4, 4)); ok(bad.over === "lose" && designTip(bad).includes("launched"), `a poor design fails and the debrief explains the design link: "${designTip(bad).slice(0, 70)}…"`);
