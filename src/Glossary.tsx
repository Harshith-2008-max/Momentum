import React, { useState } from "react";
import { Text, TextInput } from "react-native";
import { searchGlossary } from "./profile";
import { Btn, C, Card, H, Mu } from "./ui";

export function Glossary({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState(""), list = searchGlossary(q);
  return (
    <>
      <Mu>SPACE GLOSSARY</Mu><H>📖 What does it mean?</H>
      <TextInput value={q} onChangeText={setQ} placeholder="Search a space word" placeholderTextColor={C.mu} accessibilityLabel="Search the glossary"
        style={{ color: C.fg, fontSize: 17, borderColor: C.bd, borderWidth: 1, borderRadius: 14, padding: 14, backgroundColor: C.card }} />
      {list.length === 0 && <Mu>No match. Try a shorter word.</Mu>}
      {list.map(([term, def]) => <Card key={term}><Text style={{ color: C.v, fontWeight: "800", fontSize: 17 }}>{term}</Text><Text style={{ color: C.fg, marginTop: 4 }}>{def}</Text></Card>)}
      <Btn t="Back" onPress={onBack} style={{ marginTop: 8 }} />
    </>
  );
}
