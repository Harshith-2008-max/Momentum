# NASA Space Apps 2026 · Submission kit
**Challenge:** Build a Junior Astronaut Mission Trainer
**Project:** Momentum · Outpost Command (Junior Astronaut Mission Trainer)
**Team:** _fill in names and roles_

## What makes this different (lead with this)
**Tagline: "Can you beat history?"**
Most outpost games are a sandbox with made-up events. This one is a flight recorder tied to real space history.
1. **Mission History:** replay the real events that tested actual missions: the 2018 global dust storm that ended NASA's Opportunity rover, the lunar night that Chandrayaan-3 (ISRO) faced in 2023, and the huge solar storm of August 1972 between Apollo 16 and 17. Try to survive what history could not, then read what really happened.
2. **Live NASA data in the game:** the storm in your mission is the strongest real solar flare NASA's space-weather database recorded in the last 30 days.
3. **Measured learning:** a before-and-after check with different questions on the same ideas, so the gain is real.
4. **"What if?" rewind:** go back to any decision day and choose differently. It teaches cause and effect, which a score cannot.
5. **Ready for a classroom:** class codes, crew mode for groups of three, and a teacher dashboard with no student accounts.
6. **Built for its first users:** 18 languages with a searchable language screen, with an ISRO story alongside NASA's.
From the few public entries I could find, the others were outpost simulators; I did not see real-mission replays or measured learning. Check this yourself before claiming it.

## One-line pitch
Run a Moon or Mars outpost for 14 days. Every choice costs something, and you see exactly why a mission fails or succeeds.

## Focus: this is an outpost trade-off game first
The challenge is about engineering trade-offs, so lead with the outpost. Momentum's focus timer, the landing mini-game and the companion wardrobe are bonus training that earns stars; show them for ten seconds at most.

## How it avoids both traps in the challenge brief
- **Not oversimplified:** before launch you **design the outpost**: 10 weight units split across solar panels, batteries, radiation shielding, a greenhouse and spare parts. The limits are physical (battery size, how thick the shielding can be, how long life support lasts), so crew jobs cannot fix a bad design. Across all 381 possible launch mixes, only about 65% survive Mars and only about 44% survive the Opportunity replay, even with good play.
- **Not too complex for young learners:** a 4-step guided tutorial on the first mission, a Junior view with 6 simple bars (Commander mode shows all 8 plus numbers), a daily tip from Cosmo, and "what if?" rewind. Test this with real kids and report what you changed.

## What it is (about 150 words)
Outpost Command is a mobile and web game for ages 9 to 16. Players keep three astronauts alive on the Moon or Mars by balancing battery power, air, water, food, solar panels, life support and radiation shielding. Each day they choose two crew jobs and decide whether to spend power on grow lights and the science lab. Event cards (solar storm, cargo lander, micrometeorite leak, dust storm, lunar night, sick crew member) force trade-offs where every option has a cost. At the end, a debrief shows the cause-and-effect chain, a four-part score, the real NASA science behind each mechanic, and real NASA videos. Around the game sits Momentum, a focus trainer that turns real-life goals into 2 to 9 minute steps; finishing steps earns stars that buy outpost upgrades.

## How it answers the challenge
| Challenge asks for | In the app |
|---|---|
| Run a lunar or Martian outpost | Moon base (south pole) and Mars outpost, 14 days each |
| Design and balance life support, radiation shielding, power, food | Launch-weight design step, then 14 days of running the base; | 8 live meters; 6 crew jobs; grow-light and lab power switches |
| Decisions that determine failure or success | Deterministic simulation; careless play fails (tested); blackouts, hunger, storms and weak shielding all hurt the crew |
| Keep students coming back | Daily challenge, star ratings, badges, Mars unlock, shareable result grid |
| Work in a classroom | Teacher mode with class codes and a results dashboard, crew mode for groups, before-and-after learning check |
| Use real, current NASA data | Live NASA DONKI solar flare drives the storm event; NASA videos and picture of the day |
| Reach local students | 18 languages on the Outpost screens, with a search bar; Chandrayaan-3 (ISRO) fact |
| Make the stakes real | Mission History: Opportunity 2018, Chandrayaan-3 night 2023, Apollo-era storm 1972, each with what really happened |
| Teach real engineering trade-offs | Debrief links each mechanic to a real NASA figure; Commander mode shows the numbers |
| Interactive and engaging for students | Animated planets, event cards, sounds, stars, ranks, mission patches, companion wardrobe |

## NASA data used
**Live in the app (no key needed):** NASA DONKI space-weather database (strongest solar flare in the last 30 days becomes the in-game storm).  NASA Image and Video Library (videos in the debrief, Watch tab and training steps). NASA Astronomy Picture of the Day (home screen; uses `DEMO_KEY` unless you set your own).
**Built into the simulation** (verify each citation before you submit):
- Moon surface radiation about 1.37 mSv/day: Chang'e-4 lander measurement (Zhang et al., Science Advances, 2020).
- Mars surface radiation about 0.64 mSv/day: Curiosity RAD (Hassler et al., Science, 2014).
- Mars receives about 43% of Earth's sunlight: NASA Mars facts.
- ISS water recovery about 98%: NASA announcement, 2023.
- NASA career radiation limit 600 mSv: NASA standard, 2022.
- Opportunity dust storm and mission end (NASA/JPL, 2018 and 2019); Chandrayaan-3 sleep and wake attempt (ISRO, September 2023); August 1972 solar storm between Apollo 16 and 17 (NASA). Verify dates and wording against the sources.
- MOXIE oxygen from Martian CO2 (Perseverance); 2018 global dust storm and Opportunity.
Game values are simplified and normalised to 0 to 100 meters so students can reason about them. The lunar night is compressed to 3 days. Say so in your presentation.

## Use of AI (disclose this in the submission form)
The code and design were produced with help from Claude (Anthropic) and reviewed and tested by the team. The optional AI task-breakdown feature calls Claude through a Supabase Edge Function; the API key stays on the server and replies are validated. The outpost simulation itself uses no AI at runtime: it is deterministic, so every result can be explained. **Edit this section to describe what your team actually did.**

## How to prove it works (do this before the deadline)
1. Run the before-check with 15 to 20 students, let them play one mission, then run the after-check.
2. Use Teacher mode to collect results and screenshot the dashboard: average score, common failure causes, learning gain.
3. Put one number on a slide: "average quiz score rose from X to Y".

## Three-minute demo script
1. (20 s) Home: Hero, rank, "Outpost Command". Explain the challenge in one sentence.
2. (60 s) Start a Moon mission, take the cargo choice, set jobs, end two days. Point at the meters and the "what happened" log.
3. (40 s) Day 5 solar storm: choose "Keep working" with low shielding and show the health hit. Say why shielding matters.
4. (40 s) Jump to the debrief (play a quick run or use a recorded one): score, cause and effect, NASA science, NASA video.
5. (20 s) Momentum: finish a 2-minute step, earn stars, spend them on shield bags.

## Before you submit (checklist)
- [ ] Host the `web-build/` folder (Netlify drop, Vercel or GitHub Pages) and put the link in the form.
- [ ] Run on a real phone with Expo Go; fix anything that looks off; record a 30 to 60 second screen capture.
- [ ] Verify the NASA citations above and add the links.
- [ ] Add a team photo or names, a license, and the GitHub repo link.
- [ ] Rewrite the pitch in your own voice. Judges can tell.
- [ ] Add your own NASA API key (`EXPO_PUBLIC_NASA_KEY`) so the demo key limit does not hit during judging.

## Honest limitations
Translations cover the main game screens only, are machine-assisted, and Arabic and Urdu are not included yet because they need right-to-left layout.
On the Moon a careful crew can rescue most launch designs (the design still moves the score by about 27 points); the design decides success or failure mainly on Mars and in the Opportunity replay.
The DONKI call and field names were written from the public API documentation and tested only against sample data, so run it once with your key and check the home banner. All translations except English are machine-assisted and need a native speaker's review. Teacher mode has no student accounts by design; results travel as pasted text.
Not yet user-tested with students. Not run on devices before this kit. Simulation numbers are teaching approximations. Supabase sync and the AI function need your own accounts and keys.

## Roadmap
More worlds (Europa, ISS), a teacher dashboard with shareable scenario codes, multiplayer crews, localisation (the first users are in India, so Tamil and Hindi), and accessibility testing with real learners.
