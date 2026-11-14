import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { searchVideos, videoUrl, Vid } from "./nasa";
import { Btn, C, Mu } from "./ui";

function Player({ url }: { url: string }) {
  const p = useVideoPlayer(url, (pl) => { pl.play(); });
  return <VideoView player={p} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: "#000" }} nativeControls fullscreenOptions={{ enable: true }} />;
}

export function Videos({ q0, editable }: { q0: string; editable?: boolean }) {
  const [q, setQ] = useState(q0), [list, setList] = useState<Vid[]>([]), [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");

  const go = async (term: string) => {
    setBusy(true); setErr(""); setUrl(null);
    try { const v = await searchVideos(term); setList(v); if (!v.length) setErr("No videos found. Try another word."); }
    catch { setErr("Can’t reach NASA right now. Check your internet and try again."); }
    setBusy(false);
  };
  useEffect(() => { go(q0); }, [q0]);

  const play = async (id: string) => {
    setBusy(true); setErr("");
    try { setUrl(await videoUrl(id)); } catch { setErr("That video can’t be played. Pick another one."); }
    setBusy(false);
  };

  return (
    <View>
      {editable && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => go(q)} placeholder="Search NASA videos" placeholderTextColor={C.mu}
            style={{ flex: 1, color: C.fg, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 12 }} />
          <Btn t="Go" pri onPress={() => go(q)} />
        </View>
      )}
      {url && <Player url={url} />}
      {busy && <ActivityIndicator color={C.v} style={{ margin: 12 }} />}
      {!!err && <Mu>{err}</Mu>}
      {list.slice(0, 6).map((v) => (
        <Pressable key={v.id} onPress={() => play(v.id)} accessibilityRole="button" style={{ paddingVertical: 10, borderBottomColor: C.bd, borderBottomWidth: 1 }}>
          <Text style={{ color: C.fg }}>▶ {v.title}</Text>
        </Pressable>
      ))}
      <Mu>Videos come from the NASA Image and Video Library.</Mu>
    </View>
  );
}
