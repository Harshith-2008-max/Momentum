import { z } from "zod";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
// Same schema/rules as src/ai.ts and the edge function
const Schema = z.object({ tasks: z.array(z.object({ t: z.string().trim().min(8).max(90), m: z.number().int().min(1).max(9), hint: z.string().trim().max(200) })).min(4).max(8) });
const VAGUE = /^(study|work|try|do) (more|harder|better)\b/i;
const good = { tasks: [1,2,3,4,5].map(i => ({ t: `Write paragraph number ${i}`, m: 5, hint: "Keep it short." })) };
ok(Schema.safeParse(good).success, "valid AI reply accepted");
ok(!Schema.safeParse({ tasks: good.tasks.map(t => ({ ...t, m: 12 })) }).success, "step of 12 min rejected");
ok(!Schema.safeParse({ tasks: good.tasks.slice(0, 2) }).success, "too few steps rejected");
ok(!Schema.safeParse(null).success, "null (offline) rejected -> fallback");
ok(VAGUE.test("Study more"), "vague 'Study more' caught");
ok(!VAGUE.test("Study chapter 3 headings"), "concrete step allowed");
// fence stripping used in the edge function
const raw = "```json\n" + JSON.stringify(good) + "\n```";
ok(Schema.safeParse(JSON.parse(raw.replace(/^```(?:json)?|```$/g, "").trim())).success, "code-fenced JSON parses");
