import React, { useEffect, useRef, useState } from "react";
import { Share, Switch, Text, TextInput, View } from "react-native";
import * as Haptics from "./haptics";
import { fx, sfx } from "./fx";
import { LearnCheck } from "./LearnCheck";
import { Teacher } from "./Teacher";
import { RealStorm, latestFlare } from "./donki";
import { aiCoach } from "./ai";
import { t } from "./i18n";
import { parseCode, resultLine } from "./teacher";
import { Planet } from "./Planet";
import { Videos } from "./Videos";
import { Btn, C, Card, Confetti, H, Mu } from "./ui";
import { Prog, today } from "./store";
import { BADGES, BUDGET, COMMON_LEARN, DEFAULT_DESIGN, Design, PARTS, PART_MAX, SCENARIOS, designHint, designTip, DAYS, EventCard, LEARN, MODS, Mod, Orders, State, WORK, Work, World, advice, choose, dailyChallenge, coachText, earned, endDay, eventFor, newMission, nightDay, rating, score, shareGrid } from "./outpost";

const BOOST_COST = 10;
const TUT = ["Welcome! Keep 3 astronauts alive for 14 days. The bars show how your base is doing. Green is good, red is danger.",
  "Each day your crew can do 2 jobs. Jobs fix things or build things. Tap two jobs below.",
  "Lights and the lab use battery power. At night or in a dust storm, switch them off to save power.",
  "Tap End day, then read what happened. Every choice costs something. Cosmo gives a tip each day."];
const tone = (v: number) => (v > 50 ? "#5ee2a0" : v > 25 ? "#ffd66b" : "#ff7a8a");
const word = (v: number) => (v > 50 ? t("ok") : v > 25 ? t("low") : t("danger"));

function Meter({ icon, name, v, cmd, extra }: { icon: string; name: string; v: number; cmd: boolean; extra?: string }) {
  return (
    <View style={{ marginVertical: 5 }} accessible accessibilityLabel={`${name} ${Math.round(v)} percent, ${word(v)}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: C.fg }}>{icon} {name}{extra ? <Text style={{ color: C.mu }}> {extra}</Text> : null}</Text>
        <Text style={{ color: tone(v), fontWeight: "700" }}>{cmd ? `${Math.round(v)}% ` : ""}{word(v)}</Text>
      </View>
      <View style={{ height: 9, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 3 }}>
        <View style={{ width: `${Math.max(2, Math.round(v))}%`, height: 9, backgroundColor: tone(v) }} />
      </View>
    </View>
  );
}

export function Outpost({ prog, update, onExit }: { prog: Prog; update: (f: (p: Prog) => Prog) => void; onExit: () => void }) {
  const stars = prog.stars, best = prog.best || {}, have = prog.badges || [], learn = prog.learn || {};
  const [phase, setPhase] = useState<"pick" | "play" | "debrief" | "teacher" | "learn" | "design">("pick");
  const [s, setS] = useState<State>(newMission("moon")), [ev, setEv] = useState<EventCard | null>(null);
  const [work, setWork] = useState<Work[]>([]), [lights, setLights] = useState(true), [lab, setLab] = useState(true);
  const [last, setLast] = useState<string[] | null>(null), [cmd, setCmd] = useState(false), [boost, setBoost] = useState(false);
  const awarded = useRef(false), rewound = useRef(false), snaps = useRef<State[]>([]);
  const [daily, setDaily] = useState(false), [bonus, setBonus] = useState(0), [newB, setNewB] = useState<string[]>([]);
  const clone = (x: State): State => JSON.parse(JSON.stringify(x));
  const [real, setReal] = useState<RealStorm | null>(null), [crewOn, setCrewOn] = useState(false), [turn, setTurn] = useState(0), [picks, setPicks] = useState<(Work | null)[]>([null, null, null]);
  const [code, setCode] = useState(""), [codeIn, setCodeIn] = useState(""), [codeErr, setCodeErr] = useState(""), [coachAi, setCoachAi] = useState(""), [learnForm, setLearnForm] = useState<"pre" | "post">("pre");
  const [pending, setPending] = useState<{ w: World; mods: Mod[]; isDaily: boolean; o: { crew?: boolean; code?: string; scn?: string } } | null>(null);
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN), [tut, setTut] = useState(-1);
  useEffect(() => { latestFlare().then(setReal); }, []);

  const begin = (w: World, mods: Mod[] = [], isDaily = false, o: { crew?: boolean; code?: string; scn?: string } = {}) => { setPending({ w, mods, isDaily, o }); setDesign(DEFAULT_DESIGN); setPhase("design"); };
  const launch = () => {
    if (!pending) return;
    const { w, mods, isDaily, o } = pending;
    const useBoost = boost && stars >= BOOST_COST;
    if (useBoost) update((p) => ({ ...p, stars: p.stars - BOOST_COST }));
    const n = newMission(w, useBoost ? "shield" : undefined, mods, { real: real ?? undefined, crew: o.crew ?? crewOn, scn: o.scn, design });
    setCode(o.code ?? ""); setCoachAi(""); setTurn(0); setPicks([null, null, null]);
    awarded.current = false; rewound.current = false; snaps.current = [clone(n)]; setDaily(isDaily); setBonus(0); setNewB([]);
    setS(n); setEv(eventFor(n)); setWork([]); setLast(null); setLights(true); setLab(true); setPhase("play"); setTut(prog.tut ? -1 : 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); sfx("go");
  };
  const rewind = (day: number) => {
    const base = snaps.current[day - 1]; if (!base) return;
    snaps.current.length = day; rewound.current = true;
    const n = clone(base); setS(n); setEv(eventFor(n)); setWork([]); setLast(null); setPhase("play"); sfx("go");
  };
  const pick = (i: number) => { setS(choose(s, ev!, i)); setEv(null); Haptics.selectionAsync(); };
  const toggle = (w: Work) => {
    if (work.includes(w)) setWork(work.filter((x) => x !== w));
    else if (work.length < s.slots) setWork([...work, w]);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };
  const next = () => {
    const o: Orders = { work: s.crew ? (picks.filter(Boolean) as Work[]) : work, lights, lab }, n = endDay(s, o);
    setTurn(0); setPicks([null, null, null]);
    setLast(n.log[n.log.length - 1]); setS(n); setWork([]);
    if (n.over) {
      setPhase("debrief"); setCoachAi(""); aiCoach(n).then((x) => x && setCoachAi(x));
      if (!awarded.current && !rewound.current) {
        awarded.current = true;
        const sc = score(n), won = n.over === "win", b = won ? 1 + Math.floor(Math.random() * 5) : 0, ids = earned(n);
        setBonus(b); setNewB(ids.filter((x) => !have.includes(x)));
        update((p) => ({ ...p, missions: (p.missions || 0) + 1, stars: p.stars + Math.round(sc.total / 5) + b,
          best: { ...(p.best || {}), [n.scn ?? n.world]: Math.max((p.best || {})[n.scn ?? n.world] ?? 0, sc.total) },
          badges: Array.from(new Set([...(p.badges || []), ...ids])),
          daily: daily ? { ...(p.daily || {}), [today()]: Math.max((p.daily || {})[today()] ?? 0, sc.total) } : p.daily || {} }));
      }
      sfx(n.over === "win" ? "win" : "crash");
      Haptics.notificationAsync(n.over === "win" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    } else { snaps.current[n.day - 1] = clone(n); setEv(eventFor(n)); sfx("tick"); }
  };

  if (phase === "design" && pending) {
    const left = BUDGET - Object.values(design).reduce((a, b) => a + b, 0);
    const set = (id: keyof Design, d: number) => {
      const v = design[id] + d;
      if (v < 0 || v > PART_MAX || (d > 0 && left <= 0)) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
      setDesign({ ...design, [id]: v }); Haptics.selectionAsync();
    };
    return (
      <>
        <Mu>{pending.w === "moon" ? "🌕 MOON" : "🔴 MARS"} · BEFORE LAUNCH</Mu><H>{t("design.title")}</H>
        <Mu>Your rocket can carry {BUDGET} weight units. Every unit you give one system is a unit you cannot launch for another. That is how real mission designers think.</Mu>
        <Card><Text style={{ color: C.fg }}>💡 {designHint(pending.w, pending.o.scn)}</Text></Card>
        <Text style={{ color: C.fg, fontWeight: "800", fontSize: 18 }}>Launch weight left: {left} / {BUDGET}</Text>
        {PARTS.map((p) => (
          <Card key={p.id}>
            <Text style={{ color: C.fg, fontWeight: "700" }}>{p.icon} {p.name}</Text>
            <Mu>{p.why}</Mu>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
              <Btn t="−" onPress={() => set(p.id, -1)} />
              <Text accessibilityLabel={`${design[p.id]} of ${PART_MAX}`} style={{ color: C.v, fontSize: 22, letterSpacing: 3, flex: 1, textAlign: "center" }}>{"■".repeat(design[p.id])}{"□".repeat(PART_MAX - design[p.id])}</Text>
              <Btn t="+" onPress={() => set(p.id, 1)} />
            </View>
          </Card>
        ))}
        <Btn t="Balanced loadout" onPress={() => setDesign(DEFAULT_DESIGN)} style={{ marginTop: 6 }} />
        <Btn pri t={t("launch") + " 🚀"} onPress={launch} style={{ marginTop: 8 }} />
        <Btn t="Back" onPress={() => setPhase("pick")} style={{ marginTop: 8 }} />
      </>
    );
  }

  if (phase === "teacher") return <Teacher onBack={() => setPhase("pick")} />;
  if (phase === "learn") return <LearnCheck form={learnForm} onCancel={() => setPhase("pick")} onDone={(sc) => { update((p) => ({ ...p, learn: { ...(p.learn || {}), [learnForm]: sc } })); setPhase("pick"); }} />;

  if (phase === "pick") {
    const dc = dailyChallenge(today()), dm = MODS[dc.mod], dbest = (prog.daily || {})[today()];
    const unlocked = (w: World) => w === "moon" || (best.moon ?? 0) >= 50;
    return (
      <>
        <Mu>OUTPOST COMMAND</Mu><H>{t("title")}</H>
        <Mu>Keep 3 astronauts alive for {DAYS} days. Every choice costs something: power, air, water, food and radiation shielding all compete for your crew’s time.</Mu>
        <Card>
          <Text style={{ color: C.v, fontWeight: "800", fontSize: 12 }}>📅 TODAY’S DAILY CHALLENGE · same for every player</Text>
          <Text style={{ color: C.fg, fontSize: 18, fontWeight: "700", marginTop: 4 }}>{dc.world === "moon" ? "🌕 Moon" : "🔴 Mars"} · {dm.icon} {dm.name}</Text>
          <Mu>{dm.text}{dbest !== undefined ? `  Your best today: ${dbest}` : ""}</Mu>
          <Btn pri t={t("daily")} style={{ marginTop: 8 }} onPress={() => (unlocked(dc.world) ? begin(dc.world, [dc.mod], true) : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))} />
          {!unlocked(dc.world) && <Mu>🔒 Win a Moon mission first to unlock Mars.</Mu>}
        </Card>
        <Card>
          <Btn t={boost ? "✅ Extra shield bags (+15 shielding) · 10 ⭐" : `🛡️ Extra shield bags (+15 shielding) · ${BOOST_COST} ⭐ (you have ${stars})`} onPress={() => setBoost(!boost)} />
          <Mu>Earn stars with Momentum focus blocks and missions, then spend them here.</Mu>
        </Card>
        <Card>
          <Text style={{ color: C.v, fontWeight: "800", fontSize: 12 }}>🕰️ MISSION HISTORY · CAN YOU BEAT WHAT REALLY HAPPENED?</Text>
          {Object.entries(SCENARIOS).map(([id, sc]) => (
            <View key={id} style={{ marginTop: 10 }}>
              <Text style={{ color: C.fg, fontWeight: "700" }}>{sc.icon} {sc.title} ({sc.year})</Text>
              <Mu>{sc.brief}</Mu>
              <Btn t={`Play · ${"★".repeat(rating(best[id]))}${"☆".repeat(3 - rating(best[id]))}${best[id] !== undefined ? " · best " + best[id] : ""}`} style={{ marginTop: 6 }} onPress={() => begin(sc.world, [], false, { scn: id })} />
            </View>))}
        </Card>
        {real && <Mu>📡 Live NASA data: the strongest solar flare of the last 30 days ({real.cls}, {real.date}) powers the storms in your missions.</Mu>}
        <Card>
          <Text style={{ color: C.fg, fontWeight: "700" }}>🧠 Learning check</Text>
          {learn.pre === undefined ? <><Mu>Answer 5 quick questions before you play.</Mu><Btn t="Start the before-check" style={{ marginTop: 6 }} onPress={() => { setLearnForm("pre"); setPhase("learn"); }} /></>
            : learn.post === undefined ? ((prog.missions || 0) >= 1 ? <><Mu>Before: {learn.pre}/5. Now see how much you learned.</Mu><Btn t="Take the after-check" style={{ marginTop: 6 }} onPress={() => { setLearnForm("post"); setPhase("learn"); }} /></> : <Mu>Before: {learn.pre}/5. Play a mission, then take the after-check.</Mu>)
            : <Mu>📈 You went from {learn.pre}/5 to {learn.post}/5 ({learn.post - learn.pre >= 0 ? "+" : ""}{learn.post - learn.pre}).</Mu>}
        </Card>
        <Card>
          <Btn t={crewOn ? "✅ Crew mode: 3 players pass the phone" : "👥 Crew mode (3 players, 3 roles)"} onPress={() => setCrewOn(!crewOn)} />
          <Text style={{ color: C.fg, fontWeight: "700", marginTop: 10 }}>🏫 Class code</Text>
          <TextInput value={codeIn} onChangeText={setCodeIn} autoCapitalize="characters" maxLength={6} placeholder="e.g. LBC7QX" placeholderTextColor={C.mu}
            style={{ color: C.fg, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 6 }} />
          <Btn t="Join class mission" style={{ marginTop: 6 }} onPress={() => { const c = parseCode(codeIn); if (!c) { setCodeErr("That code does not look right."); return; } setCodeErr(""); begin(c.world, [c.mod], false, { crew: c.crew, code: c.code }); }} />
          {!!codeErr && <Mu>{codeErr}</Mu>}
          <Btn t="👩‍🏫 Teacher mode" style={{ marginTop: 10 }} onPress={() => setPhase("teacher")} />
        </Card>
        {(["moon", "mars"] as World[]).map((w) => (
          <View key={w} style={{ flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 6, opacity: unlocked(w) ? 1 : 0.5 }}>
            <Planet kind={w} size={64} />
            <View style={{ flex: 1 }}>
              <Btn pri={unlocked(w)} t={`${unlocked(w) ? "" : "🔒 "}${w === "moon" ? "Moon base (south pole)" : "Mars outpost"}`} onPress={() => (unlocked(w) ? begin(w) : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))} />
              <Mu>{"★".repeat(rating(best[w]))}{"☆".repeat(3 - rating(best[w]))}  {best[w] !== undefined ? `Best ${best[w]}/100` : unlocked(w) ? "Not played yet" : "Win the Moon to unlock"}</Mu>
            </View>
          </View>
        ))}
        <Card>
          <Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>Badges {have.length}/{Object.keys(BADGES).length}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {Object.entries(BADGES).map(([id, b]) => <Text key={id} accessibilityLabel={`${b.name}: ${b.how}`} style={{ fontSize: 30, opacity: have.includes(id) ? 1 : 0.2 }}>{b.icon}</Text>)}
          </View>
          {(() => { const nx = Object.entries(BADGES).find(([id]) => !have.includes(id)); return nx ? <Mu>Next badge: {nx[1].icon} {nx[1].name}: {nx[1].how}</Mu> : <Mu>You have every badge!</Mu>; })()}
        </Card>
        <Btn t="❓ How to play (show the tutorial again)" onPress={() => update((p) => ({ ...p, tut: false }))} style={{ marginTop: 8 }} />
        <Btn t="Back" onPress={onExit} style={{ marginTop: 8 }} />
      </>
    );
  }

  if (phase === "debrief") {
    const sc = score(s), won = s.over === "win";
    return (
      <>
        {won && <Confetti />}
        <Mu>MISSION DEBRIEF{rewound.current ? " · replay (no rewards)" : ""}</Mu><H>{won ? t("win") + " 🏅" : t("lose") + " 💥"}</H>
        <Text style={{ color: C.fg, fontSize: 18 }}>{sc.rank} · {sc.total}/100 {"★".repeat(rating(sc.total))}{"☆".repeat(3 - rating(sc.total))}{!rewound.current ? ` · +${Math.round(sc.total / 5)} ⭐` : ""}</Text>
        {bonus > 0 && <Mu>🎁 Mission Control bonus: +{bonus} ⭐</Mu>}
        {newB.length > 0 && <Card><Text style={{ color: C.fg, fontWeight: "800" }}>🏅 New badge{newB.length > 1 ? "s" : ""} unlocked!</Text>{newB.map((id) => <Text key={id} style={{ color: C.fg, fontSize: 17, marginTop: 4 }}>{BADGES[id].icon} {BADGES[id].name}</Text>)}</Card>}
        {!won && <Card><Text style={{ color: "#ff9aa6" }}>What went wrong: {s.why}.</Text></Card>}
        {s.scn && <Card><Text style={{ color: C.v, fontWeight: "700" }}>📜 WHAT REALLY HAPPENED · {SCENARIOS[s.scn].src}</Text><Text style={{ color: C.fg, marginTop: 6 }}>{SCENARIOS[s.scn].real}</Text><Mu>{won ? "You did what history could not. 🏅" : "History shows how hard this was. Rewind and try again!"}</Mu></Card>}
        <Card><Text style={{ color: C.v, fontWeight: "700" }}>🧑‍🚀 {t("coach")}{coachAi ? " ✨ AI" : ""}</Text><Text style={{ color: C.fg, marginTop: 6 }}>{coachAi || coachText(s)}</Text><Mu>🛠️ {designTip(s)}</Mu></Card>
        <Card>
          {([["❤️ Crew survival", sc.survival, 40], ["📦 Resources left", sc.resources, 20], ["☢️ Radiation control", sc.radiation, 20], ["🔬 Science", sc.science, 20]] as [string, number, number][]).map(([l, v, m]) => (
            <Meter key={l} icon="" name={l} v={(v / m) * 100} cmd={true} />
          ))}
          <Mu>Total dose: {s.dose.toFixed(1)} mSv (without shielding: {s.unshielded.toFixed(1)} mSv)</Mu>
        </Card>
        <Card><Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>Cause and effect: your last days</Text>
          {s.log.slice(-3).map((d, k) => <View key={k} style={{ marginBottom: 6 }}>{d.map((l, j) => <Mu key={j}>{l}</Mu>)}</View>)}
        </Card>
        <Card><Text style={{ color: C.v, fontWeight: "700" }}>{t("science")}</Text>
          {[...LEARN[s.world], COMMON_LEARN].map((t, k) => <Text key={k} style={{ color: C.fg, marginTop: 8 }}>• {t}</Text>)}</Card>
        <Card><Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>🎬 Real NASA videos</Text><Videos q0={s.scn ? SCENARIOS[s.scn].video : s.world === "moon" ? "moon base habitat" : "mars habitat"} /></Card>
        <Card><Text style={{ color: C.fg, fontWeight: "700", marginBottom: 6 }}>⏪ What if? Rewind and choose differently</Text>
          {snaps.current.map((sn, k) => { const c = eventFor(sn); return c ? <Btn key={k} t={`Day ${k + 1}: ${c.icon} ${c.title}`} style={{ marginVertical: 3 }} onPress={() => rewind(k + 1)} /> : null; })}
          <Mu>Replays do not earn stars or badges, but they are the best way to learn what really mattered.</Mu></Card>
        <Btn pri t="Play again" onPress={() => setPhase("pick")} />
        <Btn t="Share my result" style={{ marginTop: 8 }} onPress={() => Share.share({ message: `Outpost Command ${s.scn ? SCENARIOS[s.scn].title + " (" + SCENARIOS[s.scn].year + ") " : daily ? "Daily " + today() + " " : ""}· ${s.world === "moon" ? "🌕 Moon" : "🔴 Mars"} · ${sc.total}/100 ${"★".repeat(rating(sc.total))}\n${shareGrid(s)}\n🚀 Can you beat it?` })} />
        {code !== "" && <Btn t="📤 Send my result to my teacher" style={{ marginTop: 8 }} onPress={() => Share.share({ message: resultLine({ code, name: fx.name, score: sc.total, won, why: s.why, pre: learn.pre, post: learn.post }) })} />}
        <Btn t="Home" style={{ marginTop: 8 }} onPress={onExit} />
      </>
    );
  }

  const day = Math.min(s.day, DAYS), night = nightDay(s), sunny = s.world === "moon" ? (night ? "🌑 Lunar night" : "☀️ Sunlight") : s.dust > 0 ? "🌪️ Dust storm" : "🌤️ Dim sun (43%)";
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: C.fg, fontSize: 22, fontWeight: "800" }}>{t("day")} {day}/{DAYS}</Text>
        <Text style={{ color: C.mu }}>{s.scn ? SCENARIOS[s.scn].icon + " " + SCENARIOS[s.scn].year + " · " : ""}{s.world === "moon" ? "🌕 Moon" : "🔴 Mars"} · {sunny}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: 6 }}>
        <Text style={{ color: C.mu, fontSize: 12 }}>{t("junior")}</Text><Switch value={cmd} onValueChange={setCmd} /><Text style={{ color: C.mu, fontSize: 12 }}>{t("commander")}</Text>
      </View>
      {s.scn && s.day === 1 && !ev && <Card><Text style={{ color: C.fg, fontWeight: "800" }}>{SCENARIOS[s.scn].icon} {SCENARIOS[s.scn].title}</Text><Mu>{SCENARIOS[s.scn].brief}</Mu></Card>}
      {tut >= 0 && tut < TUT.length && !ev && <Card><Text style={{ color: C.v, fontWeight: "800", fontSize: 12 }}>HOW TO PLAY · {tut + 1} OF {TUT.length}</Text><Text style={{ color: C.fg, fontSize: 17, marginTop: 4 }}>{TUT[tut]}</Text>
        <Btn pri t={tut + 1 < TUT.length ? "Next" : "Got it!"} style={{ marginTop: 8 }} onPress={() => { if (tut + 1 >= TUT.length) update((p) => ({ ...p, tut: true })); setTut(tut + 1); }} /></Card>}
      {!ev && !cmd && !(tut >= 0 && tut < TUT.length) && <Card><Text style={{ color: C.fg }}>🧑‍🚀 {t("cosmo")}: {advice(s)}</Text></Card>}
      {ev && (
        <Card>
          <Text style={{ fontSize: 40 }}>{ev.icon}</Text>
          <Text style={{ color: C.fg, fontSize: 20, fontWeight: "800" }}>{ev.title}</Text>
          <Mu>{ev.text}</Mu>
          {ev.choices.map((c, i) => <Btn key={i} t={`${c.label}: ${c.note}`} onPress={() => pick(i)} style={{ marginTop: 8 }} />)}
        </Card>
      )}
      {last && !ev && <Card><Text style={{ color: C.fg, fontWeight: "700", marginBottom: 4 }}>What happened yesterday</Text>{last.map((l, k) => <Mu key={k}>{l}</Mu>)}</Card>}
      <Card>
        <Text style={{ fontSize: 24, marginBottom: 4 }} accessibilityLabel="Crew">{s.health > 60 ? "👩‍🚀🧑‍🚀👨‍🚀" : s.health > 30 ? "🤕🧑‍🚀👨‍🚀" : "🤒🤕🧑‍🚀"}</Text>
        <Meter icon="❤️" name={t("m.health")} v={s.health} cmd={cmd} />
        <Meter icon="⚡" name={t("m.power")} v={(s.power / s.cap) * 100} cmd={cmd} />
        {cmd ? <><Meter icon="💨" name={t("m.air")} v={s.air} cmd={cmd} /><Meter icon="💧" name={t("m.water")} v={s.water} cmd={cmd} /></> : <Meter icon="💨" name={t("m.airwater")} v={Math.min(s.air, s.water)} cmd={false} />}
        <Meter icon="🍎" name={t("m.food")} v={s.food} cmd={cmd} />
        <Meter icon="🛡️" name={t("m.shield")} v={s.shield} cmd={cmd} />
        {cmd ? <><Meter icon="☀️" name={t("m.solar")} v={s.solar} cmd={cmd} /><Meter icon="🔧" name={t("m.ls")} v={s.ls} cmd={cmd} /></> : <Meter icon="🔧" name={t("m.machines")} v={Math.min(s.solar, s.ls)} cmd={false} />}
        <Mu>☢️ Total dose so far: {s.dose.toFixed(1)} mSv</Mu>
      </Card>
      {!ev && s.crew && (() => {
        const R = [{ icon: "⚡", name: "Power Engineer", jobs: ["solar", "science"] as Work[], sw: true }, { icon: "🫁", name: "Life Support Officer", jobs: ["repair", "farm", "rest"] as Work[], sw: false }, { icon: "🛡️", name: "Radiation Officer", jobs: ["shield", "rest"] as Work[], sw: false }];
        if (turn > 2) return (<Card><Text style={{ color: C.fg, fontWeight: "700" }}>👥 All three crew have chosen</Text><Mu>{picks.map((p, i) => `${R[i].icon} ${p ? WORK[p].label : "no job"}`).join(" · ")}</Mu>{s.slots < 3 && <Mu>Only {s.slots} job(s) count today because of the event.</Mu>}<Btn pri t={t("endday")} onPress={next} style={{ marginTop: 8 }} /></Card>);
        const r = R[turn];
        return (<Card>
          <Text style={{ color: C.v, fontWeight: "800", fontSize: 12 }}>🔁 PASS THE PHONE TO</Text>
          <Text style={{ color: C.fg, fontSize: 20, fontWeight: "800" }}>{r.icon} {r.name} · player {turn + 1} of 3</Text>
          <Mu>Talk it over with your crew, then pick ONE job.</Mu>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {r.jobs.map((w) => <Btn key={w} pri={picks[turn] === w} t={`${WORK[w].icon} ${t("work." + w)}`} onPress={() => setPicks(picks.map((p, i) => (i === turn ? (p === w ? null : w) : p)))} />)}
          </View>
          {r.sw && <View style={{ marginTop: 8 }}>
            {([["💡 " + t("lights"), lights, setLights], ["🧪 " + t("lab"), lab, setLab]] as [string, boolean, (v: boolean) => void][]).map(([l, v, set]) => (
              <View key={l} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <Text style={{ color: C.fg, flex: 1 }}>{l}</Text><Switch value={v && s.forceOff === 0} disabled={s.forceOff > 0} onValueChange={set} />
              </View>))}
          </View>}
          <Btn pri t="Lock in ✔" onPress={() => setTurn(turn + 1)} style={{ marginTop: 8 }} />
        </Card>);
      })()}
      {!ev && !s.crew && (
        <Card>
          <Text style={{ color: C.fg, fontWeight: "700" }}>{t("work.title")} ({work.length}/{s.slots})</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {(Object.keys(WORK) as Work[]).map((w) => <Btn key={w} pri={work.includes(w)} t={`${WORK[w].icon} ${t("work." + w)}`} onPress={() => toggle(w)} />)}
          </View>
          {work.length > 0 && <Mu>{work.map((w) => WORK[w].tip).join(" · ")}</Mu>}
          <View style={{ marginTop: 10 }}>
            {([["💡 " + t("lights"), lights, setLights], ["🧪 " + t("lab"), lab, setLab]] as [string, boolean, (v: boolean) => void][]).map(([l, v, set]) => (
              <View key={l} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <Text style={{ color: C.fg, flex: 1 }}>{l}</Text><Switch value={v && s.forceOff === 0} disabled={s.forceOff > 0} onValueChange={set} />
              </View>
            ))}
            {s.forceOff > 0 && <Mu>Survival mode: lights and lab are off for {s.forceOff} more day(s).</Mu>}
          </View>
          <Btn pri t={t("endday")} onPress={next} style={{ marginTop: 8 }} />
        </Card>
      )}
      <Btn t={t("quit")} onPress={() => setPhase("pick")} />
    </>
  );
}
