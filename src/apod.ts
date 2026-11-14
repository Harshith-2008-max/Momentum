// NASA Astronomy Picture of the Day (NASA Open APIs). DEMO_KEY is rate-limited; set EXPO_PUBLIC_NASA_KEY for your own free key.
export type Apod = { title: string; url: string; explanation: string };
export async function getApod(): Promise<Apod | null> {
  try {
    const k = process.env.EXPO_PUBLIC_NASA_KEY || "DEMO_KEY";
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${k}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j.media_type === "image" && typeof j.url === "string"
      ? { title: String(j.title), url: j.url.replace(/^http:/, "https:"), explanation: String(j.explanation ?? "") } : null;
  } catch { return null; }
}
