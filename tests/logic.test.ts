import { build, MISSIONS, QUIZ, G } from "../src/data";
import { searchVideos, videoUrl } from "../src/nasa";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };

// routing
ok(build("Land on Mars").name === "Mars Expedition", "Mars goal routes to Mars mission");
ok(build("Finish my mission report").emoji === "🚀", "word 'mission' no longer routes to ISS");
ok(build("space station crew").name === "Space Station Crew", "station routes to ISS");
ok(build("finish my essay").tasks.length === 5, "generic plan has 5 steps");
// every task < 10 min, quiz indexes valid
for (const m of Object.values(MISSIONS)) {
  ok(m.tasks.every(t => t.m < 10), `${m.name}: all steps under 10 min`);
  ok(m.tasks.filter(t => t.kind === "quiz").every(t => QUIZ[t.arg] !== undefined), `${m.name}: quiz indexes valid`);
  ok(m.tasks.filter(t => t.kind === "grav").every(t => G[t.arg] > 0), `${m.name}: gravity bodies valid`);
}
ok(Math.abs(0.5 * G.Earth / G.Moon - 3.03) < 0.01, "Moon jump 0.5m -> ~3.03m");

// NASA API parsing with mocked responses
(globalThis as any).fetch = async (u: string) => ({ ok: true, json: async () =>
  u.includes("/search") ? { collection: { items: [{ data: [{ nasa_id: "abc", title: "Moon walk" }], links: [{ href: "http://x/y.jpg" }] }] } }
  : { collection: { items: [{ href: "http://a/b~orig.mp4" }, { href: "http://a/b ~medium.mp4" }, { href: "http://a/b.srt" }] } } });
(async () => {
  const v = await searchVideos("moon");
  ok(v[0].id === "abc" && v[0].thumb === "https://x/y.jpg", "searchVideos maps id/title and upgrades thumb to https");
  const url = await videoUrl("abc");
  ok(url === "https://a/b%20~medium.mp4", "videoUrl prefers medium mp4, https, encodes spaces: " + url);
})();
