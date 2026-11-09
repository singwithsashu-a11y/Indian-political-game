# QA, Security & Automated Testing Documentation

## 1. Test Coverage Matrix
| Suite | Target Module | Assertions Verified |
|-------|---------------|---------------------|
| **Combat Physics & Frame Data** | `src/game/engine.ts` | Movement clamping (`[80, 1120]`), jump gravity arc, standing/crouching block damage reduction (`80%`), target combo chains (`J,J,J`, `↓J,K`), Shakti meter cap (`100`). |
| **Ahinsa Boss Counter (`GTu026DgX-U`)** | `src/game/engine.ts` | Non-violent poise against Shanti Bapu increments `ahinsaMeter` to `100%` and triggers `SATYAGRAHA VICTORY`; violent spam triggers moral reflection. |
| **Anti-Cheat Match Verifier** | `server.ts` (`/api/matches/verify`) | Rejects negative/impossible match durations (`< 5s`), rejects duplicate `matchId` replay claims, caps XP/Coin payouts to server-computed values. |
| **WebSocket Room & Sync** | `server.ts` (`/ws`) | Room creation generates unique 6-char code, guest join triggers `READY_CHECK`, speed-hack movement deltas (`> 35px/tick`) are clamped server-side. |
| **Firestore Security Rules** | `firestore.rules` | Audited via `@firebase/eslint-plugin-security-rules` and verified against the "Dirty Dozen" adversarial payloads in `security_spec.md`. |

## 2. Running Verification Suites
- **TypeScript & Static Analysis**: `npm run lint`
- **Production Bundle Verification**: `npm run build`
- **Firestore Security Rules Linter**: `npx eslint firestore.rules`
- **In-App Diagnostics & Self-Test**: Open the **Docs & Architecture** modal in the top navigation bar and run the interactive **Engine & Anti-Cheat Self-Test Suite**.
