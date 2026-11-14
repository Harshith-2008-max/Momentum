import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "./haptics";
import { sfx } from "./fx";
import { G } from "./data";
import { Btn, C, Mu } from "./ui";

/** Touch down slower than 4 m/s using the real surface gravity of the chosen world. */
export function Lander({ body, onWin }: { body: string; onWin: () => void }) {
  const g = G[body] ?? 9.81;
  const s = useRef({ y: 0, v: 0, f: 100, th: false, on: true, won: false });
  const [, force] = useState(0), [msg, setMsg] = useState("");
  useEffect(() => {
    const id = setInterval(() => {
      const a = s.current; if (!a.on) return;
      const dt = 0.033, burn = a.th && a.f > 0;
      if (burn) a.f = Math.max(0, a.f - 25 * dt);
      a.v += (g - (burn ? 30 : 0)) * dt; a.y += a.v * dt;
      if (a.y < 0) { a.y = 0; a.v = 0; }
      if (a.y >= 100) {
        a.y = 100; a.on = false; const ok = a.v < 4;
        setMsg(ok ? `Touchdown at ${a.v.toFixed(1)} m/s ✅` : `Crashed at ${a.v.toFixed(1)} m/s. Try again!`);
        sfx(ok ? "win" : "crash");
        Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
        if (ok && !a.won) { a.won = true; onWin(); }
      }
      force((n) => n + 1);
    }, 33);
    return () => clearInterval(id);
  }, [body]);
  const a = s.current;
  return (
    <View>
      <Text style={{ color: C.fg, fontWeight: "700", fontSize: 16 }}>Landing Challenge · {body}</Text>
      <Mu>Gravity {g} m/s². Hold the button to fire the thruster. Land slower than 4 m/s.</Mu>
      <View style={{ height: 230, marginVertical: 8, borderRadius: 18, backgroundColor: "#0a0a1a", overflow: "hidden", borderColor: C.bd, borderWidth: 1 }}>
        <Text style={{ position: "absolute", left: "50%", marginLeft: -16, top: 8 + a.y * 1.8, fontSize: 32 }}>🚀</Text>
        {a.th && a.f > 0 && a.on && <Text style={{ position: "absolute", left: "50%", marginLeft: -12, top: 44 + a.y * 1.8, fontSize: 22 }}>🔥</Text>}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, backgroundColor: "#2a2a4a" }} />
        <Text style={{ position: "absolute", left: 10, top: 8, color: C.mu, fontSize: 12 }}>speed {a.v.toFixed(1)} m/s · fuel {Math.round(a.f)}</Text>
      </View>
      <Pressable accessibilityRole="button" onPressIn={() => { s.current.th = true; }} onPressOut={() => { s.current.th = false; }}
        style={{ backgroundColor: C.v, borderRadius: 18, paddingVertical: 18, alignItems: "center" }}>
        <Text style={{ color: "#07070d", fontWeight: "800", fontSize: 17 }}>Hold to thrust 🔥</Text>
      </Pressable>
      {!!msg && <Text style={{ color: C.fg, marginVertical: 8, textAlign: "center", fontSize: 16 }}>{msg}</Text>}
      <Btn t="Retry" onPress={() => { s.current = { y: 0, v: 0, f: 100, th: false, on: true, won: s.current.won }; setMsg(""); }} style={{ marginTop: 6 }} />
    </View>
  );
}
