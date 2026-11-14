// Live NASA data: NASA Image and Video Library API (public, no key needed).
const API = "https://images-api.nasa.gov";
export type Vid = { id: string; title: string; thumb?: string };

export async function searchVideos(q: string): Promise<Vid[]> {
  const r = await fetch(`${API}/search?q=${encodeURIComponent(q)}&media_type=video&page_size=12`);
  if (!r.ok) throw new Error("NASA search failed");
  const j = await r.json();
  return (j.collection?.items ?? []).slice(0, 12).map((i: any) => ({
    id: i.data[0].nasa_id, title: i.data[0].title,
    thumb: i.links?.[0]?.href?.replace(/^http:/, "https:"),
  }));
}

export async function videoUrl(id: string): Promise<string> {
  const r = await fetch(`${API}/asset/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error("NASA asset failed");
  const j = await r.json();
  const u: string[] = (j.collection?.items ?? []).map((x: any) => x.href as string).filter((h: string) => /\.mp4$/i.test(h));
  const pick = u.find((h) => /~medium\.mp4$/i.test(h)) || u.find((h) => /~mobile\.mp4$/i.test(h)) || u[0];
  if (!pick) throw new Error("No playable file");
  return pick.replace(/ /g, "%20").replace(/^http:/, "https:");
}
