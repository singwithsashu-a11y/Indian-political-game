# Database Schema & Data Model Documentation

## 1. Entity Relationship Overview
Our persistence architecture supports both **Cloud Firestore** (active production document store with zero-trust ABAC security rules) and **PostgreSQL / Relational DDL** (included below for self-hosted SQL deployments).

---

## 2. Cloud Firestore Collections (`firebase-blueprint.json`)
To enforce **PII Isolation (Pillar 6)**, user email/account metadata is isolated in `/users_private/{userId}` while public game statistics, ELO ratings, and progression reside in `/users/{userId}`.

| Collection Path | Document ID | Access Policy | Purpose |
|-----------------|-------------|---------------|---------|
| `/users/{userId}` | `request.auth.uid` | Public Read (Leaderboard/Profiles), Owner/Admin Write | Username, Avatar, Title, XP, Level, Coins, Wins, Losses, ELO, Streak, Achievements |
| `/users_private/{userId}` | `request.auth.uid` | Strict Owner/Admin Only (`isOwner(userId) \|\| isAdmin()`) | Email address, account settings, last login audit |
| `/matches/{matchId}` | Match UUID | Authenticated Participant Read/Create, Immutable after creation | Verified match history, fighters used, round scores, duration, newspaper headline |
| `/reports/{reportId}` | Report UUID | Reporter Create/Read, Admin Read/Update (`status`) | Player moderation & anti-cheat incident reports |
| `/game_config/{configId}` | `"global"` | Public Read, Admin-Only Write | Live balance tuning (`roundTimeSec`, `shaktiGainMultiplier`, `announcement`) |
| `/admins/{adminUid}` | Admin UID | Admin Read | Trusted RBAC lookup table |

---

## 3. Relational PostgreSQL Reference Schema (DDL)
For deployments targeting external PostgreSQL instances (`migrations/001_init.sql`):

```sql
CREATE TABLE users (
  uid VARCHAR(128) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'player',
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_profiles (
  uid VARCHAR(128) PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  username VARCHAR(40) NOT NULL,
  avatar_id VARCHAR(32) NOT NULL DEFAULT 'vikas',
  title VARCHAR(64) NOT NULL DEFAULT 'Yuva Karyakarta',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 100,
  last_daily_claim VARCHAR(32) DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_statistics (
  uid VARCHAR(128) PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  elo INTEGER NOT NULL DEFAULT 1000,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  boss_defeated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE matches (
  match_id VARCHAR(64) PRIMARY KEY,
  player1_uid VARCHAR(128) NOT NULL,
  player1_name VARCHAR(40) NOT NULL,
  player1_fighter VARCHAR(32) NOT NULL,
  player2_uid VARCHAR(128) NOT NULL,
  player2_name VARCHAR(40) NOT NULL,
  player2_fighter VARCHAR(32) NOT NULL,
  winner_uid VARCHAR(128) NOT NULL,
  mode VARCHAR(24) NOT NULL,
  stage VARCHAR(24) NOT NULL,
  rounds_won_p1 SMALLINT NOT NULL,
  rounds_won_p2 SMALLINT NOT NULL,
  duration_sec SMALLINT NOT NULL,
  max_combo SMALLINT NOT NULL DEFAULT 1,
  ahinsa_victory BOOLEAN NOT NULL DEFAULT FALSE,
  headline VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_player_stats_elo ON player_statistics(elo DESC);
CREATE INDEX idx_matches_p1 ON matches(player1_uid, created_at DESC);
```
