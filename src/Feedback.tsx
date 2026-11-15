import React, { useState } from "react";
import { Share, Text, TextInput, View } from "react-native";
import { fx } from "./fx";
import { Btn, C, Card, Mu } from "./ui";

const TAGS = ["Fun", "Too hard", "Too easy", "Confusing", "Love the NASA facts"];
export type FeedbackData = { stars: number; tags: string[]; text: string };

/** Collects a rating, tags and a note. It is saved on the device; outside kid-safe mode the person can also send it with the share sheet. */
export function Feedback({ onSave, compact }: { onSave: (f: FeedbackData) => void; compact?: boolean }) {
  const [stars, setStars] = useState(0), [tags, setTags] = useState<string[]>([]), [text, setText] = useState(""), [sent, setSent] = useState(false);
  if (sent) return <Card><Text style={{ color: C.fg, fontWeight: "700" }}>💜 Thank you! Your feedback helps make the game better.</Text></Card>;
  const send = () => {
    if (!stars) return;
    onSave({ stars, tags, text: text.trim().slice(0, 300) }); setSent(true);
    if (!fx.safe) try { Share.share({ message: `Outpost Command feedback: ${"★".repeat(stars)}${"☆".repeat(5 - stars)}${tags.length ? " · " + tags.join(", ") : ""}${text.trim() ? "\n" + text.trim().slice(0, 300) : ""}` })?.catch?.(() => {}); } catch { /* sharing is optional */ }
  };
  return (
    <Card>
      <Text style={{ color: C.fg, fontWeight: "700" }}>{compact ? "How was this mission?" : "💬 Tell us what you think"}</Text>
      <View style={{ flexDirection: "row", gap: 6, marginVertical: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => <Btn key={n} pri={n <= stars} t={n <= stars ? "★" : "☆"} onPress={() => setStars(n)} />)}
      </View>
      {!compact && <>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {TAGS.map((tg) => <Btn key={tg} pri={tags.includes(tg)} t={tg} onPress={() => setTags(tags.includes(tg) ? tags.filter((x) => x !== tg) : [...tags, tg])} />)}
        </View>
        <TextInput value={text} onChangeText={setText} multiline maxLength={300} placeholder="Anything we should fix or add?" placeholderTextColor={C.mu}
          style={{ minHeight: 60, color: C.fg, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 8 }} />
      </>}
      <Btn pri t={stars ? "Send feedback" : "Pick a star rating first"} onPress={send} style={{ marginTop: 8 }} />
      {fx.safe && <Mu>Kid-safe mode: feedback stays on this device.</Mu>}
    </Card>
  );
}
