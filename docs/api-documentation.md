# Backend REST API & WebSocket Protocol Documentation

## 1. Authoritative REST API Endpoints (`server.ts`)

### `GET /api/health`
Returns server uptime, active multiplayer rooms, matchmaking queue depth, and anti-cheat validator status.

### `POST /api/matches/verify`
Server-side anti-cheat verification before committing match rewards.
- **Request Body**:
  ```json
  {
    "matchId": "match_1731165000_abc12",
    "mode": "cpu",
    "stage": "sansad",
    "p1Fighter": "vikas",
    "p2Fighter": "yatra",
    "roundsWonP1": 2,
    "roundsWonP2": 1,
    "durationSec": 48,
    "maxCombo": 6,
    "damageDealt": 210,
    "ahinsaVictory": false
  }
  ```
- **Validation Rules**:
  - Rejects duplicate `matchId` (idempotency & replay-attack guard).
  - Verifies `durationSec >= 5 && durationSec <= 300`.
  - Verifies `roundsWonP1` and `roundsWonP2` are within `[0, 2]` and at least one fighter reached winning criteria.
  - Verifies `maxCombo <= 25` and `damageDealt <= 600`.
- **Response (`200 OK`)**:
  ```json
  {
    "verified": true,
    "signature": "srv_sig_9f8a7d6c",
    "rewards": { "xpEarned": 180, "coinsEarned": 45, "eloDelta": 18 }
  }
  ```

### `GET /api/rooms`
Returns public joinable rooms currently in `WAITING` status.

---

## 2. Real-Time WebSocket Protocol (`ws://<host>/ws`)

### Client → Server Events
| Event Type | Payload | Description |
|------------|---------|-------------|
| `room:create` | `{ playerName, fighterId, isPrivate, stage }` | Creates a new room with a 6-character code (e.g., `KURS26`). |
| `room:join` | `{ code, playerName, fighterId }` | Joins an existing room by 6-character code. |
| `matchmaking:join` | `{ playerName, fighterId }` | Enters the automated public 1v1 matchmaking queue. |
| `matchmaking:leave` | `{}` | Leaves the public matchmaking queue. |
| `player:select` | `{ fighterId, stage, ready }` | Updates fighter selection and ready state in the lobby. |
| `game:input` | `{ seq, x, y, vx, vy, hp, shakti, state, facing, attackType }` | Authoritative frame sync validated by server speed/bound checks. |
| `game:round_end` | `{ winnerSlot, p1Hp, p2Hp, ahinsaVictory }` | Reports round conclusion for server state reconciliation. |
| `game:rematch` | `{}` | Requests an immediate rematch in the active room. |

### Server → Client Events
| Event Type | Payload | Description |
|------------|---------|-------------|
| `room:state` | `{ code, status, stage, host, guest }` | Full room lobby state synchronization. |
| `game:start` | `{ seed, stage, p1, p2, startTime }` | Signals synchronized match start. |
| `game:sync` | `{ slot, x, y, vx, vy, hp, shakti, state, facing, attackType, serverTime }` | Broadcasts validated opponent frame state. |
| `player:disconnected` | `{ slot, message }` | Notifies remaining player if opponent disconnects. |
| `error:msg` | `{ message }` | Validation or room lookup error message. |
