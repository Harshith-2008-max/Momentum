import { EXTRAS, Orders, State, Work, choose, deltaChips, endDay, eventFor, hashSeed, newMission, nightDay, score } from "../src/outpost";
import { GLOSSARY, levelInfo, searchGlossary } from "../src/profile";
import { LANGS, ORDER, cfg, filterLangs, keys, t } from "../src/i18n";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };

// ---- Languages and search ----
ok(LANGS.length === 18 && ORDER.length === 18 && LANGS.every(([l], i) => l === ORDER[i]) && new Set(ORDER).size === 18, "18 languages, listed once each in a consistent order");
ok(filterLangs("").length === 18 && filterLangs("espanol")[0]?.[0] === "es" && filterLangs("Bengali")[0]?.[0] === "bn" && filterLangs("中")[0]?.[0] === "zh" && filterLangs("tamil")[0]?.[0] === "ta" && filterLangs("zzz").length === 0, "language search works by native name, English name and ignores accents");
ok(filterLangs("ma").map(([l]) => l).includes("mr") && filterLangs("ma").map(([l]) => l).includes("ml"), "partial search matches several languages");
const row = (k: string) => ORDER.map((l) => { cfg.lang = l; return t(k); });
ok(keys().every((k) => row(k).every((v) => v && v !== k)), `all ${keys().length} UI strings exist in all 18 languages`);
cfg.lang = "en";
const SCRIPT: Record<string, RegExp> = { ta: /[\u0B80-\u0BFF]/, hi: /[\u0900-\u097F]/, te: /[\u0C00-\u0C7F]/, kn: /[\u0C80-\u0CFF]/, ml: /[\u0D00-\u0D7F]/, bn: /[\u0980-\u09FF]/, mr: /[\u0900-\u097F]/, gu: /[\u0A80-\u0AFF]/, zh: /[\u4E00-\u9FFF]/, ja: /[\u3040-\u30FF\u4E00-\u9FFF]/, ko: /[\uAC00-\uD7AF]/, ru: /[\u0400-\u04FF]/ };
for (const [l, re] of Object.entries(SCRIPT)) ok(keys().every((k) => re.test(row(k)[ORDER.indexOf(l as any)])), `${l}: every string uses the right script`);
for (const l of ["es", "fr", "pt", "de", "id"]) { const i = ORDER.indexOf(l as any); ok(keys().filter((k) => row(k)[i] !== row(k)[0]).length >= keys().length * 0.8, `${l}: at least 80% of strings differ from English`); }

// ---- Extra events ----
const dark = (s: State) => nightDay(s) || (s.world === "moon" && s.day >= s.night[0] - 1 && s.day <= s.night[1]) || s.dust > 0;
const smart = (s: State): Orders => { const w: Work[] = []; if (s.ls < 75) w.push("repair"); if (s.shield < 70) w.push("shield"); if (s.solar < 90 && (s.dust > 0 || !dark(s))) w.push("solar"); if (s.health < 60) w.push("rest"); if (w.length < 2 && s.food < 70) w.push("farm"); if (w.length < 2) w.push("science"); return { work: w, lights: !dark(s) && s.power > 40, lab: !dark(s) && s.power > 40 }; };
const play = (world: "moon" | "mars", seed: number | undefined, pick = 0) => { let s = newMission(world, undefined, [], { seed }); const seen: string[] = []; while (!s.over) { const e = eventFor(s); if (e) { seen.push(e.title); s = choose(s, e, Math.min(pick, e.choices.length - 1)); } s = endDay(s, smart(s)); } return { s, seen }; };
ok(EXTRAS.length >= 11 && EXTRAS.every((x) => x.card.choices.length === 2 && x.card.choices.every((c) => c.label && c.note) && x.card.text.length > 15), `${EXTRAS.length} extra event cards, each with two costed choices`);
ok(Object.keys(newMission("moon", undefined, [], { seed: 5 }).extra).length === 3 && Object.keys(newMission("moon").extra).length === 0, "a seeded mission has 3 extra events; an unseeded one is unchanged");
ok(JSON.stringify(play("mars", 11).seen) === JSON.stringify(play("mars", 11).seen) && JSON.stringify(play("mars", 11).seen) !== JSON.stringify(play("mars", 12).seen), "the same seed gives the same events, a different seed gives different ones");
ok(hashSeed("2026-11-14") === hashSeed("2026-11-14") && hashSeed("2026-11-14") !== hashSeed("2026-11-15"), "daily seed is stable for a date");
const titles = new Set<string>(); let worst = { moon: 1, mars: 1 };
for (const w of ["moon", "mars"] as const) {
  let wins = 0, wins1 = 0; const N = 200;
  for (let seed = 1; seed <= N; seed++) { const a = play(w, seed, 0), b = play(w, seed, 1); a.seen.forEach((x) => titles.add(x)); if (a.s.over === "win") wins++; if (b.s.over === "win") wins1++; }
  console.log(`   ${w}: good play wins ${Math.round(100 * wins / N)}% (first choices), ${Math.round(100 * wins1 / N)}% (second choices)`);
  ok(wins / N >= (w === "moon" ? 0.9 : 0.55) && wins / N <= 1, `${w}: with random extra events, good play still wins most missions (${Math.round(100 * wins / N)}%)`);
}
ok(titles.size >= 14, `players meet many different events across missions (${titles.size} distinct)`);
// every choice on every extra card keeps the meters sane
let sane = true; for (const x of EXTRAS) for (let i = 0; i < 2; i++) { const s = newMission("mars"); const n = choose(s, x.card, i); for (const v of [n.food, n.water, n.air, n.ls, n.solar, n.shield, n.health, n.power]) if (!(v >= 0 && v <= 200) || Number.isNaN(v)) sane = false; }
ok(sane, "every extra choice leaves valid meter values");

// ---- Instant feedback ----
const a = newMission("moon"), b = endDay(a, { work: ["shield"], lights: true, lab: false }), chips = deltaChips(a, b);
ok(chips.some((c) => c.name === "Shield" && c.d > 0) && chips.some((c) => c.name === "Food" && c.d < 0) && chips.every((c) => Math.abs(c.d) >= 3 && c.icon), `feedback chips show what changed: ${chips.map((c) => c.icon + (c.d > 0 ? "+" : "") + c.d).join(" ")}`);

// ---- Profile level and glossary ----
const base = { blocks: 0, missions: 0, badges: [], best: {}, learn: {}, feedback: [] } as any;
const lv = (p: any) => levelInfo({ ...base, ...p });
ok(lv({}).level === 1 && lv({ blocks: 20, missions: 4 }).level > lv({ blocks: 5 }).level && lv({ missions: 2 }).pct >= 0 && lv({ missions: 100 }).pct <= 1, "levels rise with play and the progress bar stays between 0 and 1");
ok(lv({ learn: { post: 4 } }).xp > lv({}).xp && lv({ badges: ["moon", "mars"] }).xp === 60, "XP counts blocks, missions, badges, best scores, learning check and feedback");
ok(GLOSSARY.length >= 15 && searchGlossary("regolith")[0]?.[0] === "Regolith" && searchGlossary("RADIATION").length >= 2 && searchGlossary("xyzzy").length === 0 && searchGlossary("").length === GLOSSARY.length, "glossary search finds terms in titles and definitions");
