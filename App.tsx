import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Share, Switch, Text, TextInput, View, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "./src/haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { fx, loadFx, saveFx, sfx } from "./src/fx";
import { StatusBar } from "expo-status-bar";
import { AV, build, FACTS, G, MISSIONS, QUIZ, Task } from "./src/data";
import { pull, push } from "./src/sync";
import { aiTasks } from "./src/ai";
import { empty, load, Prog, save, today } from "./src/store";
import { ApodCard, Bounce, Btn, C, Card, Confetti, H, MissionCard, Mu, RankBar, Ring, Sky } from "./src/ui";
import { Apod, getApod } from "./src/apod";
import { Lander } from "./src/Lander";
import { Outpost } from "./src/Outpost";
import { LANGS, cfg } from "./src/i18n";
import { BADGES } from "./src/outpost";
import { Hero, PK } from "./src/Planet";
import { Videos } from "./src/Videos";

type Scr = "home" | "plan" | "flow" | "done" | "stats" | "watch" | "welcome" | "settings" | "outpost";
const SCALE = [0.6, 1, 1.3];
const WEEKDAY_CELLS = 35;

function Activity({ t, onWin }: { t: Task; onWin: () => void }) {
  const [pick, setPick] = useState<number | null>(null), [body, setBody] = useState(String(t.arg));
  if (t.kind === "land") return <Card><Lander body={t.arg} onWin={onWin} /></Card>;
  if (t.kind === "video") return <Card><Videos q0={t.arg} /></Card>;
  if (t.kind === "fact") return <Card><Text style={{ color: C.fg, fontSize: 17 }}>{t.arg}</Text></Card>;
  if (t.kind === "grav")
    return (
      <Card>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Object.keys(G).map((b) => <Btn key={b} t={b} pri={b === body} onPress={() => setBody(b)} />)}
        </View>
        <Text style={{ color: C.fg, marginTop: 10, fontSize: 16 }}>
          On {body} (gravity {G[body]} m/s²) a 40 kg person feels like {(40 * G[body] / G.Earth).toFixed(1)} kg, and a 0.5 m Earth jump becomes {(0.5 * G.Earth / G[body]).toFixed(2)} m.
        </Text>
      </Card>
    );
  const [q, opts, ans] = QUIZ[t.arg];
  return (
    <Card>
      <Text style={{ color: C.fg, fontSize: 17, marginBottom: 8 }}>{q}</Text>
      {opts.map((o, i) => (
        <Pressable key={i} onPress={() => { setPick(i); Haptics.selectionAsync(); }}
          style={{ padding: 12, borderRadius: 12, marginVertical: 4, borderWidth: 1,
            borderColor: pick === null ? C.bd : i === ans ? "#5ee2a0" : i === pick ? "#ff7a8a" : C.bd }}>
          <Text style={{ color: C.fg }}>{o}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

export default function App() {
  const [scr, setScr] = useState<Scr>("home");
  const [goal, setGoal] = useState(""), [energy, setEnergy] = useState(1);
  const [mission, setMission] = useState<{ name: string; emoji: string; tasks: Task[] }>({ name: "", emoji: "🚀", tasks: [] });
  const [i, setI] = useState(0), [left, setLeft] = useState(0), [total, setTotal] = useState(1), [run, setRun] = useState(false);
  const [prog, setProg] = useState<Prog>(empty), [fact, setFact] = useState(FACTS[0]), [restart, setRestart] = useState(false);
  const end = useRef(0);
  const [ai, setAi] = useState(false), [count, setCount] = useState(0), [apod, setApod] = useState<Apod | null>(null), [nm, setNm] = useState(""), [, bump] = useState(0);
  useEffect(() => { getApod().then(setApod); }, []);
  useEffect(() => { loadFx().then(() => { cfg.lang = fx.lang; bump((n) => n + 1); if (!fx.name) setScr("welcome"); }); }, []);
  // Always read the freshest state from timer callbacks (avoids stale closures).
  const latest = useRef({ mission, i, prog }); latest.current = { mission, i, prog };
  useEffect(() => {
    if (scr === "flow" && run) activateKeepAwakeAsync("momentum"); else deactivateKeepAwake("momentum");
    return () => { deactivateKeepAwake("momentum"); };
  }, [scr, run]);
  useEffect(() => {
    if (count <= 0) return;
    const id = setTimeout(() => { if (count === 1) begin(i); else sfx("tick"); setCount(count - 1); }, 800);
    return () => clearTimeout(id);
  }, [count]);

  useEffect(() => { load().then(async (l) => { setProg(l); const r = await pull(); if (r && r.blocks > l.blocks) { setProg(r); save(r); } }); }, []);

  const dur = (t: Task) => Math.max(1, Math.min(9, Math.round(t.m * SCALE[energy])));
  const plan = async (txt: string) => {
    if (!txt.trim()) return;
    const b = build(txt); setMission(b); setAi(false); setRestart(false); setScr("plan");
    if (b.emoji !== "🚀") return; // built-in missions already have curated steps
    const t = await aiTasks(txt.trim().slice(0, 60)); // offline or failed: keep the rule-based plan
    if (t) { setMission((m) => (m.name === b.name && !m.tasks.some((x) => x.done) ? { ...m, tasks: t } : m)); setAi(true); }
  };

  const start = (idx: number) => { setI(idx); setRun(false); setCount(3); setScr("flow"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); sfx("tick"); };
  const begin = (idx: number) => {
    sfx("go");
    const s = dur(mission.tasks[idx]) * 60;
    setI(idx); setTotal(s); setLeft(s); end.current = Date.now() + s * 1000; setRun(true); setScr("flow");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const pause = () => { setLeft((end.current - Date.now()) / 1000); setRun(false); };
  const resume = () => { end.current = Date.now() + left * 1000; setRun(true); };

  // Timer uses an end timestamp, so it stays correct after the app is backgrounded.
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      const l = Math.max(0, (end.current - Date.now()) / 1000);
      setLeft(l);
      if (l <= 0) { clearInterval(id); finish(); }
    }, 250);
    return () => clearInterval(id);
  }, [run]);

  const finish = () => {
    setRun(false);
    const { mission, i, prog } = latest.current;
    const t = mission.tasks[i], m = dur(t), d = today();
    const tasks = mission.tasks.map((x, k) => (k === i ? { ...x, done: true } : x));
    setMission({ ...mission, tasks });
    const done = tasks.every((x) => x.done) && mission.emoji !== "🚀" && !(prog.patches || []).includes(mission.name);
    const p: Prog = { ...prog, patches: done ? [...(prog.patches || []), mission.name] : prog.patches || [], blocks: prog.blocks + 1, mins: prog.mins + m, stars: prog.stars + 3,
      days: { ...prog.days, [d]: (prog.days[d] || 0) + m }, log: [{ t: t.t, m, d }, ...prog.log].slice(0, 20) };
    setProg(p); save(p); push(p);
    setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    sfx("chime"); setScr("done");
  };

  const next = mission.tasks.findIndex((t) => !t.done);
  const buy = (k: number) => {
    const own = prog.own || [0]; let p: Prog = { ...prog, own, av: k };
    if (!own.includes(k)) {
      if (prog.stars < AV[k][1]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
      p = { ...p, stars: prog.stars - AV[k][1], own: [...own, k] }; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setProg(p); save(p); push(p);
  };
  const mm = Math.floor(Math.ceil(left) / 60), ss = Math.ceil(left) % 60;

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#14103a", C.bg, "#0a1a3a"]} style={{ flex: 1 }}>
        <StatusBar style="light" /><Sky key={fx.hq ? "sky-h" : "sky-l"} />
        <SafeAreaView key={fx.hq ? "ui-h" : "ui-l"} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16 }}>
            <Text style={{ color: C.fg, fontWeight: "700", fontSize: 16 }}>{AV[prog.av || 0][0]} ⭐ {prog.stars}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            {scr === "welcome" && (
              <View style={{ alignItems: "center" }}>
                <Hero /><H>Welcome, astronaut!</H><Mu>What should Cosmo call you?</Mu>
                <TextInput value={nm} onChangeText={setNm} maxLength={20} placeholder="Your name" placeholderTextColor={C.mu}
                  style={{ alignSelf: "stretch", color: C.fg, fontSize: 18, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 14, backgroundColor: C.card, marginVertical: 12 }} />
                <Btn t="Blast off 🚀" pri style={{ alignSelf: "stretch" }} onPress={() => { fx.name = nm.trim() || "Astronaut"; saveFx(); setScr("home"); }} />
              </View>
            )}

            {scr === "settings" && (
              <>
                <Mu>SETTINGS</Mu><H>Make it yours</H>
                <Card>
                  {([["sound", "🔊 Sound effects"], ["haptics", "📳 Haptic feedback"], ["hq", "✨ High graphics (turn off if slow)"]] as const).map(([k, l]) => (
                    <View key={k} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
                      <Text style={{ color: C.fg, flex: 1 }}>{l}</Text>
                      <Switch value={fx[k]} onValueChange={(v) => { fx[k] = v; saveFx(); bump((n) => n + 1); }} />
                    </View>
                  ))}
                </Card>
                <Mu>Language (Outpost screens; Tamil and Hindi are machine-assisted, please help us improve them)</Mu>
                <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>{LANGS.map(([l, n]) => <Btn key={l} pri={fx.lang === l} t={n} onPress={() => { fx.lang = l; cfg.lang = l; saveFx(); bump((x) => x + 1); }} />)}</View>
                <Mu>Momentum can’t block other apps. For fewer distractions, use your phone’s Do Not Disturb or Focus mode.</Mu>
              </>
            )}

            {scr === "outpost" && (
              <Outpost prog={prog} onExit={() => setScr("home")} update={(f) => { const p = f(latest.current.prog); latest.current.prog = p; setProg(p); save(p); push(p); }} />
            )}

            {scr === "home" && (
              <>
                <Mu>MOMENTUM · MISSION TRAINER</Mu>
                <Text style={{ color: C.fg, fontSize: 18 }}>Hi {fx.name || "Astronaut"} 👋</Text>
                <Hero />
                <H>What do you want to move forward today?</H>
                <RankBar blocks={prog.blocks} />
                <Pressable accessibilityRole="button" onPress={() => setScr("outpost")} style={{ marginVertical: 8 }}>
                  <LinearGradient colors={["#ff8a3d", "#c2273a"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 18, borderWidth: 1, borderColor: C.bd }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>NEW · NASA SPACE APPS CHALLENGE MODE</Text>
                    <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>🛰️ Outpost Command</Text>
                    <Text style={{ color: "rgba(255,255,255,0.85)" }}>Run a Moon or Mars outpost. Balance power, air, water, food and radiation shielding to keep your crew alive.</Text>
                  </LinearGradient>
                </Pressable>
                {apod && <ApodCard a={apod} />}
                <TextInput value={goal} onChangeText={setGoal} onSubmitEditing={() => plan(goal)} maxLength={60}
                  placeholder="Land on Mars, or finish my essay" placeholderTextColor={C.mu}
                  style={{ color: C.fg, fontSize: 17, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 14, backgroundColor: C.card }} />
                <Btn t="Plan it" pri onPress={() => plan(goal)} style={{ marginTop: 10 }} />
                <Mu>Or choose a mission</Mu>
                {Object.values(MISSIONS).map((m) => <MissionCard key={m.name} emoji={m.emoji} name={m.name} sub={`${m.tasks.length} steps · real NASA videos`} onPress={() => plan(m.name)} />)}
                <Mu>Energy today</Mu>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["🌙 Low", "⚡ Steady", "🔥 High"].map((l, k) => <Btn key={l} t={l} pri={energy === k} onPress={() => setEnergy(k)} />)}
                </View>
              </>
            )}

            {scr === "plan" && (
              <>
                <Mu>{mission.emoji} MISSION BRIEFING</Mu>
                <H>{mission.name}</H>
                {ai && <Mu>✨ AI-personalised plan</Mu>}
                <Mu>{mission.tasks.filter((t) => !t.done).length} micro-tasks · {mission.tasks.reduce((a, t) => a + (t.done ? 0 : dur(t)), 0)} min · each under 10 minutes</Mu>
                {restart && <Card><Text style={{ color: C.fg }}>No problem. Try just 1 minute.</Text>
                  <Btn t="Just 1 minute" pri onPress={() => { mission.tasks[i].m = 1; setRestart(false); start(i); }} style={{ marginTop: 8 }} /></Card>}
                <Card>
                  {mission.tasks.map((t, k) => (
                    <View key={k} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 }}>
                      <Text>{t.done ? "✅" : t.kind === "video" ? "🎬" : "○"}</Text>
                      <TextInput value={t.t} editable={!t.done} style={{ flex: 1, color: t.done ? C.mu : C.fg }}
                        onChangeText={(v) => setMission({ ...mission, tasks: mission.tasks.map((x, j) => (j === k ? { ...x, t: v } : x)) })} />
                      <Text style={{ color: C.mu }}>{dur(t)}m</Text>
                    </View>
                  ))}
                </Card>
                <Btn t={next < 0 ? "Mission complete 🎉" : "START"} pri onPress={() => (next < 0 ? setScr("stats") : start(next))} />
              </>
            )}

            {scr === "flow" && (
              <>
                <Mu>FLOW MODE · STEP {i + 1} OF {mission.tasks.length}</Mu>
                <H>{mission.tasks[i].t}</H>
                {count > 0 ? <Text style={{ color: C.fg, fontSize: 120, fontWeight: "200", textAlign: "center", height: 250 }}>{count}</Text> : <Ring p={1 - left / total} kind={PK[mission.name] ?? "earth"} label={`${mm}:${String(ss).padStart(2, "0")}`} />}
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                  <Btn t={run ? "Pause" : "Resume"} onPress={run ? pause : resume} />
                  <Btn t="Stop" onPress={() => { setCount(0); pause(); setRestart(true); setScr("plan"); }} />
                </View>
                <Activity key={i} t={mission.tasks[i]} onWin={() => { const p = { ...latest.current.prog, stars: latest.current.prog.stars + 3 }; setProg(p); save(p); push(p); }} />
              </>
            )}

            {scr === "done" && (
              <View style={{ alignItems: "center" }}>
                <Confetti /><Bounce><Text style={{ fontSize: 80 }}>{next < 0 ? "🏅" : AV[prog.av || 0][0]}</Text></Bounce>
                <H>{next < 0 ? "Mission complete!" : "Step complete"}</H>
                <Mu>+3 ⭐ earned. Smooth burn, systems nominal.</Mu>
                <Card><Mu>DID YOU KNOW · NASA DATA</Mu><Text style={{ color: C.fg, fontSize: 16 }}>{fact}</Text></Card>
                <Btn pri t={next < 0 ? "View progress" : "Next step"} onPress={() => (next < 0 ? setScr("stats") : start(next))} style={{ alignSelf: "stretch" }} />
                {next >= 0 && <Btn t="Back to plan" onPress={() => setScr("plan")} style={{ marginTop: 8, alignSelf: "stretch" }} />}
                {next < 0 && <Btn t="Share my mission patch" onPress={() => Share.share({ message: `I completed the ${mission.name} mission in Momentum! ${mission.emoji}` })} style={{ marginTop: 8, alignSelf: "stretch" }} />}
              </View>
            )}

            {scr === "watch" && (
              <>
                <Mu>WATCH & LEARN</Mu><H>Real NASA videos</H>
                <Card><Videos q0="astronauts" editable /></Card>
              </>
            )}

            {scr === "stats" && (
              <>
                <Mu>MOMENTUM PORTFOLIO</Mu><H>Your flight log</H>
                <RankBar blocks={prog.blocks} />
                <Card><Text style={{ color: C.fg, marginBottom: 8 }}>Outpost badges · {(prog.badges || []).length}/{Object.keys(BADGES).length}</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{Object.entries(BADGES).map(([id, b]) => <Text key={id} accessibilityLabel={`${b.name}: ${b.how}`} style={{ fontSize: 34, opacity: (prog.badges || []).includes(id) ? 1 : 0.2 }}>{b.icon}</Text>)}</View><Mu>Best scores: Moon {(prog.best || {}).moon ?? "–"} · Mars {(prog.best || {}).mars ?? "–"}</Mu></Card>
                <Card><Text style={{ color: C.fg, marginBottom: 8 }}>Mission patches</Text><View style={{ flexDirection: "row", gap: 14 }}>{Object.values(MISSIONS).map((m) => <Text key={m.name} accessibilityLabel={m.name} style={{ fontSize: 40, opacity: (prog.patches || []).includes(m.name) ? 1 : 0.2 }}>{m.emoji}</Text>)}</View><Mu>Finish every step of a mission to earn its patch.</Mu></Card>
                <Card><Text style={{ color: C.fg, marginBottom: 8 }}>Cosmo’s wardrobe · ⭐ {prog.stars}</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{AV.map((a, k) => <Btn key={k} pri={(prog.av || 0) === k} t={`${a[0]} ${(prog.own || [0]).includes(k) ? "wear" : a[1] + "⭐"}`} onPress={() => buy(k)} />)}</View></Card>
                <Card>
                  <Text style={{ color: C.fg, fontSize: 18 }}>{prog.blocks} focus blocks · {prog.mins} minutes · ⭐ {prog.stars}</Text>
                  <Mu>Missing a day never costs you anything.</Mu>
                </Card>
                <Card>
                  <Text style={{ color: C.fg, marginBottom: 8 }}>Last 5 weeks</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {Array.from({ length: WEEKDAY_CELLS }, (_, n) => {
                      const d = new Date(); d.setDate(d.getDate() - (WEEKDAY_CELLS - 1 - n));
                      const mins = prog.days[d.toISOString().slice(0, 10)] || 0;
                      return <View key={n} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `rgba(139,124,255,${mins ? Math.min(1, 0.25 + mins / 45) : 0.08})` }} />;
                    })}
                  </View>
                </Card>
                <Card>
                  <Text style={{ color: C.fg, marginBottom: 6 }}>Focus history</Text>
                  {prog.log.length === 0 && <Mu>No sessions yet. Your first launch is one tap away.</Mu>}
                  {prog.log.slice(0, 8).map((l, k) => <Mu key={k}>{l.t} · {l.m} min · {l.d}</Mu>)}
                </Card>
              </>
            )}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, padding: 10, margin: 10, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: C.bd }}>
            {([["home", "🏠 Home"], ["watch", "🎬 Watch"], ["stats", "🏅 Stats"], ["settings", "⚙️"]] as [Scr, string][]).map(([s, l]) => (
              <Btn key={s} t={l} pri={scr === s} onPress={() => { setCount(0); if (run) pause(); setScr(s); }} />
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}
