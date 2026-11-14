// Facts from NASA public data (Solar System Exploration, ISS, Apollo records).
export type Kind = "fact" | "quiz" | "grav" | "video" | "land";
export const RANKS: [number, string][] = [[0, "Cadet"], [5, "Flight Trainee"], [15, "Mission Specialist"], [40, "Commander"]];
export type Task = { t: string; m: number; kind: Kind; arg: any; done?: boolean };

export const G: Record<string, number> = { Earth: 9.81, Moon: 1.62, Mars: 3.71, Venus: 8.87, Jupiter: 24.79, Europa: 1.31 };
export const FACTS = [
  "The Moon is 384,400 km away. Light needs about 1.3 seconds to reach it.",
  "Moon surface temperatures swing from about 127 °C in sunlight to −173 °C in shade.",
  "A Mars day (sol) lasts 24 h 39 min 35 s.",
  "Mars’ thin atmosphere is about 95% carbon dioxide.",
  "The ISS orbits roughly 400 km up at about 27,600 km/h.",
  "Astronauts on the ISS see about 16 sunrises every day.",
  "The ISS has been continuously crewed since November 2, 2000.",
  "Apollo 11 landed humans on the Moon on July 20, 1969.",
];
export const QUIZ: [string, string[], number][] = [
  ["How long does light take to travel from the Moon to Earth?", ["About 1.3 seconds", "About 13 seconds", "About 13 minutes"], 0],
  ["About how many times does the ISS orbit Earth each day?", ["4", "16", "60"], 1],
  ["Which gas makes up most of Mars’ atmosphere?", ["Oxygen", "Nitrogen", "Carbon dioxide"], 2],
  ["Moon gravity compared with Earth’s is…", ["About one sixth", "About half", "The same"], 0],
  ["Which mission first landed humans on the Moon?", ["Apollo 8", "Apollo 11", "Apollo 13"], 1],
  ["How long is a Mars day (sol)?", ["About 12 hours", "About 24 h 39 min", "About 48 hours"], 1],
];

const T = (t: string, m: number, kind: Kind, arg: any): Task => ({ t, m, kind, arg });
export const MISSIONS: Record<string, { name: string; emoji: string; re: RegExp; tasks: Task[] }> = {
  moon: { name: "Moon Landing", emoji: "🌕", re: /moon|lunar|artemis|apollo/i, tasks: [
    T("Study the Moon fact card", 2, "fact", FACTS[0] + " " + FACTS[1]),
    T("Watch a real NASA Moon video", 4, "video", "moon landing"),
    T("Test your Moon jump", 3, "grav", "Moon"),
    T("Quiz: light-speed to the Moon", 3, "quiz", 0),
    T("Quiz: first crewed landing", 2, "quiz", 4),
    T("Quiz: Moon gravity vs Earth", 3, "quiz", 3) ] },
  mars: { name: "Mars Expedition", emoji: "🔴", re: /mars|red planet/i, tasks: [
    T("Study the Mars fact card", 3, "fact", FACTS[2] + " Average temperature is about −63 °C."),
    T("Watch a real NASA Mars video", 4, "video", "mars rover"),
    T("Test your Mars jump", 3, "grav", "Mars"),
    T("Quiz: Mars atmosphere", 3, "quiz", 2),
    T("Quiz: length of a Mars day", 3, "quiz", 5),
    T("Meet Olympus Mons", 2, "fact", "Olympus Mons is about 22 km tall, roughly 2.5× Mount Everest.") ] },
  iss: { name: "Space Station Crew", emoji: "🛰️", re: /\biss\b|station|orbit|astronaut/i, tasks: [
    T("Study the ISS fact card", 2, "fact", FACTS[4] + " One lap takes about 90 minutes."),
    T("Watch: why astronauts float", 4, "video", "astronauts floating microgravity"),
    T("Quiz: orbits per day", 3, "quiz", 1),
    T("Read: why astronauts float", 3, "fact", "The station is in constant free fall around Earth. Gravity at 400 km is still about 90% of what you feel on the ground."),
    T("Weigh yourself on Earth", 3, "grav", "Earth"),
    T("Quiz: light-speed to the Moon", 3, "quiz", 0) ] },
};

export const generic = (x: string): Task[] => [
  T(`Define what “done” looks like for ${x}`, 2, "fact", "Write one sentence describing the finished result."),
  T("Gather everything you need", 3, "fact", "Open the files, tabs or tools you need. Nothing else."),
  T("Do the smallest first step", 5, "fact", "Start with the easiest piece. Starting is the hardest part."),
  T("Work the core for one focused block", 8, "fact", "One thing only. " + FACTS[Math.floor(Math.random() * FACTS.length)]),
  T("Review and note one win", 3, "fact", "Write down one thing that went well."),
];

const LAND: Record<string, string> = { moon: "Moon", mars: "Mars", iss: "Earth" };
const withLanding = (k: string) => { const t = MISSIONS[k].tasks.map((x) => ({ ...x })); t.splice(3, 0, T(`Landing challenge on ${LAND[k]}`, 4, "land", LAND[k])); return t; };
export function build(txt: string) {
  const x = txt.trim().slice(0, 60);
  const k = Object.keys(MISSIONS).find((k) => MISSIONS[k].re.test(x));
  return k ? { name: MISSIONS[k].name, emoji: MISSIONS[k].emoji, tasks: withLanding(k) }
           : { name: x, emoji: "🚀", tasks: generic(x) };
}

// Cosmo the companion: [emoji, star cost]
export const AV: [string, number][] = [["🧑‍🚀", 0], ["🐱", 15], ["🐶", 30], ["🤖", 50], ["👽", 80], ["🦄", 120]];
