// Pure helpers for the Profile and Glossary screens.
import type { Prog } from "./store";
export function levelInfo(p: Pick<Prog, "blocks" | "missions" | "badges" | "best" | "learn" | "feedback">) {
  const xp = p.blocks * 10 + (p.missions || 0) * 25 + (p.badges || []).length * 30 + Object.keys(p.best || {}).length * 20 + (p.learn?.post !== undefined ? 20 : 0) + (p.feedback || []).length * 5;
  const level = Math.floor(Math.sqrt(xp / 20)) + 1, from = 20 * (level - 1) ** 2, to = 20 * level ** 2;
  return { xp, level, from, to, pct: Math.min(1, (xp - from) / (to - from)) };
}
export const GLOSSARY: [string, string][] = [
  ["Artemis", "NASA’s program to return people to the Moon."],
  ["CME (coronal mass ejection)", "A huge cloud of charged particles thrown out by the Sun."],
  ["Dust devil", "A small whirlwind. On Mars they have cleaned dust off rover solar panels."],
  ["Dust storm", "Wind that lifts dust on Mars. Big storms can block sunlight for weeks."],
  ["ECLSS", "The Environmental Control and Life Support System that gives the ISS crew air, water and a safe temperature."],
  ["Habitat", "A building where astronauts live and work in space."],
  ["Life support", "Machines that give a crew air, water and a safe temperature."],
  ["Lunar night", "The long dark part of the Moon’s day. It lasts about 14 Earth days."],
  ["Magnetosphere", "Earth’s magnetic bubble that blocks much solar radiation. The Moon and Mars have no global one."],
  ["mSv (millisievert)", "A unit that measures how much radiation the body absorbs."],
  ["MOXIE", "An experiment on the Perseverance rover that made oxygen from Mars’ carbon dioxide."],
  ["Perchlorate", "A salty chemical in Martian soil that must be washed out before growing food."],
  ["Regolith", "Loose dust and broken rock that cover the Moon and Mars."],
  ["Shielding", "Material between you and radiation. Soil, water and thick walls all help."],
  ["Sol", "One Mars day: 24 hours and 39 minutes."],
  ["Solar flare", "A sudden burst of light and energy from the Sun."],
  ["Solar particle storm", "A burst of fast particles from the Sun that can harm astronauts."],
];
const fold = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const searchGlossary = (q: string) => { const f = fold(q.trim()); return f ? GLOSSARY.filter(([t, d]) => fold(t).includes(f) || fold(d).includes(f)) : GLOSSARY; };
