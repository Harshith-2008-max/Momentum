import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Lang, LANGS, cfg, filterLangs } from "./i18n";
import { fx } from "./fx";
import { Btn, C, Card, H, Mu } from "./ui";

/** A separate languages screen with a search bar (searches native names, English names and codes). */
export function LangPicker({ onBack, onPick }: { onBack: () => void; onPick: (l: Lang) => void }) {
  const [q, setQ] = useState(""), list = filterLangs(q);
  return (
    <>
      <Mu>LANGUAGES</Mu><H>🌐 Choose your language</H>
      <TextInput value={q} onChangeText={setQ} autoCorrect={false} placeholder={`Search ${LANGS.length} languages`} placeholderTextColor={C.mu} accessibilityLabel="Search languages"
        style={{ color: C.fg, fontSize: 17, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 14, backgroundColor: C.card }} />
      <Mu>{list.length} of {LANGS.length} languages · the game screens switch instantly</Mu>
      <Card>
        {list.length === 0 && <Text style={{ color: C.mu }}>No language found. Try another spelling.</Text>}
        {list.map(([code, native, english]) => (
          <Pressable key={code} accessibilityRole="button" accessibilityLabel={`${english}${cfg.lang === code ? ", selected" : ""}`} onPress={() => onPick(code)}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomColor: C.bd, borderBottomWidth: 1 }}>
            <View style={{ flex: 1 }}><Text style={{ color: C.fg, fontSize: 19, fontWeight: "700" }}>{native}</Text><Text style={{ color: C.mu }}>{english}</Text></View>
            <Text style={{ color: C.v, fontSize: 20 }}>{fx.lang === code ? "✓" : ""}</Text>
          </Pressable>
        ))}
      </Card>
      <Mu>Translations are machine-assisted and cover the main game screens. Event cards and tips are in English for now. Help us improve them!</Mu>
      <Btn t="Done" pri onPress={onBack} style={{ marginTop: 10 }} />
    </>
  );
}
