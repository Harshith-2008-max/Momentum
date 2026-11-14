// 5-question learning check with parallel forms: form A (before) and form B (after) test the same ideas with different questions.
export type Q = { q: string; opts: [string, string, string] }; // opts[0] is the right answer; shown rotated
export const PAIRS: { a: Q; b: Q }[] = [
  { a: { q: "What is a good way to protect a Moon base from radiation?", opts: ["Cover it with soil (regolith)", "Paint it white", "Open the windows"] },
    b: { q: "Why do designers want to bury habitats on the Moon?", opts: ["Soil blocks radiation", "To hide them from view", "To make them look nicer"] } },
  { a: { q: "About how long is one lunar night?", opts: ["About 14 Earth days", "About 1 Earth day", "About 6 hours"] },
    b: { q: "A full lunar day plus night lasts about…", opts: ["29.5 Earth days", "24 hours", "7 days"] } },
  { a: { q: "How much sunlight does Mars get compared with Earth?", opts: ["About 43%", "About 100%", "About 200%"] },
    b: { q: "Solar panels on Mars make … than on Earth.", opts: ["Less power", "More power", "The same power"] } },
  { a: { q: "About how much water does the ISS recycle?", opts: ["About 98%", "About 10%", "None"] },
    b: { q: "Why do space stations recycle water?", opts: ["Carrying water from Earth costs a lot", "Water is free in space", "It tastes better"] } },
  { a: { q: "Where is there more radiation each day: Earth’s surface or the Moon’s surface?", opts: ["The Moon’s surface", "Earth’s surface", "They are the same"] },
    b: { q: "The Moon’s surface radiation is roughly … Earth’s.", opts: ["Hundreds of times more", "About the same", "Much less"] } },
];
export function present(form: "pre" | "post", i: number) {
  const q = PAIRS[i][form === "pre" ? "a" : "b"], rot = (i * 2 + (form === "pre" ? 0 : 1)) % 3;
  const opts = [0, 1, 2].map((k) => q.opts[(k + rot) % 3]);
  return { q: q.q, opts, correct: opts.indexOf(q.opts[0]) };
}
