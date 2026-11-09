# User Flow & State Machine Architecture

## 1. End-to-End Player Journey
```
[First Visit: Satire Disclaimer Modal (#legal)]
        │
        ▼ (Accept & Persist Consent)
[Splash & Asset Preloader (#loading)]
        │
        ▼
[Title Screen (#title) — "LOKSABHA LEGENDS: THE GREAT KURSI SHOWDOWN"]
        │
        ▼ (Press Enter / Tap to Start)
[Main Roster & Mode Hub (SELECT Screen)]
   ├──► [1P vs CPU] ──► Pick 1P Fighter + CPU Fighter + Stage + Difficulty ──► [ACTIVE MATCH]
   ├──► [Boss Challenge: Shanti Bapu] ──► Ahinsa / Budget Mechanics Enabled ──► [ACTIVE MATCH]
   ├──► [Multiplayer Lobby]
   │       ├──► Create Private Room (6-char Code) ──► Share Code ──► Ready Check ──► [ONLINE MATCH]
   │       ├──► Join Room by Code ──► Ready Check ──► [ONLINE MATCH]
   │       └──► Public Quick Matchmaking Queue ──► Auto-Pair or Bot Fallback ──► [ONLINE MATCH]
   ├──► [Player Profile, Progression & Daily Rewards Modal]
   ├──► [Global Leaderboard & Match History Modal]
   ├──► [Docs, GDD & Architecture Viewer Modal]
   └──► [Admin Dashboard (RBAC Protected)]
```

## 2. Match Lifecycle Flow
1. **Pre-Match Intro (`ROUND_INTRO`)**: Fighters enter the stage, announcer calls `"ROUND 1 — KURSI KI PETI BAANDH LO — FIGHT!"`.
2. **Active Combat (`PLAYING`)**:
   - 60-second countdown timer.
   - Live TV News Desk commentary dynamically reacts to combos, throws, low HP, and super moves.
   - Pause (`Esc`) triggers `"CHAI BREAK ☕ — Sansad adjourned till further notice"` in local modes.
3. **Round Resolution (`ROUND_OVER`)**:
   - Triggered when a fighter's HP reaches `0` (KO) or timer hits `00` (Time Over — higher HP percentage wins; equal HP awards draw pip).
   - First fighter to win **2 Rounds** wins the match.
4. **Post-Match Newspaper Screen (`MATCH_RESULT`)**:
   - Renders **"THE DAILY JUMLA"** front-page newspaper with dynamic headline, winner stamp (`YOU WIN!` / `KURSI LOST!`), match statistics (Max Combo, Damage Dealt, Ahinsa Score), XP & Coin rewards synced to backend/Firestore, and the defeated fighter's satirical excuse.
   - Immediate actions: **REMATCH** (instant state reset) or **CHARACTER SELECT**.
