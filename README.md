# 🚀 Outpost Command
**NASA Space Apps Challenge 2026 · Junior Astronaut Mission Trainer**

A game where students design and run a Moon or Mars outpost. You split a rocket's launch weight between solar panels, batteries, radiation shielding, a greenhouse and spare parts, then keep three astronauts alive for 14 days. Every choice costs something, and the debrief shows why a mission failed or succeeded.

**Live demo:** https://guileless-tanuki-a38d45.netlify.app

## Try it
1. Tap **Outpost Command** and pick **Moon base**.
2. Design your outpost, then **Launch**.
3. Pick two jobs each day and tap **End day**.
4. Try **Mission History** (Opportunity 2018, Chandrayaan-3 night, solar storm 1972).

## Features
- Design step with a launch-weight budget, then 14 days of power, air, water, food and radiation decisions
- Real events to replay, with "what really happened" after each
- Live NASA solar-flare data and NASA videos
- "What if?" rewind, daily challenge, badges
- Classroom tools: crew mode, class codes, teacher dashboard, before-and-after quiz
- English, Tamil and Hindi

## Run it
```bash
npm ci
npm start      # press w for web, or scan the QR code with Expo Go
```
Optional: copy `.env.example` to `.env` and add a free NASA key. Tests: `npm run typecheck`, `npm run test:logic`, `npm test`.

## Built with
React Native, Expo, TypeScript. NASA APIs: Image and Video Library, APOD, DONKI. Built with help from Claude (AI) and reviewed by the author. The simulation itself uses no AI.

More detail: [full README](docs/README-full.md) · [data credits](NOTICE.md) · [submission notes](docs/SUBMISSION.md)

## License
[MIT](LICENSE). Not endorsed by NASA.
