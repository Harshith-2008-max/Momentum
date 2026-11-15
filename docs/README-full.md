# 🚀 Outpost Command
### Can you beat history? A Junior Astronaut Mission Trainer for the NASA Space Apps Challenge 2026

Design and run a Moon or Mars outpost. Split a rocket's launch weight between solar panels, batteries, radiation shielding, a greenhouse and spare parts, then keep three astronauts alive for 14 days. Every choice costs something, and the debrief shows exactly why a mission failed or succeeded.

**Live demo:** `https://<your-github-username>.github.io/<this-repo>/` (published automatically by the *Deploy web demo* workflow; see "Run it" below)

## 60-second tour (for judges)
1. Open the app, enter a name, and tap **🛰️ Outpost Command**.
2. Tap **Moon base**. On the **Design your outpost** screen, move weight between the five systems, then **Launch**.
3. Play a few days: pick two crew jobs, switch lights and lab on or off, tap **End day**, and read *what happened*.
4. Try **🕰️ Mission History** (Opportunity 2018, Chandrayaan-3 night 2023, solar storm 1972) and see *what really happened* after the mission.
5. In the debrief, tap **⏪ What if?** to rewind to a decision day and choose differently.

## How it answers the challenge
| The challenge asks for | In the app |
|---|---|
| A game that runs a lunar or Martian outpost | Moon base and Mars outpost, 14 days, three astronauts |
| Balance life support, radiation shielding, power, food | A launch-weight design step, then daily jobs and power switches. Batteries, panels, shielding, greenhouse and spares all change the outcome |
| Decisions that decide failure or success | Deterministic simulation: careless or badly designed outposts fail (covered by tests); debrief names the main cause; rewind to try again |
| Tangible, not oversimplified | Real figures (see [NOTICE.md](NOTICE.md)); Commander mode shows the numbers |
| Not too complex for young learners | 4-step tutorial, Junior view with 6 bars, daily tip, 3 stars and badges |

## What makes it different
- **Mission History:** replay the real events that tested actual missions, then read what really happened.
- **Live NASA data:** the in-game solar storm is the strongest real flare of the last 30 days from NASA's DONKI database (falls back to a training storm offline). Debriefs show real NASA videos.
- **Measured learning:** a 5-question check before and 5 different questions after, with the gain shown.
- **Classroom ready:** crew mode (3 players, 1 phone), teacher class codes, and a results dashboard with no student accounts and no server.
- **Local relevance:** 18 languages on the Outpost screens, with a searchable language screen (English, Tamil, Hindi, Spanish, French, Portuguese, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Chinese, Japanese, Korean, German, Russian, Indonesian), and an ISRO story alongside NASA's.
- **Profile and rewards:** level and XP, stats, badges, a flight log, a wardrobe for the Cosmo companion, and a vibrant top-right badge that opens the profile.
- **Instant feedback:** after every day, colored chips show what changed (for example Battery ▼ 30). The learning check explains each answer in one line, and a feedback form collects ratings and comments.
- **More events:** 11 extra event cards (mold, water ice, dust devil, moon dust, meteor shower, a birthday and more), drawn at random, three per mission, on top of the core events.
- **Space glossary** with search, and extra settings: text size, sound volume, color-blind friendly bars, kid-safe mode, and a switch for Cosmo's tips.
- A focus-timer called *Momentum* (micro-tasks, stars, a companion) sits around the game as bonus training.

## Run it
```bash
git clone <this repo> && cd <this repo>
npm ci
npm start            # then press w for web, or scan the QR code with Expo Go on a phone
```
Optional: copy `.env.example` to `.env` and add your own free NASA key (`EXPO_PUBLIC_NASA_KEY`). Everything else works without keys.

**Publish the live demo on GitHub Pages:** push to `main`, then in the repository go to *Settings → Pages → Source → GitHub Actions*. The *Deploy web demo* workflow builds `npm run web:build` and publishes it.

## Tests
```bash
npm run typecheck    # TypeScript
npm run test:logic   # simulation, balance, teacher mode, learning check, languages, NASA parsing
npm test             # end-to-end UI walkthroughs (jest-expo)
```
CI runs all three on every push. The tests simulate the launch designs and check that good play can win while careless play fails.

## Project map
```
App.tsx                 app shell, Momentum focus trainer, navigation
src/outpost.ts          simulation engine (pure and tested): events, design, scoring, history, coach
src/Outpost.tsx         Outpost Command screens
src/{teacher,learn,donki,nasa,apod,i18n,ai}.ts   teacher mode, learning check, NASA APIs, languages
supabase/functions/     optional AI task breakdown and mission coach (server-side key)
tests/                  logic and UI tests
docs/SUBMISSION.md      pitch, demo script and checklist
```

## Use of AI
The code and design were created with help from Claude (Anthropic) and reviewed and tested by the author. The simulation itself uses no AI at runtime, so every result can be explained. Optional AI features (task breakdown, mission coach) call Claude through Supabase Edge Functions that keep the API key on the server; their replies are validated and the app falls back to offline text.

## Honest limitations
- Game numbers are simplified teaching approximations (meters are 0 to 100; the lunar night is shortened to 4 days in one replay).
- Not yet user-tested with students. All non-English translations are machine-assisted and need a native speaker's review. They cover the main game screens; event cards and tips are English only. Arabic and Urdu are not included yet because they need right-to-left layout.
- The NASA DONKI call was verified against sample data and the public documentation; confirm it with your own key.
- Tested in an automated environment; test on real phones before relying on it.

## License
[MIT](LICENSE). Data and media attributions are in [NOTICE.md](NOTICE.md). This project is not endorsed by NASA.
