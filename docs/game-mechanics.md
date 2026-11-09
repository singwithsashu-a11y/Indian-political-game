# Core Game Mechanics & Frame Data Specification

## 1. Movement & Physics Engine
- **Tick Rate**: 60 Hz deterministic fixed-timestep simulation (`16.67ms` per frame).
- **Stage Dimensions**: `1200 x 620` logical world coordinates; ground plane at `Y = 510`, left boundary at `X = 80`, right boundary at `X = 1120`.
- **Movement Speeds**:
  - Forward Walk: `5.2 px/frame` (modified by fighter speed stat).
  - Backward Walk / Guard Retreat: `4.0 px/frame` (holding away from opponent automatically enables **Standing Block** against mid/high attacks).
  - Jump Impulse: `vy = -17.5 px/frame`, gravity `g = 0.82 px/frame²`.
  - Crouch: Reduces hurtbox height by `38%` and enables **Low Block** when holding Down-Back.
- **Auto-Facing**: Grounded fighters automatically orient toward the opponent's center X coordinate.

## 2. Combat System & Frame Data
Every attack transitions through three distinct phases: **Startup**, **Active**, and **Recovery**, plus **Hit-Stop (Freeze Frames)** on impact for tactile arcade weight.

| Attack | Input | Damage | Shakti Gain (Hit / Block) | Startup | Active | Recovery | Hitstun | Blockstun | Properties |
|--------|-------|--------|---------------------------|---------|--------|----------|---------|-----------|------------|
| **Jab (Punch)** | `J` | 6 | +8 / +3 | 4f | 4f | 7f | 12f | 8f | Chain-cancelable into Target Combos |
| **Kick** | `K` | 9 | +10 / +4 | 6f | 5f | 10f | 16f | 11f | Medium range poke |
| **Crouch Jab** | `↓ + J` | 5 | +6 / +2 | 4f | 3f | 6f | 11f | 7f | Fast low-profile check |
| **Low Sweep** | `↓ + K` | 11 | +12 / +5 | 8f | 5f | 15f | Knockdown | 12f | Hits **Low** (must crouch-block), causes hard knockdown |
| **Forward Strike** | `→ + J` | 13 | +14 / +6 | 9f | 6f | 13f | 20f | 14f | Advancing overhead/mid strike |
| **Forward Thrust Kick** | `→ + K` | 15 | +15 / +6 | 10f | 6f | 14f | Launch | 14f | High knockback |
| **Kursi Grab (Throw)** | `I` or `J+K` | 16 | +15 / 0 | 5f | 3f | 16f | Knockdown | Unblockable | Breaks standing/crouching guard at close range (`< 95px`) |
| **Shakti Super** | `L` or `Space` | 32 | Consumes 100 | 6f | 12f | 18f | Hard KD | 8 chip dmg | Requires 100% `SHAKTI` meter; triggers full-screen banner |
| **Budget Strike** | `B` | 28 | Consumes 100 Budget | 5f | 10f | 12f | Stagger | Unblockable | Special anti-Boss ledger drop mechanic |

## 3. Target Combo System
Verified from reference controls (`Combos: J,J,J · J,J,K · J,K,K · K,K · ↓J,J · ↓J,K`):
1. **Triple Jumla (`J → J → J`)**: Rapid 3-hit punch flurry ending with knockback.
2. **Manifesto Finisher (`J → J → K`)**: Two quick jabs into a heavy roundhouse kick.
3. **Rally Rush (`J → K → K`)**: Jab into double advancing kicks.
4. **Twin Boots (`K → K`)**: Two-hit heavy kick combo.
5. **Ground Level (`↓J → J`)**: Low check into rising punch.
6. **Chappal Sweep (`↓J → K`)**: Low jab into knockdown leg sweep.

## 4. The "Ahinsa" (Non-Violence) Boss Mechanic (`GTu026DgX-U`)
When facing the Boss fighter **SHANTI BAPU (MBAPU)**:
- **Standard Violence Penalty**: Shanti Bapu possesses an aura of moral resilience (`65%` damage reduction against standard reckless spam and counter-heals when struck during his meditation stance).
- **Ahinsa Peace Meter**: When the player practices **Ahinsa** (blocking, dodging, and holding peaceful poise without throwing violent punches/kicks for consecutive seconds), the **Ahinsa Harmony Bar** fills rapidly.
- **Peaceful Victory / Budget Counter**: Reaching `100% Ahinsa Harmony` (or triggering the `B` Budget Audit counter when full) humbles the Boss and secures an instant **Satyagraha Peace Victory**, unlocking the secret Boss achievement and bonus XP!
