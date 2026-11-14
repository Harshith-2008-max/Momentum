import React, { useState } from "react";
import { Share, Switch, Text, TextInput, View } from "react-native";
import { MODS, Mod, World } from "./outpost";
import { makeCode, parseResults } from "./teacher";
import { Btn, C, Card, H, Mu } from "./ui";

export function Teacher({ onBack }: { onBack: () => void }) {
  const [world, setWorld] = useState<World>("moon"), [mod, setMod] = useState<Mod>("stormy"), [crew, setCrew] = useState(false);
  const [code, setCode] = useState(""), [pasted, setPasted] = useState("");
  const r = parseResults(pasted);
  return (
    <>
      <Mu>TEACHER MODE · no accounts, no student data stored on a server</Mu><H>Run it in your class</H>
      <Card>
        <Text style={{ color: C.fg, fontWeight: "700" }}>1. Make a class code</Text>
        <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
          {(["moon", "mars"] as World[]).map((w) => <Btn key={w} pri={world === w} t={w === "moon" ? "🌕 Moon" : "🔴 Mars"} onPress={() => setWorld(w)} />)}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(MODS) as Mod[]).map((m) => <Btn key={m} pri={mod === m} t={`${MODS[m].icon} ${MODS[m].name}`} onPress={() => setMod(m)} />)}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          <Switch value={crew} onValueChange={setCrew} /><Text style={{ color: C.fg, flex: 1 }}>👥 Crew mode (groups of 3 share one phone)</Text>
        </View>
        <Btn pri t="Generate class code" style={{ marginTop: 10 }} onPress={() => setCode(makeCode(world, mod, crew))} />
        {!!code && <>
          <Text accessibilityLabel={`Class code ${code.split("").join(" ")}`} style={{ color: C.fg, fontSize: 40, fontWeight: "800", textAlign: "center", letterSpacing: 6, marginTop: 10 }}>{code}</Text>
          <Mu>Students enter this code on the Outpost screen. Everyone plays the same scenario.</Mu>
          <Btn t="Share the code" style={{ marginTop: 6 }} onPress={() => Share.share({ message: `Join my Outpost Command class mission. Open the app, go to Outpost Command and enter code ${code}` })} />
        </>}
      </Card>
      <Card>
        <Text style={{ color: C.fg, fontWeight: "700" }}>2. See how your class did</Text>
        <Mu>Students tap “Send my result to my teacher” after a mission. Paste their messages here, one per line.</Mu>
        <TextInput multiline value={pasted} onChangeText={setPasted} placeholder="OC1|..." placeholderTextColor={C.mu}
          style={{ minHeight: 90, color: C.fg, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 8 }} />
        {r.n > 0 && <View style={{ marginTop: 10 }}>
          <Text style={{ color: C.fg, fontSize: 18, fontWeight: "700" }}>{r.n} students · average {r.avg}/100 · {r.pass}% passed</Text>
          {r.top.length > 0 && <Mu>Most common reason missions failed: {r.top.map(([k, n]) => `${k} (${n})`).join(", ")}</Mu>}
          <Mu>{r.gain !== null ? `📈 Average learning gain: ${r.gain >= 0 ? "+" : ""}${r.gain} questions out of 5 (${r.gainN} students)` : "No before-and-after checks in these results yet."}</Mu>
          {r.rows.map((x, k) => <Mu key={k}>{x.won ? "✅" : "💥"} {x.name}: {x.score}/100{x.pre !== undefined && x.post !== undefined ? ` · quiz ${x.pre}→${x.post}` : ""}</Mu>)}
        </View>}
      </Card>
      <Btn t="Back" onPress={onBack} />
    </>
  );
}
