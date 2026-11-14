import AsyncStorage from "@react-native-async-storage/async-storage";
export type Prog = { blocks: number; mins: number; stars: number; av: number; own: number[]; patches: string[]; best: Record<string, number>; badges: string[]; daily: Record<string, number>; learn: { pre?: number; post?: number }; missions: number; tut?: boolean; days: Record<string, number>; log: { t: string; m: number; d: string }[] };
const K = "momentum-v1";
export const empty: Prog = { blocks: 0, mins: 0, stars: 0, av: 0, own: [0], patches: [], best: {}, badges: [], daily: {}, learn: {}, missions: 0, days: {}, log: [] };
export const today = () => new Date().toISOString().slice(0, 10);
export async function load(): Promise<Prog> {
  try { return { ...empty, ...JSON.parse((await AsyncStorage.getItem(K)) || "{}") }; } catch { return empty; }
}
export async function save(p: Prog) { try { await AsyncStorage.setItem(K, JSON.stringify(p)); } catch {} }
