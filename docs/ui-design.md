# UI/UX Design Specification

## 1. Visual Direction & Color System (60-30-10 Discipline)
- **60% Dominant Arena & Parliamentary Canvas**: Deep Sansad Mahogany & Obsidian Slate (`#120A06` to `#18121E`) providing maximum contrast for character sprites, hit sparks, and HUD telemetry.
- **30% Structural Surfaces**: Warm Sandstone & Brass-bordered broadcast panels (`#1E1612` / `#2A1F1A`) and vintage newsprint (`#F4EAD5`) for the post-match *Daily Jumla* newspaper result screen.
- **10% High-Intent Accent Budget**: Saffron Gold (`#FF9933`), Broadcast Live Crimson (`#E11D48`), and Shakti Electric Cyan (`#22D3EE`) reserved strictly for primary CTAs, active health/super meters, and turn/hit indicators.

## 2. Typography Pairings (2+1 Font Rule)
- **Display / Arcade Broadcast Headers**: `Oswald` / `Bebas Neue` — bold condensed athletic display typography for fighter names, round banners, KO stamps, and newspaper headlines.
- **Body & Satire Copy**: `Plus Jakarta Sans` — crisp, high-legibility geometric sans-serif for menus, move lists, news ticker commentary, and documentation.
- **Telemetry & Frame/Timer Numerals**: `JetBrains Mono` with `tabular-nums` — used for the 60-second match clock, combo damage counters, frame ping, ELO ratings, and leaderboard tables.

## 3. HUD & Responsive Ergonomics
- **Top Broadcast HUD**: Left and Right fighter portraits, high-contrast HP bars with delayed red damage trails (`hp-trail`), round victory pips, and central 60s tabular countdown clock.
- **Bottom Shakti & News Desk Strip**: Dual `SHAKTI` super meters (`0–100%`) flanking the live satirical TV News Desk (`GODI TV` vs `FACT CHECK TV`) and scrolling `BREAKING` ticker.
- **Mobile-First Touch Controls**: Dedicated virtual thumbstick on the bottom-left and color-coded 44px+ arcade action buttons (`PUNCH`, `KICK`, `GRAB`, `SUPER`, `BUDGET`) on the bottom-right.
