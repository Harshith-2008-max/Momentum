import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Dimensions, Pressable, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { RANKS } from "./data";
import type { Apod } from "./apod";
import Svg, { Circle, Defs, LinearGradient as SG, RadialGradient, Rect, Stop } from "react-native-svg";
import { Planet, PK, PKind } from "./Planet";
import { fx } from "./fx";

export const C = { bg: "#07070d", fg: "#eceaff", mu: "#9a98b8", v: "#8b7cff", b: "#5ea1ff", card: "rgba(255,255,255,0.07)", bd: "rgba(255,255,255,0.14)" };

export const Btn = ({ t, onPress, pri, style }: { t: string; onPress: () => void; pri?: boolean; style?: ViewStyle }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }], borderRadius: 18, overflow: "hidden" }, style]}>
    {pri ? (
      <LinearGradient colors={[C.v, C.b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 15, paddingHorizontal: 22, alignItems: "center", shadowColor: C.v, shadowOpacity: 0.6, shadowRadius: 16 }}>
        <Text style={{ color: "#07070d", fontWeight: "800", fontSize: 16 }}>{t}</Text>
      </LinearGradient>
    ) : (
      <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: "center", backgroundColor: C.card, borderColor: C.bd, borderWidth: 1, borderRadius: 18 }}>
        <Text style={{ color: C.fg, fontWeight: "600", fontSize: 16 }}>{t}</Text>
      </View>
    )}
  </Pressable>
);

export const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: C.card, borderColor: C.bd, borderWidth: 1, borderRadius: 24, padding: 18, marginVertical: 8, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 20 }}>{children}</View>
);
export const H = ({ children }: { children: React.ReactNode }) => <Text style={{ color: C.fg, fontSize: 32, fontWeight: "800", marginVertical: 8, letterSpacing: -0.5 }}>{children}</Text>;
export const Mu = ({ children }: { children: React.ReactNode }) => <Text style={{ color: C.mu, fontSize: 14, marginVertical: 2 }}>{children}</Text>;

const MC: Record<string, [string, string]> = { "Moon Landing": ["#5a5fb0", "#1c1f4a"], "Mars Expedition": ["#c2573a", "#4a1a14"], "Space Station Crew": ["#2f7fd0", "#10264d"] };
export const MissionCard = ({ emoji, name, sub, onPress }: { emoji: string; name: string; sub: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], marginVertical: 6 })}>
    <LinearGradient colors={MC[name] || [C.v, C.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1, borderColor: C.bd }}>
      <View style={{ width: 70, alignItems: "center" }} accessibilityLabel={emoji}><Planet kind={PK[name] || "moon"} size={62} /></View>
      <View style={{ flex: 1 }}><Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{name}</Text><Text style={{ color: "rgba(255,255,255,0.75)" }}>{sub}</Text></View>
      <Text style={{ color: "#fff", fontSize: 22 }}>›</Text>
    </LinearGradient>
  </Pressable>
);

export function Sky() {
  const { width: W, height: Hh } = Dimensions.get("window"), [rm, setRm] = useState(false);
  const stars = useRef(Array.from({ length: fx.hq ? 70 : 20 }, () => ({ x: Math.random() * W, y: Math.random() * Hh, s: Math.random() * 2.2 + 0.6, o: new Animated.Value(Math.random()) }))).current;
  const sh = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      setRm(r); if (r || !fx.hq) return;
      stars.forEach((s) => Animated.loop(Animated.sequence([
        Animated.timing(s.o, { toValue: 1, duration: 1500 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(s.o, { toValue: 0.15, duration: 1500 + Math.random() * 2000, useNativeDriver: true })])).start());
      Animated.loop(Animated.sequence([Animated.delay(4000 + Math.random() * 5000), Animated.timing(sh, { toValue: 1, duration: 900, useNativeDriver: true }), Animated.timing(sh, { toValue: 0, duration: 0, useNativeDriver: true })])).start();
    });
  }, []);
  const neb = (id: string, cx: string, cy: string, r: string, c: string, o: string) => (
    <RadialGradient id={id} cx={cx} cy={cy} r={r}><Stop offset="0" stopColor={c} stopOpacity={o} /><Stop offset="1" stopColor={c} stopOpacity="0" /></RadialGradient>);
  return <View pointerEvents="none" style={{ position: "absolute", width: W, height: Hh }}>
    <Svg width={W} height={Hh} style={{ position: "absolute" }}>
      <Defs>{neb("n1", "15%", "12%", "55%", "#6b4bff", "0.38")}{neb("n2", "90%", "85%", "60%", "#1f7bff", "0.32")}{neb("n3", "85%", "30%", "40%", "#ff5ea8", "0.18")}</Defs>
      <Rect width={W} height={Hh} fill="url(#n1)" /><Rect width={W} height={Hh} fill="url(#n2)" /><Rect width={W} height={Hh} fill="url(#n3)" />
    </Svg>
    {stars.map((s, k) => <Animated.View key={k} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: 2, backgroundColor: "#cfd3ff", opacity: rm ? 0.5 : s.o }} />)}
    {!rm && fx.hq && <Animated.View style={{ position: "absolute", top: 70, right: 20, width: 80, height: 2, borderRadius: 1, backgroundColor: "#fff",
      opacity: sh.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateX: sh.interpolate({ inputRange: [0, 1], outputRange: [0, -W * 0.7] }) }, { translateY: sh.interpolate({ inputRange: [0, 1], outputRange: [0, W * 0.33] }) }, { rotate: "-25deg" }] }} />}
  </View>;
}

export function Confetti() {
  const ps = useRef(Array.from({ length: 28 }, (_, k) => ({ a: new Animated.Value(0), dx: (Math.random() - 0.5) * 320, dy: -(80 + Math.random() * 220), c: ["#8b7cff", "#5ea1ff", "#ffd66b", "#ffffff"][k % 4] }))).current;
  useEffect(() => { Animated.parallel(ps.map((p) => Animated.timing(p.a, { toValue: 1, duration: 1400, useNativeDriver: true }))).start(); }, []);
  return <View pointerEvents="none" style={{ position: "absolute", top: 90, left: "50%" }}>
    {ps.map((p, k) => <Animated.View key={k} style={{ position: "absolute", width: 8, height: 8, borderRadius: 2, backgroundColor: p.c,
      opacity: p.a.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
      transform: [{ translateX: p.a.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) }, { translateY: p.a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.dy, p.dy + 260] }) }] }} />)}
  </View>;
}

export function Bounce({ children }: { children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(v, { toValue: -10, duration: 1200, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 1200, useNativeDriver: true })])).start(); }, []);
  return <Animated.View style={{ transform: [{ translateY: v }] }}>{children}</Animated.View>;
}

/** p = fraction elapsed (0..1) */
export const Ring = ({ p, label, kind }: { p: number; label: string; kind?: PKind }) => {
  const r = 96, c = 2 * Math.PI * r;
  return (
    <View style={{ alignSelf: "center", width: 250, height: 250, justifyContent: "center", alignItems: "center" }}>
      {kind && <View style={{ position: "absolute", opacity: 0.4 }}><Planet kind={kind} size={170} /></View>}
      <Svg width={250} height={250} viewBox="0 0 220 220" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Defs><SG id="g" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.v} /><Stop offset="1" stopColor={C.b} /></SG></Defs>
        <Circle cx={110} cy={110} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={9} fill="none" />
        <Circle cx={110} cy={110} r={r} stroke="url(#g)" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * p} />
      </Svg>
      <Text accessibilityRole="timer" style={{ color: C.fg, fontSize: 52, fontWeight: "200" }}>{label}</Text>
    </View>
  );
};

export const RankBar = ({ blocks }: { blocks: number }) => {
  const i = RANKS.reduce((a, r, k) => (blocks >= r[0] ? k : a), 0), nx = RANKS[i + 1];
  const pct = nx ? (blocks - RANKS[i][0]) / (nx[0] - RANKS[i][0]) : 1;
  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ color: C.fg, fontWeight: "700" }}>🎖️ {RANKS[i][1]}{nx ? <Text style={{ color: C.mu, fontWeight: "400" }}>  ·  {nx[0] - blocks} blocks to {nx[1]}</Text> : null}</Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 6, overflow: "hidden" }}>
        <LinearGradient colors={[C.v, C.b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.round(pct * 100)}%`, height: 8 }} />
      </View>
    </View>
  );
};

export const ApodCard = ({ a }: { a: Apod }) => {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" style={{ borderRadius: 24, overflow: "hidden", marginVertical: 8, borderColor: C.bd, borderWidth: 1, backgroundColor: C.card }}>
      <Image source={{ uri: a.url }} style={{ width: "100%", height: 190 }} resizeMode="cover" accessibilityLabel={a.title} />
      <View style={{ padding: 14 }}>
        <Text style={{ color: C.v, fontSize: 12, fontWeight: "700" }}>NASA PICTURE OF THE DAY</Text>
        <Text style={{ color: C.fg, fontSize: 17, fontWeight: "700", marginTop: 2 }}>{a.title}</Text>
        {open && <Text style={{ color: C.mu, marginTop: 6 }}>{a.explanation.slice(0, 320)}…</Text>}
        {!open && <Text style={{ color: C.mu, marginTop: 4, fontSize: 12 }}>Tap to read more</Text>}
      </View>
    </Pressable>
  );
};
