import React, { useState } from "react";
import { Share, Text, TextInput, View } from "react-native";
import { AV } from "./data";
import { fx } from "./fx";
import { Feedback, FeedbackData } from "./Feedback";
import { BADGES } from "./outpost";
import { levelInfo } from "./profile";
import { Prog, today } from "./store";
import { Btn, C, Card, H, Mu } from "./ui";

const RANKS: [number, string][] = [[0, "Cadet"], [5, "Flight Trainee"], [15, "Mission Specialist"], [40, "Commander"]];

export function Profile({ prog, update, onGo, onAvatar, onName }: { prog: Prog; update: (f: (p: Prog) => Prog) => void; onGo: (s: string) => void; onAvatar: (k: number) => void; onName: (n: string) => void }) {
  const [nm, setNm] = useState(fx.name), lv = levelInfo(prog), have = prog.badges || [], flight = prog.flight || [], own = prog.own || [0];
  const rank = RANKS.reduce((a, r) => (prog.blocks >= r[0] ? r[1] : a), "Cadet"), wins = flight.filter((f) => f.won).length, l = prog.learn || {};
  const stat = (n: string | number, label: string) => <View style={{ flex: 1, alignItems: "center" }}><Text style={{ color: C.fg, fontSize: 24, fontWeight: "800" }}>{n}</Text><Text style={{ color: C.mu, fontSize: 12, textAlign: "center" }}>{label}</Text></View>;
  return (
    <>
      <Mu>MY PROFILE</Mu>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(139,124,255,0.25)", borderColor: C.v, borderWidth: 2, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 42 }}>{AV[prog.av || 0][0]}</Text></View>
          <View style={{ flex: 1 }}>
            <TextInput value={nm} onChangeText={setNm} onEndEditing={() => onName(nm.trim() || "Astronaut")} maxLength={20} accessibilityLabel="Your name" style={{ color: C.fg, fontSize: 24, fontWeight: "800", padding: 0 }} />
            <Text style={{ color: C.v, fontWeight: "700" }}>Level {lv.level} · {rank}</Text>
          </View>
        </View>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 12, overflow: "hidden" }}><View style={{ width: `${Math.max(3, Math.round(lv.pct * 100))}%`, height: 10, backgroundColor: "#ffb04a" }} /></View>
        <Mu>{lv.xp} XP · {lv.to - lv.xp} XP to level {lv.level + 1}</Mu>
      </Card>
      <Card>
        <View style={{ flexDirection: "row" }}>{stat(prog.missions || 0, "missions")}{stat(wins, "wins")}{stat(prog.blocks, "focus blocks")}</View>
        <View style={{ flexDirection: "row", marginTop: 12 }}>{stat(`⭐ ${prog.stars}`, "stars")}{stat(have.length + "/" + Object.keys(BADGES).length, "badges")}{stat(prog.mins, "focus minutes")}</View>
        {l.pre !== undefined && <Mu>🧠 Learning check: {l.pre}/5{l.post !== undefined ? ` → ${l.post}/5 (${l.post - l.pre >= 0 ? "+" : ""}${l.post - l.pre})` : ""}</Mu>}
      </Card>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Btn t="🌐 Languages" onPress={() => onGo("lang")} style={{ flex: 1 }} /><Btn t="📖 Glossary" onPress={() => onGo("glossary")} style={{ flex: 1 }} /><Btn t="🏅 History" onPress={() => onGo("stats")} style={{ flex: 1 }} />
      </View>
      <Card>
        <Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>Cosmo’s wardrobe · ⭐ {prog.stars}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {AV.map((a, k) => <Btn key={k} pri={(prog.av || 0) === k} t={`${a[0]} ${own.includes(k) ? ((prog.av || 0) === k ? "wearing" : "wear") : a[1] + "⭐"}`} onPress={() => onAvatar(k)} />)}
        </View>
      </Card>
      <Card>
        <Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>Badges</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {Object.entries(BADGES).map(([id, b]) => <Text key={id} accessibilityLabel={`${b.name}: ${b.how}${have.includes(id) ? ", earned" : ""}`} style={{ fontSize: 34, opacity: have.includes(id) ? 1 : 0.2 }}>{b.icon}</Text>)}
        </View>
        {(() => { const nx = Object.entries(BADGES).find(([id]) => !have.includes(id)); return nx ? <Mu>Next: {nx[1].icon} {nx[1].name}: {nx[1].how}</Mu> : <Mu>You have every badge!</Mu>; })()}
      </Card>
      <Card>
        <Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>🚀 Flight log</Text>
        {flight.length === 0 && <Mu>No missions yet. Your first launch is waiting!</Mu>}
        {flight.slice(0, 8).map((f, k) => <Mu key={k}>{f.won ? "✅" : "💥"} {f.label} · {f.score}/100 · {f.d}</Mu>)}
      </Card>
      <Feedback onSave={(f: FeedbackData) => update((p) => ({ ...p, feedback: [{ d: today(), ...f }, ...(p.feedback || [])].slice(0, 20) }))} />
      {!fx.safe && <Btn t="Share my profile" onPress={() => Share.share({ message: `${fx.name || "Astronaut"} · Level ${lv.level} ${rank} · ⭐ ${prog.stars} · 🏅 ${have.length} badges in Outpost Command 🚀` })} style={{ marginTop: 6 }} />}
    </>
  );
}
