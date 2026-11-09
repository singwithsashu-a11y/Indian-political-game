# Technical Architecture & Anti-Cheat Specification

## 1. Modular Full-Stack Architecture
- **Frontend (`src/`)**: React 19 + TypeScript + Tailwind CSS v4 + custom 60Hz deterministic 2.5D HTML5 Canvas Fighting Engine + Web Audio API procedural sound & voice synthesizer.
- **Backend (`server.ts`)**: Node.js + Express + `ws` (WebSocket Server attached to HTTP Server on port 3000) providing:
  - Authoritative Multiplayer Room & Matchmaking Coordinator.
  - Server-side Anti-Cheat & Match Result Verification API (`/api/*`).
  - Firebase Admin SDK token verification (`firebase-admin`).
- **Database & Auth (`Firebase Firestore + Firebase Auth`)**:
  - Real-time document persistence for `users`, `matches`, `leaderboard`, `achievements`, `reports`, and `gameConfig`.
  - Protected by zero-trust `firestore.rules` audited with `@firebase/eslint-plugin-security-rules`.

## 2. Server-Authoritative Multiplayer & Anti-Cheat
1. **Room Lifecycle**:
   - Players can create Private Rooms (6-character alphanumeric code), join via code, or enter the Public Matchmaking Queue.
   - Server maintains authoritative room state (`WAITING`, `READY_CHECK`, `PLAYING`, `FINISHED`).
2. **Input & State Validation (Anti-Speed-Hack / Anti-Teleport)**:
   - Clients transmit input frames (`seq`, `keys`, `timestamp`) and synchronized fighter state deltas.
   - Server validates movement deltas against maximum velocity bounds (`maxDeltaX <= 14px/tick`) and rate-limits attack packets to prevent speed hacks or cooldown bypasses.
3. **Server-Verified Match Completion & Rewards**:
   - Client-submitted match outcomes are validated against minimum match duration, round count, damage plausibility, and active session nonces to prevent duplicate reward claims or fabricated wins.
