// User settings (sound, haptics, graphics quality, name) and sound effects.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import type { Lang } from "./i18n";

export const fx = { sound: true, haptics: true, hq: true, name: "", lang: "en" as Lang, scale: 1, cb: false, tips: true, vol: 1, safe: false };
const K = "momentum-settings";
export async function loadFx() { try { Object.assign(fx, JSON.parse((await AsyncStorage.getItem(K)) || "{}")); } catch {} }
export async function saveFx() { try { await AsyncStorage.setItem(K, JSON.stringify(fx)); } catch {} }

const SRC = {
  tick: require("../assets/sfx/tick.wav"), go: require("../assets/sfx/go.wav"), chime: require("../assets/sfx/chime.wav"),
  win: require("../assets/sfx/win.wav"), crash: require("../assets/sfx/crash.wav"),
};
const cache: Record<string, AudioPlayer> = {};
export function sfx(n: keyof typeof SRC) {
  if (!fx.sound) return;
  try { const p = (cache[n] ??= createAudioPlayer(SRC[n])); p.volume = fx.vol; p.seekTo(0); p.play(); } catch {}
}
