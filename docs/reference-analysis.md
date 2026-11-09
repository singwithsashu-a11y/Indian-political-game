# Phase 1: Complete Reference Website Analysis (`fightkaro.com` & `youtu.be/GTu026DgX-U`)

## Executive Summary
Direct inspection of `https://fightkaro.com/` and the reference gameplay breakdown video (`https://youtu.be/GTu026DgX-U`) confirms that **FightKaro** (titled ***Sansad Showdown — The Great Kursi Fight***) is a browser-based 1v1 political satire arcade fighting game built with HTML5 Canvas/WebGL, DOM HUD overlays, synthesized/sampled audio, and peer-to-peer room codes.

Below is the exhaustive 20-point inspection classifying every feature as **Verified**, **Partially Verified**, **Not Accessible**, or **Proposed Improvement**.

---

## Feature Classification Matrix

| # | Area | Status | Evidence & Technical Findings |
|---|------|--------|-------------------------------|
| 1 | **Homepage Layout** | **Verified** | Single-page full-viewport app (`#game` canvas + screen overlays). Opens with a bilingual Satire Legal Notice (`#legal`), followed by `#loading` and `#title` ("SANSAD SHOWDOWN: THE GREAT KURSI FIGHT"). |
| 2 | **Game Loading Experience** | **Verified** | `#loading` screen displays progress bar (`#load-fill`) with `"Loading neta assets…"`. Individual fighters also lazy-load on selection (`#neta-download` with percentage `#dl-pct`). |
| 3 | **Main Menu / Character Select** | **Verified** | Combined into the `#select` screen ("PICK YOUR NETA") featuring a 13-tile grid (10 playable fighters, 1 Boss tile `MBAPU`, 1 Chapter 2 Trailer tile, 1 Random tile), Stage selector (`SANSAD`, `JANTAR MANTAR`, `DESI SADAK`), CPU Difficulty selector (`EASY`, `NORMAL`, `HARD`), `"PLAY WITH A FRIEND"` online button, and `"FIGHT!"` CTA. |
| 4 | **Actual Gameplay** | **Verified** | Best-of-3 rounds (`2 win pips`), 60-second timer (`#timer`) 1v1 side-view fighting game with health bars (`hp-fill` + `hp-trail`), `SHAKTI` super meters, combo counters, and a live satirical TV News Desk (`#newsdesk`) with dual anchors (`godi` vs `troll`) and a scrolling `BREAKING` news ticker. |
| 5 | **Game Controls** | **Verified** | Keyboard: `A/D` or `←/→` Move, `W/↑` Jump, `S/↓` Crouch, Hold Back to Block, `J` Punch, `K` Kick, `I` or `J+K` Grab, `L/Space` Super, `B` Budget special counter, `Esc` Pause, `M` Music, `N` Mute. Mobile (`#touch`): Virtual joystick + `PUNCH`, `KICK`, `GRAB`, `SUPER`, and conditional `BUDGET` button. |
| 6 | **Game Mechanics** | **Verified** | Hitstun, blockstun, chip damage, knockdowns, directional specials (`→J`, `→K`, `↓K` sweep), 6 target combos (`J,J,J`, `J,J,K`, `J,K,K`, `K,K`, `↓J,J`, `↓J,K`), throw/grab breaks, and `SHAKTI` meter gain on hit/block. |
| 7 | **Player Movement** | **Verified** | Smooth horizontal walk/dash, jump arcs with gravity, crouch hitbox reduction, automatic facing flip toward opponent, and stage boundary clamping. |
| 8 | **Combat & Boss Mechanics (`GTu026DgX-U`)** | **Verified** | Video `GTu026DgX-U` ("How to defeat MBAPU Player in Sansad Show Down") and DOM elements (`#bapu-quest`, `#bapu-stats`, `#budget-meter`) verify a unique boss puzzle: MBAPU has overwhelming stats if fought violently, but practicing **Ahinsa (Non-Violence)**—blocking/evading without striking back—or activating the **Budget Strike (`B`)** meter provides the special counter condition. |
| 9 | **Multiplayer Functionality** | **Verified** | `"🌐 PLAY WITH A FRIEND"` opens `#online` modal to Host or Join a room using a short room code (`rooms-CRfnBsqC.js`). Includes `#net-away` ("Waiting for your friend…") and `#net-badge` connection indicator. |
| 10 | **Game Modes** | **Verified** | 1P vs CPU (Easy/Normal/Hard), Boss Challenge (vs MBAPU), and 1v1 Friend Room Multiplayer. |
| 11 | **Matchmaking** | **Proposed Improvement** | Reference only supports manual room code sharing with friends. We add automated **Public Quick Matchmaking Queue** alongside Private Room Codes. |
| 12 | **Lobby & Room System** | **Verified** | Host generates a room code; guest joins via code; character selection syncs across peers before starting the match. |
| 13 | **Player Profiles** | **Proposed Improvement** | Reference stores minimal local progress in `localStorage` (`sansad-showdown:*`). We implement full persistent **Player Profiles** in Firestore (Avatar, Title, Level, XP, Win/Loss record, Favorite Fighter, Match History). |
| 14 | **Scoreboard & Rankings** | **Proposed Improvement** | Reference lacks a global leaderboard. We implement a verified **Global Leaderboard** ranked by ELO Rating, Total Wins, and XP. |
| 15 | **Mobile Responsiveness** | **Verified** | Includes `#rotate` landscape prompt, `#ios-swipe` fullscreen helper, and `#touch` virtual joystick + 4-button arcade pad. |
| 16 | **Audio & Visual Effects** | **Verified** | Screen vignette (`#vignette`), hit flash (`#flash`), floating comic popups (`#popups`), super activation banner (`#super-banner`), camera shake, hit-stop frames, and satirical voice/SFX cues. |
| 17 | **Login & Registration** | **Proposed Improvement** | Reference has no user authentication. We implement **Firebase Google Authentication** + **Instant Guest Mode** with persistent profile syncing. |
| 18 | **Loading Screens** | **Verified** | Initial asset preload screen (`#loading`) and per-character download bar (`#neta-download`). |
| 19 | **Game-Over / Results Screen** | **Verified** | `#result` renders a satirical newspaper front page (`THE DAILY JUMLA`) with date, dynamic headline, winner stamp (`YOU WIN!`), and character-specific losing excuses (e.g., *"Scoreboard hack ho gaya tha"*, *"Bulldozer ka diesel khatam ho gaya tha"*). |
| 20 | **Replay & Rematch Functionality** | **Verified** | `#rematch-btn` ("REMATCH") immediately restarts the bout with the same fighters and stage; `#select-btn` ("CHARACTER SELECT") returns to the roster grid. |
