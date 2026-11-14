import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Text, View } from "react-native";
import { fx } from "./fx";
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";

export type PKind = "earth" | "moon" | "mars" | "venus" | "jupiter";
export const PK: Record<string, PKind> = { "Moon Landing": "moon", "Mars Expedition": "mars", "Space Station Crew": "earth" };
const ATM: Record<PKind, string> = { earth: "#5ea1ff", moon: "#cfd3ff", mars: "#ff8a5e", venus: "#ffb04a", jupiter: "#ffcf9a" };

// Surface art, drawn in a 100x100 box. Two copies sit side by side and slide to fake rotation.
function Detail({ k }: { k: PKind }) {
  if (k === "earth") return (<>
    <Rect width={100} height={100} fill="#1f5fc4" />
    <Ellipse cx={28} cy={34} rx={17} ry={10} fill="#3fa65a" /><Ellipse cx={62} cy={56} rx={19} ry={12} fill="#4cb36a" />
    <Ellipse cx={44} cy={80} rx={12} ry={6} fill="#3fa65a" /><Ellipse cx={80} cy={24} rx={10} ry={5} fill="#3fa65a" />
    <Ellipse cx={20} cy={56} rx={14} ry={3} fill="#fff" opacity={0.55} /><Ellipse cx={60} cy={30} rx={18} ry={3} fill="#fff" opacity={0.5} />
    <Ellipse cx={42} cy={90} rx={16} ry={3} fill="#fff" opacity={0.5} /></>);
  if (k === "moon") return (<>
    <Rect width={100} height={100} fill="#b4b4c0" />
    {[[20, 25, 9], [55, 18, 6], [70, 50, 11], [35, 60, 8], [15, 80, 7], [60, 82, 9], [85, 20, 5], [45, 40, 4]].map(([x, y, r], i) =>
      <Circle key={i} cx={x} cy={y} r={r} fill="#8d8d9c" stroke="#d8d8e2" strokeWidth={0.8} />)}</>);
  if (k === "mars") return (<>
    <Rect width={100} height={100} fill="#c2573a" />
    <Ellipse cx={30} cy={40} rx={18} ry={9} fill="#8f3a25" /><Ellipse cx={70} cy={60} rx={16} ry={8} fill="#8f3a25" /><Ellipse cx={45} cy={75} rx={12} ry={6} fill="#a8452c" />
    <Ellipse cx={50} cy={3} rx={32} ry={7} fill="#fff" opacity={0.85} /><Ellipse cx={50} cy={97} rx={26} ry={5} fill="#fff" opacity={0.7} /></>);
  if (k === "venus") return (<>
    <Rect width={100} height={100} fill="#e0993a" />
    {[[30, 25, 40, 6], [70, 45, 36, 7], [35, 65, 42, 6], [65, 85, 38, 5]].map(([x, y, rx, ry], i) => <Ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#ffd58a" opacity={0.55} />)}
    <Ellipse cx={50} cy={35} rx={45} ry={4} fill="#b8701f" opacity={0.4} /><Ellipse cx={40} cy={55} rx={45} ry={4} fill="#b8701f" opacity={0.4} /></>);
  return (<>
    {[[0, 14, "#d9b38c"], [14, 12, "#a8693f"], [26, 10, "#f0d9b8"], [36, 14, "#c98a5a"], [50, 10, "#efe0c8"], [60, 14, "#a8693f"], [74, 12, "#e3c4a0"], [86, 14, "#b97d4e"]]
      .map(([y, h, c], i) => <Rect key={i} y={y as number} width={100} height={h as number} fill={c as string} />)}
    <Ellipse cx={60} cy={62} rx={10} ry={6} fill="#c24a2a" /></>);
}

export function Planet({ kind, size = 120, spin = true }: { kind: PKind; size?: number; spin?: boolean }) {
  const x = useRef(new Animated.Value(0)).current, gl = size * 1.7;
  useEffect(() => {
    let a: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      if (r || !spin || !fx.hq) return;
      a = Animated.loop(Animated.timing(x, { toValue: -size, duration: 45000, easing: Easing.linear, useNativeDriver: true })); a.start();
    });
    return () => a?.stop();
  }, []);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={gl} height={gl} style={{ position: "absolute" }}>
        <Defs><RadialGradient id="atm" cx="50%" cy="50%" r="50%"><Stop offset="0.55" stopColor={ATM[kind]} stopOpacity="0.55" /><Stop offset="1" stopColor={ATM[kind]} stopOpacity="0" /></RadialGradient></Defs>
        <Circle cx={gl / 2} cy={gl / 2} r={gl / 2} fill="url(#atm)" />
      </Svg>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        <Animated.View style={{ flexDirection: "row", width: size * 2, transform: [{ translateX: x }] }}>
          {[0, 1].map((i) => <Svg key={i} width={size} height={size} viewBox="0 0 100 100"><Detail k={kind} /></Svg>)}
        </Animated.View>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          <Defs><RadialGradient id="shade" cx="35%" cy="30%" r="75%"><Stop offset="0" stopColor="#fff" stopOpacity="0.28" /><Stop offset="0.5" stopColor="#000" stopOpacity="0" /><Stop offset="1" stopColor="#000" stopOpacity="0.82" /></RadialGradient></Defs>
          <Rect width={size} height={size} fill="url(#shade)" />
        </Svg>
      </View>
    </View>
  );
}

/** Home hero: spinning Earth with the ISS orbiting it. */
export function Hero() {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let a: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((rm) => {
      if (rm || !fx.hq) return;
      a = Animated.loop(Animated.timing(r, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true })); a.start();
    });
    return () => a?.stop();
  }, []);
  return (
    <View style={{ height: 240, alignItems: "center", justifyContent: "center" }}>
      <Svg width={240} height={240} style={{ position: "absolute" }}>
        <Circle cx={120} cy={120} r={104} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 6" strokeWidth={1.5} fill="none" />
      </Svg>
      <Planet kind="earth" size={130} />
      <Animated.View style={{ position: "absolute", width: 240, height: 240, transform: [{ rotate: r.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
        <Text style={{ position: "absolute", top: 2, left: 107, fontSize: 26 }}>🛰️</Text>
      </Animated.View>
    </View>
  );
}
