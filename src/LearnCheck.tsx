import React, { useState } from "react";
import { Text } from "react-native";
import { present, PAIRS } from "./learn";
import { Btn, C, Card, H, Mu } from "./ui";

/** 5 questions. "pre" and "post" use different questions on the same ideas, so the gain is a fair measure of learning. */
export function LearnCheck({ form, onDone, onCancel }: { form: "pre" | "post"; onDone: (score: number) => void; onCancel: () => void }) {
  const [i, setI] = useState(0), [score, setScore] = useState(0), [pick, setPick] = useState<number | null>(null);
  if (i >= PAIRS.length) return (
    <>
      <Mu>LEARNING CHECK</Mu><H>{score}/5 {form === "pre" ? "to start" : "after playing"}</H>
      <Mu>{form === "pre" ? "Now play a mission. You will see how much you learn." : "Compare this with your first check on the outpost screen."}</Mu>
      <Btn pri t="Save and continue" onPress={() => onDone(score)} style={{ marginTop: 12 }} />
    </>
  );
  const q = present(form, i);
  return (
    <>
      <Mu>LEARNING CHECK · {form === "pre" ? "BEFORE" : "AFTER"} · QUESTION {i + 1} OF {PAIRS.length}</Mu>
      <Text style={{ color: C.v, fontSize: 18, letterSpacing: 4 }}>{"●".repeat(i)}{"◉"}{"○".repeat(PAIRS.length - i - 1)}</Text>
      <Card><Text style={{ color: C.fg, fontSize: 18 }}>{q.q}</Text></Card>
      {q.opts.map((o, k) => (
        <Btn key={k} testID="learn-option" t={o + (pick !== null && k === q.correct ? "  ✅" : pick === k ? "  ❌" : "")} style={{ marginVertical: 4 }} onPress={() => { if (pick === null) { setPick(k); if (k === q.correct) setScore(score + 1); } }} />
      ))}
      {pick !== null && <Card><Text style={{ color: C.fg }}>{pick === q.correct ? "✅ Correct! " : "💡 Good try. "}{PAIRS[i].why}</Text></Card>}
      {pick !== null && <Btn pri t={i + 1 < PAIRS.length ? "Next question" : "See my score"} style={{ marginTop: 10 }} onPress={() => { setPick(null); setI(i + 1); }} />}
      <Btn t="Skip for now" onPress={onCancel} style={{ marginTop: 8 }} />
    </>
  );
}
