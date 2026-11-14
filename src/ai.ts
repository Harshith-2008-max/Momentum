import { z } from "zod";
import { invokeBreakdown, invokeCoach } from "./sync";
import { State, coachSummary } from "./outpost";
import type { Task } from "./data";

const Schema = z.object({
  tasks: z.array(z.object({ t: z.string().trim().min(8).max(90), m: z.number().int().min(1).max(9), hint: z.string().trim().max(200) })).min(4).max(8),
});
const VAGUE = /^(study|work|try|do) (more|harder|better)\b/i;

/** Returns validated AI micro-tasks, or null so the caller keeps the offline rule-based plan. */
export async function aiTasks(goal: string): Promise<Task[] | null> {
  const raw = await Promise.race([invokeBreakdown(goal), new Promise<null>((r) => setTimeout(() => r(null), 8000))]);
  const p = Schema.safeParse(raw);
  if (!p.success || p.data.tasks.some((x) => VAGUE.test(x.t))) return null;
  return p.data.tasks.map((x) => ({ t: x.t, m: x.m, kind: "fact" as const, arg: x.hint || "Do just this one step." }));
}

/** Optional AI mission coach: returns a short validated string, or null so the offline coach text is used. */
export async function aiCoach(s: State): Promise<string | null> {
  const raw = (await Promise.race([invokeCoach(coachSummary(s)), new Promise<null>((r) => setTimeout(() => r(null), 8000))])) as { text?: unknown } | null;
  const p = z.object({ text: z.string().min(20).max(450) }).safeParse(raw);
  return p.success ? p.data.text : null;
}
