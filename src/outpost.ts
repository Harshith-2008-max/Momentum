// Outpost Command: a deterministic lunar/Martian outpost simulation (pure logic, fully testable).
// Real figures: Moon surface ~1.37 mSv/day (Chang'e-4), Mars surface ~0.64 mSv/day (Curiosity RAD),
// Mars sunlight ~43% of Earth's, ISS water recovery ~98%, NASA career limit 600 mSv.
export type World = "moon" | "mars";
export type Design = { panels: number; battery: number; shield: number; farm: number; spares: number };
export type Mod = "stormy" | "dusty" | "fragile" | "hungry" | "lean";
export type Work = "solar" | "shield" | "farm" | "repair" | "rest" | "science";
export type Orders = { work: Work[]; lights: boolean; lab: boolean };
export type State = {
  world: World; day: number; power: number; air: number; water: number; food: number; shield: number; solar: number; ls: number;
  health: number; dose: number; unshielded: number; sci: number; stormToday: boolean; sheltered: boolean; dust: number; forceOff: number;
  slots: number; log: string[][]; over: null | "win" | "lose"; why: string;
  blackouts: number; storms: number; stormHit: number; hist: number[]; mods: Mod[];
  real?: { date: string; cls: string }; stormK: number; crew: boolean;
  scn?: string; night: [number, number]; nightHeat: number; stormName?: string; dmg: Record<string, number>;
  cap: number; genK: number; farmK: number; lsDecay: number; design: Design; shieldCap: number; lsCap: number; seed?: number; extra: Record<number, number>;
};
export type Choice = { label: string; note: string; apply: (s: State) => void };
export type EventCard = { icon: string; title: string; text: string; choices: Choice[] };
export const DAYS = 14, CREW = 3;
export const BASE_DOSE: Record<World, number> = { moon: 1.37, mars: 0.64 };
export const WORK: Record<Work, { icon: string; label: string; tip: string }> = {
  solar: { icon: "☀️", label: "Clean solar panels", tip: "+15 panel efficiency" },
  shield: { icon: "🛡️", label: "Pile soil on the roof", tip: "+12 radiation shielding" },
  farm: { icon: "🌱", label: "Tend greenhouse", tip: "Plants grow more food (needs grow lights)" },
  repair: { icon: "🔧", label: "Repair life support", tip: "+20 life-support condition" },
  rest: { icon: "😴", label: "Rest and exercise", tip: "+8 crew health" },
  science: { icon: "🔬", label: "Run science", tip: "+1 science point (needs lab power)" },
};
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const clone = (s: State): State => JSON.parse(JSON.stringify(s));

export const stormScale = (cls?: string) => (!cls ? 1 : cls.startsWith("X") ? 1.5 : cls.startsWith("M") ? 1 : 0.6);
export const BUDGET = 10, PART_MAX = 4;
export const DEFAULT_DESIGN: Design = { panels: 2, battery: 2, shield: 2, farm: 2, spares: 2 };
export const validDesign = (d: Design) => (Object.values(d) as number[]).every((n) => Number.isInteger(n) && n >= 0 && n <= PART_MAX) && (Object.values(d) as number[]).reduce((a, b) => a + b, 0) <= BUDGET;
export function newMission(world: World, boost?: "shield", mods: Mod[] = [], opts: { real?: { date: string; cls: string }; crew?: boolean; scn?: string; design?: Design; seed?: number } = {}): State {
  const sc = opts.scn ? SCENARIOS[opts.scn] : undefined, d = opts.design && validDesign(opts.design) ? opts.design : DEFAULT_DESIGN;
  const cap = 60 + 20 * d.battery;
  const s: State = { world: sc ? sc.world : world, day: 1, power: mods.includes("lean") ? cap * 0.6 : cap, air: 100, water: 100, food: 100, shield: 5 + 7.5 * d.shield, solar: 100, ls: 100, health: 100, dose: 0,
    unshielded: 0, sci: 0, stormToday: false, sheltered: false, dust: sc?.dustDays ?? 0, forceOff: 0, slots: opts.crew ? 3 : 2, log: [], over: null, why: "",
    blackouts: 0, storms: 0, stormHit: 0, hist: [], mods, real: sc ? undefined : opts.real, stormK: sc?.stormK ?? stormScale(opts.real?.cls), crew: !!opts.crew,
    dmg: {}, scn: opts.scn, night: sc?.night ?? [10, 12], nightHeat: sc?.nightHeat ?? 15, stormName: sc?.stormName,
    cap, genK: 0.5 + 0.25 * d.panels, farmK: 0.5 + 0.25 * d.farm, lsDecay: 6 - d.spares, design: d, shieldCap: 40 + 15 * d.shield, lsCap: 70 + 15 * d.spares, seed: opts.seed, extra: {} };
  if (!sc && opts.seed !== undefined) s.extra = pickExtras(s.world, opts.seed, s.world === "moon" ? [3, 5, 8, s.night[0] - 1, 12, 11] : [3, 4, 7, 9, 11, 13]);
  if (boost === "shield") s.shield += 15;
  return s;
}
export const nightDay = (s: State) => s.world === "moon" && s.day >= s.night[0] && s.day <= s.night[1];
export const sunFactor = (s: State) => (s.world === "moon" ? (nightDay(s) ? 0 : 1) : s.dust > 0 ? 0.15 : 0.43);

const cargo: EventCard = { icon: "📦", title: "Cargo lander arrives", text: "A lander brought one crate. Every choice leaves something else short.", choices: [
  { label: "Food crate", note: "+30 food", apply: (s) => { s.food = clamp(s.food + 30); } },
  { label: "Solar patch kit", note: "+25 panel efficiency", apply: (s) => { s.solar = clamp(s.solar + 25); } },
  { label: "Radiation shield bags", note: "+20 shielding", apply: (s) => { s.shield = clamp(s.shield + 20); } }] };
const stormCard = (s: State): EventCard => ({ icon: "☢️",
  title: s.stormName ?? (s.real ? `Real NASA solar flare: ${s.real.cls} (${s.real.date})` : "Solar particle storm today!"),
  text: (s.real ? `NASA recorded a ${s.real.cls} solar flare on ${s.real.date}. Here is what a storm like it would do to your outpost. ` : "A burst of radiation from the Sun is arriving. ") + "Shelter protects the crew but costs work time.",
  choices: [
    { label: "Shelter the crew", note: "Almost no storm dose, but only 1 work slot", apply: (x) => { x.stormToday = true; x.sheltered = true; x.slots = 1; } },
    { label: "Keep working", note: "Full storm dose unless your shielding is high", apply: (x) => { x.stormToday = true; } }] });
const leak: EventCard = { icon: "💥", title: "Micrometeorite leak", text: "A tiny rock punched a hole in a pipe. Air is escaping.", choices: [
  { label: "Patch it now", note: "Costs 1 work slot today, life support +10", apply: (s) => { s.slots = 1; s.ls = clamp(s.ls + 10); } },
  { label: "Ignore it", note: "Air −12 and life support −10", apply: (s) => { s.air = clamp(s.air - 12); s.ls = clamp(s.ls - 10); } }] };
const sick: EventCard = { icon: "🤒", title: "A crew member is unwell", text: "Their fever is climbing.", choices: [
  { label: "Medicine", note: "Water −10, health +10", apply: (s) => { s.water = clamp(s.water - 10); s.health = clamp(s.health + 10); } },
  { label: "Bed rest day", note: "Only 1 work slot today, health +6", apply: (s) => { s.slots = 1; s.health = clamp(s.health + 6); } }] };
const night: EventCard = { icon: "🌑", title: "Lunar night is coming", text: "From tomorrow there is no sunlight for several days. Panels make zero power. Plan your battery!", choices: [
  { label: "Got it, plan ahead", note: "Tip: turn off lights and lab to stretch the battery", apply: () => {} }] };
const dust: EventCard = { icon: "🌪️", title: "Martian dust storm", text: "Dust is blocking the Sun for 4 days. Panels make far less power.", choices: [
  { label: "Survival mode", note: "Lights and lab forced off for 4 days (no extra food growth)", apply: (s) => { s.dust = 4; s.forceOff = 4; } },
  { label: "Ride it out", note: "Keep normal operations and risk a blackout", apply: (s) => { s.dust = 4; } }] };

export function eventFor(s: State): EventCard | null {
  const d = s.day;
  if (s.scn === "opportunity") return d === 3 ? cargo : d === 9 ? leak : d === 11 ? sick : null;
  if (s.scn === "apollo72") return d === 3 ? cargo : d === 6 || d === 8 ? stormCard(s) : d === 11 ? sick : null;
  if (s.scn === "chandrayaan") return d === 3 ? cargo : d === s.night[0] - 1 ? night : d === 12 ? sick : null;
  if (s.extra && s.extra[d] !== undefined) return EXTRAS[s.extra[d]].card;
  if (s.world === "moon") return d === 3 ? cargo : d === 5 ? stormCard(s) : d === 8 ? leak : d === s.night[0] - 1 ? night : d === 12 ? sick : d === 11 && s.mods.includes("stormy") ? stormCard(s) : null;
  return d === 3 ? cargo : d === 4 ? dust : d === 7 ? stormCard(s) : d === 9 ? leak : d === 11 ? sick : d === 13 && s.mods.includes("stormy") ? stormCard(s) : null;
}
export function choose(s: State, card: EventCard, i: number): State { const n = clone(s); card.choices[i].apply(n); return n; }

const mainCause = (s: State) => Object.entries(s.dmg).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
export function endDay(prev: State, o: Orders): State {
  const s = clone(prev), L: string[] = [];
  const hurt = (n: number, why: string) => { s.health = clamp(s.health - n); s.dmg[why] = (s.dmg[why] || 0) + n; };
  const lights = o.lights && s.forceOff === 0, lab = o.lab && s.forceOff === 0;
  const work = o.work.slice(0, s.slots);
  // Power: panels make power from sunlight; the battery covers any gap.
  const gen = Math.round(80 * sunFactor(s) * s.genK * (s.solar / 100));
  const heat = s.world === "moon" ? (nightDay(s) ? s.nightHeat : 5) : 10;
  const demand = 15 + heat + (lights ? 12 : 0) + (lab ? 8 : 0);
  const avail = s.power + gen, brown = avail < demand;
  s.power = brown ? 0 : clamp(avail - demand, 0, s.cap);
  L.push(`⚡ Panels made ${gen}, outpost used ${demand}.${nightDay(s) ? " (Night: no sunlight)" : ""}`);
  if (brown) { s.blackouts++; s.ls = clamp(s.ls - 10); hurt(8, "a power blackout"); L.push("⚠️ Blackout! Life support was starved: crew health −8.");
    if (nightDay(s)) { hurt(10, "freezing in the lunar night"); L.push("🥶 No power for heaters in the lunar night: the crew is freezing (−10)."); } }
  // Work orders
  let farm = false, sciDone = false;
  for (const w of work) {
    if (w === "solar") s.solar = clamp(s.solar + 15);
    if (w === "shield") s.shield = clamp(s.shield + 12, 0, Math.max(s.shield, s.shieldCap));
    if (w === "farm") farm = true;
    if (w === "repair") s.ls = clamp(s.ls + 20, 0, Math.max(s.ls, s.lsCap));
    if (w === "rest") s.health = clamp(s.health + 8);
    if (w === "science") { if (lab && !brown) { s.sci += 1; sciDone = true; } else L.push("🔬 Science failed: the lab had no power."); }
  }
  if (work.length) L.push("🛠️ Crew work: " + work.map((w) => WORK[w].icon).join(" "));
  if (sciDone) L.push("🔬 Science point earned!");
  // Life support wears down; air and water depend on it.
  s.ls = clamp(s.ls - s.lsDecay - (s.mods.includes("fragile") ? 2 : 0));
  s.air = clamp(s.air + (s.ls / 100) * 11 - CREW * 3);
  s.water = clamp(s.water - CREW * 1.5 * (1 - 0.98 * (s.ls / 100)));
  s.food = clamp(s.food - 10 - (s.mods.includes("hungry") ? 2 : 0) + (lights ? (farm ? 11 : 4) * s.farmK : 0));
  s.solar = clamp(s.solar - (s.world === "mars" ? 4 : 3) - (s.dust > 0 ? 3 : 0) - (s.mods.includes("dusty") ? 2 : 0));
  // Radiation
  const base = BASE_DOSE[s.world], eff = base * (1 - 0.8 * (s.shield / 100));
  let spike = 0; if (s.stormToday) spike = 20 * s.stormK * (1 - 0.9 * (s.shield / 100)) * (s.sheltered ? 0.15 : 1);
  if (s.stormToday) s.storms++;
  s.dose += eff + spike; s.unshielded += base + (s.stormToday ? 20 * s.stormK : 0);
  L.push(`☢️ Dose today ${(eff + spike).toFixed(1)} mSv (shielding ${Math.round(s.shield)}%).`);
  if (spike >= 6) { const hit = Math.round(spike * 0.8); s.stormHit++; hurt(hit, "a solar storm"); L.push(`☢️ Storm radiation hurt the crew: health −${hit}.`); }
  if (s.shield < 50) { hurt(3, "weak radiation shielding"); L.push("☢️ Weak shielding: radiation is wearing the crew down (−3)."); }
  // Crew needs
  if (s.air <= 0) { hurt(30, "running out of air"); L.push("💨 Out of air! Health −30."); }
  if (s.water <= 0) { hurt(20, "running out of water"); L.push("💧 No water! Health −20."); }
  if (s.food <= 0) { hurt(20, "running out of food"); L.push("🍎 No food! Health −20."); }
  if (!brown && s.air > 30 && s.water > 30 && s.food > 30 && !s.stormToday && s.shield >= 50) s.health = clamp(s.health + 1);
  // End of day bookkeeping
  s.log.push(L); s.hist.push(Math.round(s.health));
  if (s.dust > 0) s.dust -= 1; if (s.forceOff > 0) s.forceOff -= 1;
  s.stormToday = false; s.sheltered = false; s.slots = s.crew ? 3 : 2; s.day += 1;
  if (s.health <= 0) { s.over = "lose"; s.why = mainCause(s) || "the crew’s health failed"; } else if (s.day > DAYS) {
    const t = score({ ...s, over: "win" }).total;
    if (t >= 50) s.over = "win"; else { s.over = "lose"; s.why = (mainCause(s) || "too many systems were neglected") + " (mission score " + t + ", needs 50)"; }
  }
  return s;
}

export function score(s: State) {
  const survival = Math.round(s.health * 0.4);
  const resources = Math.round((((s.power / s.cap) * 100 + s.air + s.water + s.food) / 4) * 0.2);
  const radiation = s.unshielded ? Math.round(20 * Math.min(1, Math.max(0, 1 - s.dose / s.unshielded) * 1.25)) : 0;
  const science = Math.min(20, s.sci * 4);
  const total = s.over === "lose" ? Math.min(40, survival + resources + radiation + science) : survival + resources + radiation + science;
  const rank = s.over === "lose" ? "Mission failed, try again!" : total >= 85 ? "Commander" : total >= 65 ? "Mission Specialist" : "Flight Trainee";
  return { survival, resources, radiation, science, total, rank };
}

export const LEARN: Record<World, string[]> = {
  moon: ["The Moon’s surface gets about 1.37 mSv of radiation a day (Chang’e-4 measurement). Earth’s surface gives about 0.007. Piling soil (regolith) on a habitat roof is a leading shielding idea.",
    "A lunar day and night each last about 14 Earth days. Some south-pole peaks get sunlight almost all the time, one reason Artemis is heading there. We squeezed the night to 3 days for the game.",
    "India’s Chandrayaan-3 (ISRO) landed near the Moon’s south pole on August 23, 2023, the closest any spacecraft has landed to the pole.",
    "NASA’s career radiation limit for astronauts is 600 mSv."],
  mars: ["Mars gets about 43% of the sunlight Earth does, so solar panels make much less power.",
    "Curiosity’s RAD instrument measured about 0.64 mSv/day on the surface of Mars.",
    "MOXIE on Perseverance made oxygen from Mars’ carbon-dioxide air. A global dust storm in 2018 cut off sunlight to the Opportunity rover."],
};
export const COMMON_LEARN = "The ISS water recovery system now reaches about 98% (NASA, 2023). Closing the loop is why crews can stay in space for months.";

// ---- Engagement layer: daily challenge, badges, advice, share grid ----
export const MODS: Record<Mod, { icon: string; name: string; text: string }> = {
  stormy: { icon: "☢️", name: "Stormy Sun", text: "An extra solar storm arrives late in the mission." },
  dusty: { icon: "🌫️", name: "Dusty Panels", text: "Solar panels wear out 2 points faster each day." },
  fragile: { icon: "🔩", name: "Fragile Machines", text: "Life support wears out 2 points faster each day." },
  hungry: { icon: "🍽️", name: "Hungry Crew", text: "The crew eats 2 more food every day." },
  lean: { icon: "🔋", name: "Lean Launch", text: "You start with only 60% battery." },
};
const MOD_IDS = Object.keys(MODS) as Mod[];
export function dailyChallenge(date: string): { world: World; mod: Mod } {
  const h = [...date].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return { world: h % 2 ? "mars" : "moon", mod: MOD_IDS[(h >> 3) % MOD_IDS.length] };
}
export const BADGES: Record<string, { icon: string; name: string; how: string }> = {
  moon: { icon: "🌕", name: "Moon Pioneer", how: "Win a Moon mission" },
  mars: { icon: "🔴", name: "Mars Pioneer", how: "Win a Mars mission" },
  blackout: { icon: "⚡", name: "Lights On", how: "Win with zero blackouts" },
  storm: { icon: "🌩️", name: "Storm Survivor", how: "Face a solar storm and take no storm damage" },
  green: { icon: "🌱", name: "Green Thumb", how: "Finish with food above 60" },
  guard: { icon: "🛡️", name: "Radiation Guardian", how: "Radiation control 17 or more" },
  lab: { icon: "🔬", name: "Lab Star", how: "Earn 5 science points" },
  home: { icon: "❤️", name: "Everyone Home Safe", how: "Finish with crew health above 90" },
  cmd: { icon: "🎖️", name: "Commander", how: "Score 85 or more" },
  opportunity: { icon: "🤖", name: "Beat the Dust Storm", how: "Win the Opportunity 2018 history mission" },
  chandrayaan: { icon: "🌙", name: "Survived the Night", how: "Win the Chandrayaan-3 night history mission" },
  apollo72: { icon: "☀️", name: "Storm Shelter Hero", how: "Win the 1972 solar storm history mission" },
};
export function earned(s: State): string[] {
  if (s.over !== "win") return [];
  const sc = score(s), b: string[] = [s.world];
  if (s.scn) b.push(s.scn);
  if (s.blackouts === 0) b.push("blackout");
  if (s.storms > 0 && s.stormHit === 0) b.push("storm");
  if (s.food > 60) b.push("green");
  if (sc.radiation >= 17) b.push("guard");
  if (s.sci >= 5) b.push("lab");
  if (s.health > 90) b.push("home");
  if (sc.total >= 85) b.push("cmd");
  return b;
}
export function advice(s: State): string {
  if (s.over) return "";
  if (s.world === "moon" && s.day >= s.night[0] - 3 && s.day < s.night[0] && (s.power / s.cap) * 100 < 80) return "Lunar night is coming. Top up the battery, then switch off the lab to stretch it.";
  if (nightDay(s) && (s.power / s.cap) * 100 < 35) return "The battery is low in the dark. Switch off lights and lab now!";
  if (s.dust > 0 && (s.power / s.cap) * 100 < 60) return "Dust is blocking the Sun. Switch off lights and lab, and clean the panels.";
  if (s.shield < 50) return "Shielding under 50% slowly hurts the crew. Pile soil on the roof.";
  if (s.ls < 55) return "Life support is wearing out. Repair it before the air runs low.";
  if (s.food < 40) return "Food is running low. Turn on grow lights and tend the greenhouse.";
  if (s.solar < 55 && sunFactor(s) > 0) return "Dusty panels make less power. Clean them.";
  if (s.health < 50) return "The crew is tired. Give them a rest slot.";
  return "Systems look steady. Try a science job while things are calm.";
}
export const shareGrid = (s: State) => s.hist.map((h) => (h >= 70 ? "🟩" : h >= 40 ? "🟨" : "🟥")).join("");
export const rating = (best?: number) => (!best || best < 50 ? 0 : best >= 85 ? 3 : best >= 70 ? 2 : 1);

// ---- Mission coach (offline, deterministic) ----
export function coachText(s: State): string {
  const p: string[] = [s.over === "win" ? `Great job! Your crew made it through ${DAYS} days.` : `The mission ended because of ${s.why}.`];
  if (s.blackouts > 0) p.push(`The outpost lost power ${s.blackouts} time${s.blackouts > 1 ? "s" : ""}. Batteries run the base when there is no sunlight, so keep some charge and turn off the lab and lights before a long night or dust storm.`);
  if (s.stormHit > 0) p.push("A solar storm hurt the crew. Soil on the roof, or sheltering inside, cuts the radiation a lot.");
  if (s.shield < 50) p.push("Your shielding ended below 50%, which slowly wears the crew down. Try a shielding job every few days.");
  if (s.food < 30) p.push("Food ran low. Grow lights and greenhouse work are how a base feeds its crew.");
  if (s.ls < 50) p.push("Life support was worn out. Repair it before the air and water drop.");
  if (p.length === 1 && s.over === "win") p.push("Try the daily challenge for a harder twist.");
  return p.slice(0, 4).join(" ");
}
export const coachSummary = (s: State) => ({ world: s.world, won: s.over === "win", why: s.why.replace(/[^a-z0-9 ,.()’-]/gi, "").slice(0, 80), health: Math.round(s.health),
  blackouts: s.blackouts, storms: s.storms, stormHit: s.stormHit, shield: Math.round(s.shield), food: Math.round(s.food), ls: Math.round(s.ls), score: score(s).total });

// ---- Mission History: replay real events and try to beat what really happened ----
export const SCENARIOS: Record<string, { world: World; icon: string; title: string; year: string; brief: string; real: string; src: string; video: string;
  dustDays?: number; night?: [number, number]; nightHeat?: number; stormK?: number; stormName?: string }> = {
  opportunity: { world: "mars", icon: "🤖", title: "The Opportunity Dust Storm", year: "2018", video: "Opportunity rover dust storm", src: "NASA/JPL", dustDays: 6,
    brief: "A planet-wide dust storm is blocking the Sun for 6 days. Can your solar-powered outpost sleep through it?",
    real: "In June 2018 a global dust storm cut off sunlight to NASA’s solar-powered Opportunity rover. It last communicated on June 10, 2018, and NASA ended the mission in February 2019. Opportunity had worked on Mars for about 15 years, though it was built for 90 days." },
  chandrayaan: { world: "moon", icon: "🌙", title: "Surviving the Lunar Night", year: "2023", video: "Chandrayaan-3 Vikram Pragyan", src: "ISRO", night: [7, 10], nightHeat: 8,
    brief: "The Sun sets for 4 days. Charge the battery first, then switch off everything you can.",
    real: "India’s Chandrayaan-3 lander Vikram and rover Pragyan were put to sleep in early September 2023, before the lunar night. ISRO tried to wake them on September 22, 2023 but heard nothing. In the game the night is shortened to 4 days; the real one lasts about 14 Earth days." },
  apollo72: { world: "moon", icon: "☀️", title: "The Storm Between Apollo Missions", year: "1972", video: "solar storm radiation astronauts", src: "NASA", night: [99, 99], stormK: 2, stormName: "The great solar storm of August 1972",
    brief: "A huge solar storm hits twice. Shielding and shelter decide who comes home.",
    real: "In August 1972, between the Apollo 16 and Apollo 17 missions, one of the most intense solar particle storms of the space age struck. No one was on the Moon at the time. Scientists later estimated that astronauts caught outside could have received a dangerous dose." },
};

// ---- Design your outpost: the launch-weight trade-off ----
export const PARTS: { id: keyof Design; icon: string; name: string; why: string }[] = [
  { id: "panels", icon: "☀️", name: "Solar panels", why: "Make power in sunlight. Real panels get dusty and weigh a lot to launch." },
  { id: "battery", icon: "🔋", name: "Batteries", why: "Store power for night and dust storms. Heavy, but they work without sunlight." },
  { id: "shield", icon: "🛡️", name: "Radiation shielding", why: "Thicker walls block more radiation. Real plans bury habitats under soil." },
  { id: "farm", icon: "🌱", name: "Greenhouse", why: "Growing food means launching less of it, but plants need power and care." },
  { id: "spares", icon: "🔧", name: "Spare parts", why: "Keep life support running longer. Real crews repair things all the time." },
];
export function designHint(world: World, scn?: string): string {
  if (scn === "opportunity") return "Dust will block the Sun for days. Batteries and spares matter most.";
  if (scn === "chandrayaan") return "The Sun sets for days. Think batteries, and keep the lab off.";
  if (scn === "apollo72") return "Two huge storms are coming. Shielding is your best friend.";
  return world === "moon" ? "The Moon has a long dark night, so plan for batteries. Radiation is also strong there." : "Mars gets only 43% of Earth’s sunlight, so panels and batteries matter.";
}
export function designTip(s: State): string {
  const d = s.design, top = Object.entries(s.dmg).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const mk = (id: keyof Design, text: string) => `You launched ${d[id]} unit${d[id] === 1 ? "" : "s"} of ${PARTS.find((p) => p.id === id)!.name.toLowerCase()}. ${text}`;
  if (/blackout/.test(top)) return mk(d.battery <= d.panels ? "battery" : "panels", "More batteries or panels would have kept the lights on, but each unit means less of something else.");
  if (/storm|shielding/.test(top)) return mk("shield", "Extra shielding protects the crew, but it costs weight you could have spent on power or food.");
  if (/food/.test(top)) return mk("farm", "A bigger greenhouse feeds the crew, but it needs power for grow lights.");
  if (/air|water/.test(top)) return mk("spares", "More spare parts slow the wear on life support.");
  return "Your launch mix worked. Try shifting weight to see how another mix changes the mission.";
}

// ---- Extra events: drawn at random for each mission (seeded, so a daily challenge is identical for everyone) ----
const ev = (icon: string, title: string, text: string, a: [string, string, (s: State) => void], b: [string, string, (s: State) => void]): EventCard =>
  ({ icon, title, text, choices: [{ label: a[0], note: a[1], apply: a[2] }, { label: b[0], note: b[1], apply: b[2] }] });
export const EXTRAS: { worlds?: World[]; card: EventCard }[] = [
  { card: ev("🍄", "Mold in the greenhouse", "Some plants are getting sick.", ["Throw out the sick plants", "Food −12", (s) => { s.food = clamp(s.food - 12); }], ["Spend the day cleaning", "Only 1 work slot today, food −3", (s) => { s.slots = 1; s.food = clamp(s.food - 3); }]) },
  { card: ev("🧊", "Water ice found nearby!", "Your rover spotted ice. Real missions search for water ice to drink and to make fuel.", ["Send the rover", "Battery −10, water +15", (s) => { s.power = Math.max(0, s.power - 10); s.water = clamp(s.water + 15); }], ["Just map it", "+1 science point", (s) => { s.sci += 1; }]) },
  { card: ev("🔩", "A solar panel is stuck", "One panel will not turn toward the Sun.", ["Fix it now", "Only 1 work slot today, panels +10", (s) => { s.slots = 1; s.solar = clamp(s.solar + 10); }], ["Leave it", "Panels −10", (s) => { s.solar = clamp(s.solar - 10); }]) },
  { card: ev("💻", "Software glitch", "The life-support computer is acting strangely.", ["Reboot it", "Battery −5, life support +5", (s) => { s.power = Math.max(0, s.power - 5); s.ls = clamp(s.ls + 5); }], ["Wait it out", "Life support −8", (s) => { s.ls = clamp(s.ls - 8); }]) },
  { card: ev("☄️", "Meteor shower warning", "Tiny space rocks may hit the outpost.", ["Stay inside", "Only 1 work slot today, shielding +5", (s) => { s.slots = 1; s.shield = clamp(s.shield + 5); }], ["Keep working", "Crew health −6 unless shielding is 60 or more", (s) => { if (s.shield < 60) s.health = clamp(s.health - 6); }]) },
  { card: ev("🎂", "A crew birthday!", "Everyone would love a small celebration.", ["Throw a party", "Food −5, crew health +6", (s) => { s.food = clamp(s.food - 5); s.health = clamp(s.health + 6); }], ["Skip it", "Crew health −2", (s) => { s.health = clamp(s.health - 2); }]) },
  { card: ev("📡", "Comms with Earth are down", "Mission Control cannot hear you.", ["Run diagnostics", "Only 1 work slot today, +1 science point", (s) => { s.slots = 1; s.sci += 1; }], ["Ignore it", "Crew health −3", (s) => { s.health = clamp(s.health - 3); }]) },
  { worlds: ["mars"], card: ev("🌪️", "A dust devil sweeps your panels!", "Real dust devils on Mars have cleaned rover solar panels for free.", ["What luck!", "Panels +20", (s) => { s.solar = clamp(s.solar + 20); }], ["Watch it spin", "Panels +20, +1 science point", (s) => { s.solar = clamp(s.solar + 20); s.sci += 1; }]) },
  { worlds: ["moon"], card: ev("🧹", "Moon dust in the airlock", "Sharp lunar dust sticks to everything and can damage seals, as Apollo crews found.", ["Clean it all", "Only 1 work slot today, life support +8", (s) => { s.slots = 1; s.ls = clamp(s.ls + 8); }], ["Ignore it", "Life support −8", (s) => { s.ls = clamp(s.ls - 8); }]) },
  { worlds: ["mars"], card: ev("🧂", "Salty chemicals in the soil", "Martian soil has perchlorate salts that are harmful to plants and people.", ["Wash the soil first", "Water −8, food +10", (s) => { s.water = clamp(s.water - 8); s.food = clamp(s.food + 10); }], ["Plant anyway", "Food −6", (s) => { s.food = clamp(s.food - 6); }]) },
  { worlds: ["moon"], card: ev("🌅", "A peak of near-constant sunlight", "Some peaks near the Moon’s south pole get sunlight almost all the time.", ["Move a panel there", "Only 1 work slot today, panels +20", (s) => { s.slots = 1; s.solar = clamp(s.solar + 20); }], ["Stay put", "No change", () => {}]) },
];
function pickExtras(world: World, seed: number, taken: number[]): Record<number, number> {
  let x = (seed >>> 0) || 1; const rnd = () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296;
  const days = [2, 4, 6, 10, 13, 14].filter((d) => !taken.includes(d));
  const pool = EXTRAS.map((v, i) => ({ v, i })).filter((p) => !p.v.worlds || p.v.worlds.includes(world)).map((p) => p.i);
  const out: Record<number, number> = {};
  for (let k = 0; k < 3 && days.length && pool.length; k++) { const di = Math.floor(rnd() * days.length), pi = Math.floor(rnd() * pool.length); out[days[di]] = pool[pi]; days.splice(di, 1); pool.splice(pi, 1); }
  return out;
}
export const hashSeed = (txt: string) => [...txt].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// ---- Instant feedback: what changed overnight ----
export function deltaChips(a: State, b: State): { icon: string; name: string; d: number }[] {
  const f = (s: State) => ({ health: s.health, power: (s.power / s.cap) * 100, air: s.air, water: s.water, food: s.food, shield: s.shield, solar: s.solar, ls: s.ls });
  const A = f(a), B = f(b), meta = { health: ["❤️", "Crew health"], power: ["⚡", "Battery"], air: ["💨", "Air"], water: ["💧", "Water"], food: ["🍎", "Food"], shield: ["🛡️", "Shield"], solar: ["☀️", "Panels"], ls: ["🔧", "Life support"] } as const;
  return (Object.keys(meta) as (keyof typeof A)[]).map((k) => ({ icon: meta[k][0], name: meta[k][1], d: Math.round(B[k] - A[k]) })).filter((x) => Math.abs(x.d) >= 3);
}
