# LokSabha Legends: The Great Kursi Showdown

Complete reverse-engineering analysis and original production browser fighting game inspired by **FightKaro (`fightkaro.com`)** and the **MBAPU / Ahinsa Boss Guide (`youtu.be/GTu026DgX-U`)**.

---

## Documentation Index (`/docs`)
All Phase 1–14 engineering, design, database, and QA documents are included in `/docs` and viewable directly inside the application via the **Docs & QA Suite** top navigation link:

1. [`docs/reference-analysis.md`](docs/reference-analysis.md) — 20-point verified inspection of `fightkaro.com` & `GTu026DgX-U`.
2. [`docs/game-mechanics.md`](docs/game-mechanics.md) — Frame data, hitstun/blockstun, 6 target combos, directional specials, and the *Ahinsa* Boss counter mechanic.
3. [`docs/gdd.md`](docs/gdd.md) — Complete Game Design Document (11 fighters, 3 stages, progression & rewards).
4. [`docs/user-flow.md`](docs/user-flow.md) — End-to-end user journey and game state machine.
5. [`docs/ui-design.md`](docs/ui-design.md) — 60-30-10 color architecture, typography (`Oswald` + `Plus Jakarta Sans` + `JetBrains Mono`), and responsive HUD.
6. [`docs/technical-architecture.md`](docs/technical-architecture.md) — Full-stack Express + WebSocket multiplayer + anti-cheat verifier architecture.
7. [`docs/database-schema.md`](docs/database-schema.md) — Cloud Firestore collections (`firebase-blueprint.json`) and relational PostgreSQL DDL schema.
8. [`docs/api-documentation.md`](docs/api-documentation.md) — Authoritative REST API and WebSocket real-time protocol specification.
9. [`security_spec.md`](security_spec.md) & [`firestore.rules.test.ts`](firestore.rules.test.ts) — Phase 0 Payload-First Security TDD & "Dirty Dozen" adversarial payloads.
10. [`docs/testing-documentation.md`](docs/testing-documentation.md) — Automated QA & security verification suite.
11. [`docs/deployment-guide.md`](docs/deployment-guide.md) — Production build, WebSocket hosting, and environment guide.

---

## Core Gameplay & Controls

- **Move**: `A / D` or `← / →`
- **Jump**: `W` or `↑`
- **Crouch**: `S` or `↓`
- **Block**: Hold **Back** (away from opponent)
- **Punch**: `J`
- **Kick**: `K`
- **Grab (Guard Break)**: `I`
- **Shakti Super (100% Meter)**: `L` or `Space`
- **Nirmala's Budget Audit Strike**: `B`
- **Target Combos**: `J,J,J` · `J,J,K` · `J,K,K` · `K,K` · `↓J,K` (Low Chappal Sweep)
- **Defeating Boss Shanti Bapu (`GTu026DgX-U`)**: Violent attacks reflect off his moral aura! Hold peaceful poise (block/dodge without striking back) to fill the **Ahinsa Harmony Bar** to 100% for a **Satyagraha Peace Victory**, or trigger the **Budget Strike (`B`)** when full.

---

## Quick Start & GitHub Push

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + WebSocket + Vite on Port 3000)
npm run dev

# Verify TypeScript & Firestore Security Rules
npm run lint
npx eslint firestore.rules

# Production build & start
npm run build
npm start
```
