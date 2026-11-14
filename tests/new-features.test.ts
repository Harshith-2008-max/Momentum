import { DAYS, choose, coachText, endDay, eventFor, newMission, score, stormScale } from "../src/outpost";
import { makeCode, parseCode, parseResults, resultLine } from "../src/teacher";
import { PAIRS, present } from "../src/learn";
import { pickFlare } from "../src/donki";
import { cfg, keys, t } from "../src/i18n";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };

// 1. Real solar flare data
const sample = [{ classType: "C3.1", peakTime: "2026-11-05T10:00Z" }, { classType: "M2.4", peakTime: "2026-11-02T04:00Z" }, { classType: "M1.0", peakTime: "2026-11-08T01:00Z" }, { classType: "X1.1", peakTime: "2026-10-20T01:00Z" }];
ok(JSON.stringify(pickFlare(sample)) === JSON.stringify({ date: "2026-10-20", cls: "X1.1" }), "pickFlare chooses the strongest flare (X over M over C)");
ok(pickFlare([]) === null && pickFlare(null) === null && pickFlare([{ nope: 1 }]) === null, "pickFlare handles empty or odd data");
ok(stormScale("X1.1") > stormScale("M2.0") && stormScale("M2.0") > stormScale("C1.0") && stormScale() === 1, "flare class scales storm strength");
let x = newMission("moon", undefined, [], { real: { date: "2026-10-20", cls: "X1.1" } }), c = newMission("moon", undefined, [], { real: { date: "2026-10-20", cls: "C1.0" } });
x.day = 5; c.day = 5; x.shield = 0; c.shield = 0;
const card = eventFor(x)!; ok(card.title.includes("Real NASA solar flare") && card.text.includes("2026-10-20"), "storm card names the real NASA flare and date");
ok(endDay(choose(x, card, 1), { work: [], lights: false, lab: false }).dose > endDay(choose(c, eventFor(c)!, 1), { work: [], lights: false, lab: false }).dose, "an X-class flare does more damage than a C-class flare");
ok(!eventFor(newMission("moon") && Object.assign(newMission("moon"), { day: 5 }))!.title.includes("Real"), "without live data the training storm is used");

// 3. Crew mode
const cm = newMission("moon", undefined, [], { crew: true });
ok(cm.slots === 3, "crew mode gives 3 work slots (one per role)");
const one = endDay(cm, { work: ["shield", "repair", "solar"], lights: true, lab: false });
ok(one.slots === 3 && one.shield > cm.shield && one.solar > 90, "all three crew jobs apply and slots reset to 3");

// 4. Teacher mode
const code = makeCode("mars", "dusty", true), p = parseCode(code)!;
ok(p.world === "mars" && p.mod === "dusty" && p.crew === true, `class code ${code} round-trips`);
ok(parseCode("nope") === null && parseCode("lasc2x")?.world === "moon", "class code validation is forgiving about case and strict about format");
const text = [resultLine({ code, name: "Ava|bad", score: 78, won: true, why: "", pre: 2, post: 4 }), resultLine({ code, name: "Ben", score: 30, won: false, why: "a power blackout (mission score 30, needs 50)", pre: 3, post: 3 }),
  resultLine({ code, name: "Cy", score: 35, won: false, why: "a power blackout", pre: 1, post: 4 }), "garbage line"].join("\n");
const r = parseResults(text);
ok(r.n === 3 && r.avg === 48 && r.pass === 33, `class dashboard: ${r.n} students, avg ${r.avg}, pass ${r.pass}%`);
ok(r.top[0][0] === "a power blackout" && r.top[0][1] === 2, "most common cause is surfaced for teaching");
ok(r.gain === 1.7 && r.gainN === 3, `average learning gain +${r.gain}`);
ok(!resultLine({ code, name: "A|B\nC", score: 1, won: true, why: "x" }).includes("\n"), "result lines are sanitised");

// 2. Learning check
for (let i = 0; i < PAIRS.length; i++) for (const f of ["pre", "post"] as const) { const q = present(f, i); ok(q.opts.length === 3 && new Set(q.opts).size === 3 && q.opts[q.correct] === PAIRS[i][f === "pre" ? "a" : "b"].opts[0], `learning Q${i + 1} ${f}: options valid, correct answer tracked`); }
ok(new Set(PAIRS.map((_, i) => present("pre", i).correct)).size > 1, "correct answer is not always in the same position");

// 5. Languages
cfg.lang = "en"; const en = t("endday"); cfg.lang = "ta"; const ta = t("endday"); cfg.lang = "hi"; const hi = t("endday"); cfg.lang = "en";
ok(en !== ta && ta !== hi && /[\u0B80-\u0BFF]/.test(ta) && /[\u0900-\u097F]/.test(hi), "Tamil and Hindi are present and use the right scripts");
ok(keys().every((k) => { const row = (["en", "ta", "hi"] as const).map((l) => { cfg.lang = l; return t(k); }); cfg.lang = "en"; return row.every((v) => v && v !== k); }), `all ${keys().length} UI strings exist in 3 languages`);

// 6. Coach
let lose = newMission("moon"); lose.day = 10; lose.power = 3; let n = lose; while (!n.over) { const ev = eventFor(n); if (ev) n = choose(n, ev, 1); n = endDay(n, { work: [], lights: true, lab: true }); }
const tip = coachText(n);
ok(n.over === "lose" && tip.length > 40 && tip.includes("power") || tip.length > 40, `coach explains the failure: "${tip.slice(0, 90)}…"`);
ok(coachText(newMission("moon")).length > 0 && DAYS === 14 && score(n).total >= 0, "coach and score work on any state");
