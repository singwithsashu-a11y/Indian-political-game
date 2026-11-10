import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FighterConfig, StageConfig, BREAKING_TICKER_LINES } from './fighters';
import { FighterAvatar } from '../components/FighterAvatar';
import { sound } from './sound';

export type ActionState =
  | 'IDLE'
  | 'WALK'
  | 'JUMP'
  | 'CROUCH'
  | 'BLOCK'
  | 'PUNCH'
  | 'KICK'
  | 'SWEEP'
  | 'SPECIAL_PUNCH'
  | 'SPECIAL_KICK'
  | 'GRAB'
  | 'SUPER'
  | 'BUDGET_STRIKE'
  | 'HITSTUN'
  | 'KNOCKDOWN'
  | 'VICTORY';

interface FighterRuntime {
  config: FighterConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  hpTrail: number;
  shakti: number;
  facing: 1 | -1;
  action: ActionState;
  actionTimer: number;
  hitChecked: boolean;
  comboCount: number;
  comboTimer: number;
  inputChain: string[];
  lastChainTime: number;
  roundsWon: number;
}

interface HitSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface FloatingPopup {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
}

export interface MatchCompletionPayload {
  userWon: boolean;
  roundsWonP1: number;
  roundsWonP2: number;
  durationSec: number;
  maxCombo: number;
  damageDealt: number;
  ahinsaVictory: boolean;
  headline: string;
  subheadline: string;
  loserExcuse: string;
}

interface ArenaCanvasProps {
  p1Config: FighterConfig;
  p2Config: FighterConfig;
  stage: StageConfig;
  difficulty: 'easy' | 'normal' | 'hard';
  mode: 'cpu' | 'online';
  onlineSlot?: 'p1' | 'p2';
  wsRef?: React.MutableRefObject<WebSocket | null>;
  roundTimeConfigSec?: number;
  shaktiMultiplier?: number;
  ahinsaMultiplier?: number;
  onMatchEnd: (result: MatchCompletionPayload) => void;
  onQuitToSelect: () => void;
}

const STAGE_WIDTH = 1200;
const STAGE_HEIGHT = 620;
const GROUND_Y = 510;

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  p1Config,
  p2Config,
  stage,
  difficulty,
  mode,
  onlineSlot = 'p1',
  wsRef,
  roundTimeConfigSec = 60,
  shaktiMultiplier = 1,
  ahinsaMultiplier = 1,
  onMatchEnd,
  onQuitToSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  // HUD Reactive State
  const [hudState, setHudState] = useState({
    p1Hp: 100,
    p1Trail: 100,
    p2Hp: 100,
    p2Trail: 100,
    p1Shakti: 0,
    p2Shakti: 0,
    p1Wins: 0,
    p2Wins: 0,
    timer: roundTimeConfigSec,
    roundNum: 1,
    p1Combo: 0,
    p2Combo: 0,
    bannerText: 'ROUND 1 · FIGHT!',
    superBanner: '',
    ahinsaMeter: 0,
    budgetMeter: 0,
    godiLine: `${p1Config.name} enters the well of the House with full majority aura!`,
    factLine: `Frame data analysis underway for ${p1Config.name} vs ${p2Config.name}.`,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(!sound.muted);

  // Mutable Simulation State inside Ref for 60Hz Loop
  const simRef = useRef<{
    p1: FighterRuntime;
    p2: FighterRuntime;
    keys: Record<string, boolean>;
    touchStick: { left: boolean; right: boolean; up: boolean; down: boolean };
    roundTimerFrames: number;
    roundNumber: number;
    phase: 'INTRO' | 'PLAYING' | 'ROUND_END' | 'MATCH_DONE';
    phaseTimer: number;
    hitStopFrames: number;
    shakeFrames: number;
    sparks: HitSpark[];
    popups: FloatingPopup[];
    maxComboP1: number;
    totalDamageP1: number;
    matchStartTime: number;
    ahinsaProgress: number; // 0-100 for Shanti Bapu non-violence victory
    budgetProgress: number; // 0-100 for Nirmala's Budget counter
    violentStrikesOnBapu: number;
  }>({
    p1: {
      config: p1Config,
      x: 310,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      hp: 100,
      hpTrail: 100,
      shakti: 0,
      facing: 1,
      action: 'IDLE',
      actionTimer: 0,
      hitChecked: false,
      comboCount: 0,
      comboTimer: 0,
      inputChain: [],
      lastChainTime: 0,
      roundsWon: 0,
    },
    p2: {
      config: p2Config,
      x: 890,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      hp: 100,
      hpTrail: 100,
      shakti: 0,
      facing: -1,
      action: 'IDLE',
      actionTimer: 0,
      hitChecked: false,
      comboCount: 0,
      comboTimer: 0,
      inputChain: [],
      lastChainTime: 0,
      roundsWon: 0,
    },
    keys: {},
    touchStick: { left: false, right: false, up: false, down: false },
    roundTimerFrames: roundTimeConfigSec * 60,
    roundNumber: 1,
    phase: 'INTRO',
    phaseTimer: 75,
    hitStopFrames: 0,
    shakeFrames: 0,
    sparks: [],
    popups: [],
    maxComboP1: 1,
    totalDamageP1: 0,
    matchStartTime: Date.now(),
    ahinsaProgress: 0,
    budgetProgress: 25,
    violentStrikesOnBapu: 0,
  });

  // Load stage background image if present
  useEffect(() => {
    if (stage.bgImage) {
      const img = new Image();
      img.src = stage.bgImage;
      img.onload = () => {
        bgImgRef.current = img;
      };
    } else {
      bgImgRef.current = null;
    }
  }, [stage.bgImage]);

  // Spawn floating comic hit text
  const addPopup = useCallback((text: string, x: number, y: number, color = '#FF9933') => {
    simRef.current.popups.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      life: 42,
    });
  }, []);

  // Spawn hit sparks
  const addSparks = useCallback((x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spd = 3 + Math.random() * 7;
      simRef.current.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2,
        color,
        size: 3 + Math.random() * 4,
        life: 18 + Math.floor(Math.random() * 10),
      });
    }
  }, []);

  // Trigger an attack action for a fighter (with Target Combo & Directional Special resolution)
  const triggerAttack = useCallback(
    (fighterSlot: 'p1' | 'p2', btn: 'PUNCH' | 'KICK' | 'GRAB' | 'SUPER' | 'BUDGET') => {
      const sim = simRef.current;
      if (sim.phase !== 'PLAYING' || isPaused) return;
      const actor = fighterSlot === 'p1' ? sim.p1 : sim.p2;
      if (actor.action === 'HITSTUN' || actor.action === 'KNOCKDOWN' || actor.action === 'VICTORY') {
        return;
      }

      const now = performance.now();
      if (now - actor.lastChainTime > 550) {
        actor.inputChain = [];
      }
      actor.lastChainTime = now;

      const isCrouching =
        fighterSlot === 'p1'
          ? sim.keys['KeyS'] || sim.keys['ArrowDown'] || sim.touchStick.down
          : false;
      const isForward =
        fighterSlot === 'p1'
          ? (actor.facing === 1 && (sim.keys['KeyD'] || sim.keys['ArrowRight'] || sim.touchStick.right)) ||
            (actor.facing === -1 && (sim.keys['KeyA'] || sim.keys['ArrowLeft'] || sim.touchStick.left))
          : false;

      if (btn === 'BUDGET') {
        if (sim.budgetProgress >= 100) {
          sim.budgetProgress = 0;
          actor.action = 'BUDGET_STRIKE';
          actor.actionTimer = 28;
          actor.hitChecked = false;
          sound.playBudgetAudit();
          addPopup('📕 BUDGET PESH HAI! GST 28%!', actor.x, actor.y - 145, '#FACC15');
          setHudState((prev) => ({
            ...prev,
            superBanner: `📕 NIRMALA'S RED LEDGER AUDIT · AB LAGEGA TAX!`,
            godiLine: `HISTORIC BUDGET INTERVENTION! "Sabka hissa banta hai, Bapu!" Tax slab shockwave deployed!`,
          }));
          setTimeout(() => setHudState((prev) => ({ ...prev, superBanner: '' })), 1800);
        }
        return;
      }

      if (btn === 'SUPER') {
        if (actor.shakti >= 100) {
          actor.shakti = 0;
          actor.action = 'SUPER';
          actor.actionTimer = 34;
          actor.hitChecked = false;
          sound.playSuper(actor.config.id);
          addPopup(`${actor.config.superName}!`, actor.x, actor.y - 150, actor.config.accent);
          setHudState((prev) => ({
            ...prev,
            superBanner: `${actor.config.name}: ${actor.config.superName}!`,
            godiLine: `WAAH KYA SCENE HAI! ${actor.config.name} unleashes ${actor.config.superName}!`,
          }));
          setTimeout(() => setHudState((prev) => ({ ...prev, superBanner: '' })), 1800);
        }
        return;
      }

      // Prevent interrupting heavy specials mid-frame unless chaining normal combos
      const canChainCancel =
        actor.action === 'IDLE' ||
        actor.action === 'WALK' ||
        actor.action === 'CROUCH' ||
        (actor.action === 'PUNCH' && actor.actionTimer < 9) ||
        (actor.action === 'KICK' && actor.actionTimer < 9);

      if (!canChainCancel) return;

      if (btn === 'GRAB') {
        actor.action = 'GRAB';
        actor.actionTimer = 22;
        actor.hitChecked = false;
        actor.inputChain = [];
        return;
      }

      if (btn === 'PUNCH') {
        actor.inputChain.push(isCrouching ? 'dJ' : 'J');
        if (isForward && actor.inputChain.length === 1) {
          actor.action = 'SPECIAL_PUNCH';
          actor.actionTimer = 24;
          actor.vx = actor.facing * 7.5;
        } else {
          actor.action = 'PUNCH';
          actor.actionTimer = 16;
        }
        actor.hitChecked = false;
      } else if (btn === 'KICK') {
        actor.inputChain.push(isCrouching ? 'dK' : 'K');
        if (isCrouching) {
          actor.action = 'SWEEP';
          actor.actionTimer = 24;
        } else if (isForward && actor.inputChain.length === 1) {
          actor.action = 'SPECIAL_KICK';
          actor.actionTimer = 26;
          actor.vx = actor.facing * 8.5;
        } else {
          actor.action = 'KICK';
          actor.actionTimer = 20;
        }
        actor.hitChecked = false;
      }

      if (actor.inputChain.length > 3) {
        actor.inputChain.shift();
      }
    },
    [isPaused]
  );

  // Keyboard Listeners + WebSocket Sync Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      simRef.current.keys[e.code] = true;

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }
      if (e.code === 'KeyM') {
        sound.musicOn = !sound.musicOn;
        if (sound.musicOn) sound.startArenaBgm();
        else sound.stopArenaBgm();
        return;
      }
      if (e.code === 'KeyN') {
        sound.muted = !sound.muted;
        setSoundOn(!sound.muted);
        if (sound.muted) sound.stopArenaBgm();
        return;
      }

      const controlledSlot = mode === 'online' ? onlineSlot : 'p1';
      if (e.code === 'KeyJ') triggerAttack(controlledSlot, 'PUNCH');
      else if (e.code === 'KeyK') triggerAttack(controlledSlot, 'KICK');
      else if (e.code === 'KeyI') triggerAttack(controlledSlot, 'GRAB');
      else if (e.code === 'KeyL' || e.code === 'Space') triggerAttack(controlledSlot, 'SUPER');
      else if (e.code === 'KeyB') triggerAttack(controlledSlot, 'BUDGET');
      else if (e.code === 'KeyV') {
        const myActor = controlledSlot === 'p1' ? simRef.current.p1 : simRef.current.p2;
        sound.playFighterMemeClip(myActor.config.id);
        addPopup('WAAH KYA SCENE HAI!', myActor.x, myActor.y - 140, myActor.config.accent);
      } else if (e.code === 'KeyH') {
        const kind = stage.id === 'road' ? 'sabzi' : stage.id === 'jantar' ? 'sutli' : 'cow';
        sound.playStageHazard(kind);
        addPopup(
          kind === 'sabzi'
            ? '⚠ SABZI WALA: ALOO LE LO!'
            : kind === 'cow'
            ? '⚠ COW CROSSING: SAB RUK JAO!'
            : '⚠ SUTLI BOMB! 🧨',
          STAGE_WIDTH / 2,
          GROUND_Y - 160,
          '#FACC15'
        );
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      simRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    sound.startArenaBgm();
    sound.playRoundStart(1, Boolean(p2Config.isBoss));

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      sound.stopArenaBgm();
    };
  }, [mode, onlineSlot, triggerAttack]);

  // Listen for incoming WebSocket opponent state when in Online Mode
  useEffect(() => {
    if (mode !== 'online' || !wsRef?.current) return;
    const ws = wsRef.current;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'game:sync') {
          const data = msg.payload;
          const sim = simRef.current;
          const remoteFighter = onlineSlot === 'p1' ? sim.p2 : sim.p1;
          remoteFighter.x = Number(data.x ?? remoteFighter.x);
          remoteFighter.y = Number(data.y ?? remoteFighter.y);
          remoteFighter.vx = Number(data.vx ?? 0);
          remoteFighter.vy = Number(data.vy ?? 0);
          remoteFighter.hp = Number(data.hp ?? remoteFighter.hp);
          remoteFighter.shakti = Number(data.shakti ?? remoteFighter.shakti);
          remoteFighter.action = (data.action as ActionState) || 'IDLE';
          remoteFighter.facing = data.facing === -1 ? -1 : 1;
        }
      } catch {
        // ignore malformed packets
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [mode, onlineSlot, wsRef]);

  // Main 60Hz Deterministic Game Loop
  useEffect(() => {
    let animId: number;
    let frameCounter = 0;

    const resetRoundPositions = (nextRound: number) => {
      const sim = simRef.current;
      sim.roundNumber = nextRound;
      sim.roundTimerFrames = roundTimeConfigSec * 60;
      sim.phase = 'INTRO';
      sim.phaseTimer = 70;
      sim.ahinsaProgress = 0;
      sim.budgetProgress = Math.min(100, sim.budgetProgress + 35);

      sim.p1.x = 310;
      sim.p1.y = GROUND_Y;
      sim.p1.vx = 0;
      sim.p1.vy = 0;
      sim.p1.hp = 100;
      sim.p1.hpTrail = 100;
      sim.p1.action = 'IDLE';
      sim.p1.actionTimer = 0;
      sim.p1.comboCount = 0;

      sim.p2.x = 890;
      sim.p2.y = GROUND_Y;
      sim.p2.vx = 0;
      sim.p2.vy = 0;
      sim.p2.hp = 100;
      sim.p2.hpTrail = 100;
      sim.p2.action = 'IDLE';
      sim.p2.actionTimer = 0;
      sim.p2.comboCount = 0;

      setHudState((prev) => ({
        ...prev,
        roundNum: nextRound,
        bannerText: `ROUND ${nextRound} · FIGHT!`,
      }));
    };

    const resolveHitCheck = (attacker: FighterRuntime, defender: FighterRuntime, isP1Attacker: boolean) => {
      const sim = simRef.current;
      if (attacker.hitChecked) return;

      // Active frames window
      if (attacker.actionTimer > 16 || attacker.actionTimer < 4) return;

      const dist = Math.abs(attacker.x - defender.x);
      const verticalDist = Math.abs(attacker.y - defender.y);

      let reach = 135;
      let damage = 7;
      let shaktiGain = 10 * shaktiMultiplier;
      let heavy = false;
      let isLowAttack = false;
      let unblockable = false;

      const chainStr = attacker.inputChain.join(',');

      if (attacker.action === 'PUNCH') {
        reach = 130;
        damage = chainStr === 'J,J,J' ? 11 : 6;
        heavy = chainStr === 'J,J,J';
      } else if (attacker.action === 'KICK') {
        reach = 152;
        damage = chainStr === 'J,J,K' || chainStr === 'J,K,K' || chainStr === 'K,K' ? 13 : 9;
        heavy = true;
      } else if (attacker.action === 'SWEEP') {
        reach = 155;
        damage = 11;
        heavy = true;
        isLowAttack = true;
      } else if (attacker.action === 'SPECIAL_PUNCH') {
        reach = 165;
        damage = 14;
        heavy = true;
        shaktiGain = 15 * shaktiMultiplier;
      } else if (attacker.action === 'SPECIAL_KICK') {
        reach = 175;
        damage = 15;
        heavy = true;
        shaktiGain = 16 * shaktiMultiplier;
      } else if (attacker.action === 'GRAB') {
        reach = 108;
        damage = 16;
        heavy = true;
        unblockable = true;
      } else if (attacker.action === 'SUPER') {
        reach = 360;
        damage = 30;
        heavy = true;
        shaktiGain = 0;
      } else if (attacker.action === 'BUDGET_STRIKE') {
        reach = 480;
        damage = 38;
        heavy = true;
        unblockable = true;
        shaktiGain = 0;
      } else {
        return;
      }

      // Scale by fighter power / defense stats
      damage = Math.round(damage * (0.85 + attacker.config.stats.power * 0.03));

      if (dist <= reach && verticalDist < 120) {
        attacker.hitChecked = true;

        // Special Boss Logic (`GTu026DgX-U`): Shanti Bapu (MBAPU) moral reflection against normal violence
        if (defender.config.isBoss && attacker.action !== 'BUDGET_STRIKE') {
          sim.violentStrikesOnBapu += 1;
          sim.ahinsaProgress = Math.max(0, sim.ahinsaProgress - 18);
          sim.budgetProgress = Math.min(100, sim.budgetProgress + 14);
          // Moral aura reduces violent damage by 70% and heals Bapu slightly if spammed!
          damage = Math.max(2, Math.floor(damage * 0.28));
          addPopup('AHINSA SHIELD! HOLD PEACE!', defender.x, defender.y - 135, '#FFD700');
          setHudState((prev) => ({
            ...prev,
            factLine: `Violent strikes bounce off Shanti Bapu's aura! Stop attacking to build Ahinsa Harmony or press B when Budget is full!`,
          }));
        }

        // Check if defender is holding back to Block
        const isDefenderBlocking =
          !unblockable &&
          defender.action === 'BLOCK' &&
          (!isLowAttack || defender.y >= GROUND_Y);

        if (isDefenderBlocking) {
          const chip = attacker.action === 'SUPER' ? 6 : 2;
          defender.hp = Math.max(1, defender.hp - chip);
          defender.vx = attacker.facing * 5;
          attacker.shakti = Math.min(100, attacker.shakti + shaktiGain * 0.4);
          defender.shakti = Math.min(100, defender.shakti + 6 * shaktiMultiplier);
          sound.playBlock();
          addSparks((attacker.x + defender.x) / 2, defender.y - 75, '#38BDF8', 7);
          addPopup('GUARDED', defender.x, defender.y - 115, '#38BDF8');
        } else {
          // Clean Hit!
          defender.hp = Math.max(0, defender.hp - damage);
          attacker.shakti = Math.min(100, attacker.shakti + shaktiGain);
          defender.shakti = Math.min(100, defender.shakti + 5 * shaktiMultiplier);
          attacker.comboCount += 1;
          attacker.comboTimer = 75;

          if (isP1Attacker) {
            sim.totalDamageP1 += damage;
            if (attacker.comboCount > sim.maxComboP1) {
              sim.maxComboP1 = attacker.comboCount;
            }
            sim.budgetProgress = Math.min(100, sim.budgetProgress + 9);
          }

          const isKnockdownMove =
            attacker.action === 'SWEEP' ||
            attacker.action === 'SUPER' ||
            attacker.action === 'GRAB' ||
            attacker.action === 'BUDGET_STRIKE' ||
            chainStr === 'J,J,J' ||
            chainStr === 'J,J,K';

          defender.action = isKnockdownMove ? 'KNOCKDOWN' : 'HITSTUN';
          defender.actionTimer = isKnockdownMove ? 32 : 16;
          defender.vx = attacker.facing * (heavy ? 11 : 6.5);
          if (isKnockdownMove) {
            defender.vy = -8.5;
          }

          sim.hitStopFrames = heavy ? 5 : 3;
          sim.shakeFrames = heavy ? 10 : 5;
          sound.playHit(heavy);
          addSparks((attacker.x + defender.x) / 2, defender.y - 80, attacker.config.accent, heavy ? 16 : 10);

          const cryPool = attacker.config.quotes.hitCry;
          const cry =
            attacker.comboCount >= 3
              ? `${attacker.comboCount}x COMBO · ${cryPool[attacker.comboCount % cryPool.length]}`
              : cryPool[Math.floor(Math.random() * cryPool.length)];
          addPopup(cry, defender.x, defender.y - 125, attacker.config.accent);

          setHudState((prev) => ({
            ...prev,
            godiLine: `${attacker.config.name} lands a ${damage} DMG ${
              attacker.action === 'SUPER' ? 'SUPER MASTERSTROKE' : 'strike'
            }! Crowd goes wild!`,
            factLine:
              attacker.comboCount >= 2
                ? `Verified ${attacker.comboCount}-Hit Target Combo (${chainStr || attacker.action})!`
                : `Clean frame punish by ${attacker.config.name} (${defender.hp}% HP left).`,
          }));
        }
      }
    };

    const updateFighterPhysics = (f: FighterRuntime, opponent: FighterRuntime, isControlled: boolean) => {
      const sim = simRef.current;

      // Auto-face opponent when on ground and not mid-attack
      if (f.y >= GROUND_Y && (f.action === 'IDLE' || f.action === 'WALK' || f.action === 'CROUCH' || f.action === 'BLOCK')) {
        f.facing = f.x < opponent.x ? 1 : -1;
      }

      if (f.comboTimer > 0) {
        f.comboTimer--;
        if (f.comboTimer === 0) f.comboCount = 0;
      }

      if (f.hpTrail > f.hp) {
        f.hpTrail = Math.max(f.hp, f.hpTrail - 0.35);
      }

      if (f.actionTimer > 0) {
        f.actionTimer--;
        if (f.actionTimer === 0 && f.action !== 'VICTORY') {
          f.action = 'IDLE';
        }
      }

      // Movement Input Handling for local player
      if (isControlled && sim.phase === 'PLAYING' && f.action !== 'HITSTUN' && f.action !== 'KNOCKDOWN') {
        const moveLeft = sim.keys['KeyA'] || sim.keys['ArrowLeft'] || sim.touchStick.left;
        const moveRight = sim.keys['KeyD'] || sim.keys['ArrowRight'] || sim.touchStick.right;
        const jumpPressed = sim.keys['KeyW'] || sim.keys['ArrowUp'] || sim.touchStick.up;
        const crouchPressed = sim.keys['KeyS'] || sim.keys['ArrowDown'] || sim.touchStick.down;

        const isAttacking = [
          'PUNCH',
          'KICK',
          'SWEEP',
          'SPECIAL_PUNCH',
          'SPECIAL_KICK',
          'GRAB',
          'SUPER',
          'BUDGET_STRIKE',
        ].includes(f.action);

        if (!isAttacking) {
          const walkSpeed = 4.2 + f.config.stats.speed * 0.25;
          const holdingBack = (f.facing === 1 && moveLeft) || (f.facing === -1 && moveRight);

          if (jumpPressed && f.y >= GROUND_Y) {
            f.vy = -17.2;
            f.action = 'JUMP';
            sound.playJump();
          } else if (crouchPressed && f.y >= GROUND_Y) {
            f.vx *= 0.6;
            f.action = holdingBack ? 'BLOCK' : 'CROUCH';
          } else if (moveLeft) {
            f.vx = -walkSpeed * (holdingBack ? 0.78 : 1);
            f.action = holdingBack && Math.abs(f.x - opponent.x) < 280 ? 'BLOCK' : 'WALK';
          } else if (moveRight) {
            f.vx = walkSpeed * (holdingBack ? 0.78 : 1);
            f.action = holdingBack && Math.abs(f.x - opponent.x) < 280 ? 'BLOCK' : 'WALK';
          } else if (f.y >= GROUND_Y) {
            f.vx *= 0.7;
            f.action = 'IDLE';
          }
        }
      }

      // Gravity & Velocity integration
      f.x += f.vx;
      f.y += f.vy;

      if (f.y < GROUND_Y) {
        f.vy += 0.85;
      } else {
        f.y = GROUND_Y;
        f.vy = 0;
      }

      // Friction
      if (f.y >= GROUND_Y && f.action !== 'WALK') {
        f.vx *= 0.78;
      }

      // Stage bounds clamping
      f.x = Math.max(85, Math.min(STAGE_WIDTH - 85, f.x));
    };

    const updateCpuAi = () => {
      const sim = simRef.current;
      if (mode !== 'cpu' || sim.phase !== 'PLAYING') return;
      const cpu = sim.p2;
      const player = sim.p1;

      if (cpu.action === 'HITSTUN' || cpu.action === 'KNOCKDOWN' || cpu.action === 'VICTORY') return;

      const dist = Math.abs(cpu.x - player.x);
      const dirToPlayer = player.x > cpu.x ? 1 : -1;
      const aggr = difficulty === 'hard' ? 0.085 : difficulty === 'normal' ? 0.05 : 0.026;

      // Special Ahinsa Boss Mechanic (`GTu026DgX-U`):
      // If P2 is Shanti Bapu and P1 is NOT attacking (practicing Ahinsa), Ahinsa Harmony builds up!
      if (cpu.config.isBoss) {
        const playerIsPeaceful = !['PUNCH', 'KICK', 'SWEEP', 'SPECIAL_PUNCH', 'SPECIAL_KICK', 'GRAB', 'SUPER'].includes(
          player.action
        );
        if (playerIsPeaceful) {
          sim.ahinsaProgress = Math.min(100, sim.ahinsaProgress + 0.22 * ahinsaMultiplier);
          if (frameCounter % 90 === 0 && sim.ahinsaProgress < 100) {
            addPopup(`AHINSA PEACE: ${Math.floor(sim.ahinsaProgress)}%`, player.x, player.y - 140, '#4ADE80');
          }
        }
      }

      const isAttacking = [
        'PUNCH',
        'KICK',
        'SWEEP',
        'SPECIAL_PUNCH',
        'SPECIAL_KICK',
        'GRAB',
        'SUPER',
      ].includes(cpu.action);

      if (!isAttacking) {
        if (dist > 145) {
          cpu.vx = dirToPlayer * (3.6 + cpu.config.stats.speed * 0.2);
          cpu.action = 'WALK';
        } else {
          cpu.vx *= 0.6;
          if (Math.random() < aggr) {
            if (cpu.shakti >= 100 && Math.random() < 0.5) {
              triggerAttack('p2', 'SUPER');
            } else {
              const roll = Math.random();
              if (roll < 0.42) triggerAttack('p2', 'PUNCH');
              else if (roll < 0.78) triggerAttack('p2', 'KICK');
              else triggerAttack('p2', 'GRAB');
            }
          } else if (
            ['PUNCH', 'KICK', 'SPECIAL_PUNCH', 'SPECIAL_KICK'].includes(player.action) &&
            Math.random() < (difficulty === 'hard' ? 0.65 : 0.35)
          ) {
            cpu.action = 'BLOCK';
            cpu.actionTimer = 14;
          } else {
            cpu.action = 'IDLE';
          }
        }
      }
    };

    const drawFighterOnCanvas = (ctx: CanvasRenderingContext2D, f: FighterRuntime, isP1: boolean) => {
      ctx.save();
      ctx.translate(f.x, f.y);

      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 46, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boss Golden Satyagraha Mandala Aura
      if (f.config.isBoss) {
        ctx.save();
        ctx.translate(0, -75);
        ctx.rotate(frameCounter * 0.02);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 68, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Shakti Full Aura Flame
      if (f.shakti >= 100) {
        ctx.save();
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, -70, 62 + Math.sin(frameCounter * 0.25) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.scale(f.facing, 1);

      const crouchOffset = f.action === 'CROUCH' ? 28 : 0;
      const knockAngle = f.action === 'KNOCKDOWN' ? -0.85 : f.action === 'HITSTUN' ? -0.22 : 0;
      ctx.rotate(knockAngle);

      const breath = Math.sin(frameCounter * 0.12) * 2.5;
      const walkSwing = f.action === 'WALK' ? Math.sin(frameCounter * 0.32) * 14 : 0;

      // Legs
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';

      // Back Leg
      ctx.beginPath();
      ctx.moveTo(-10, -48 + crouchOffset);
      ctx.lineTo(-16 - walkSwing, -4);
      ctx.stroke();

      // Front Leg (extends on KICK / SWEEP / SPECIAL_KICK)
      const kickExtendX =
        f.action === 'KICK' || f.action === 'SPECIAL_KICK'
          ? 78
          : f.action === 'SWEEP'
          ? 84
          : 16 + walkSwing;
      const kickExtendY =
        f.action === 'KICK' || f.action === 'SPECIAL_KICK'
          ? -62
          : f.action === 'SWEEP'
          ? -8
          : -4;

      ctx.beginPath();
      ctx.moveTo(10, -48 + crouchOffset);
      ctx.lineTo(kickExtendX, kickExtendY);
      ctx.stroke();

      // Torso (Kurta / Jacket in Fighter Accent Color)
      ctx.fillStyle = f.config.accent;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-26, -112 + crouchOffset + breath, 52, 68 - crouchOffset * 0.5, 12);
      ctx.fill();
      ctx.stroke();

      // Secondary Scarf / Vest Trim
      ctx.fillStyle = f.config.secondaryColor;
      ctx.beginPath();
      ctx.roundRect(-10, -110 + crouchOffset + breath, 20, 44, 4);
      ctx.fill();

      // Punch / Grab / Super Arm Extension
      const punchExtendX =
        f.action === 'PUNCH' || f.action === 'SPECIAL_PUNCH'
          ? 82
          : f.action === 'GRAB'
          ? 68
          : f.action === 'SUPER' || f.action === 'BUDGET_STRIKE'
          ? 92
          : 26;
      const punchExtendY =
        f.action === 'PUNCH' || f.action === 'SPECIAL_PUNCH' || f.action === 'SUPER'
          ? -92 + crouchOffset
          : -76 + crouchOffset + breath;

      ctx.strokeStyle = f.config.skinTone;
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(14, -96 + crouchOffset + breath);
      ctx.lineTo(punchExtendX, punchExtendY);
      ctx.stroke();

      // Boxing Glove / Fist Highlight
      ctx.fillStyle = f.action === 'SUPER' ? '#22D3EE' : f.config.accent;
      ctx.beginPath();
      ctx.arc(punchExtendX, punchExtendY, f.action === 'PUNCH' || f.action === 'SPECIAL_PUNCH' ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Super Beam / Budget Red Ledger Visual Projectile
      if (f.action === 'SUPER' && f.actionTimer > 10) {
        const grad = ctx.createLinearGradient(70, -90, 360, -90);
        grad.addColorStop(0, '#22D3EE');
        grad.addColorStop(0.5, f.config.accent);
        grad.addColorStop(1, 'rgba(255, 153, 51, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(70, -118, 290, 52, 24);
        ctx.fill();
      }

      if (f.action === 'BUDGET_STRIKE' && f.actionTimer > 8) {
        ctx.fillStyle = '#DC2626';
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(85, -135, 68, 82, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 14px Oswald, sans-serif';
        ctx.fillText('BUDGET', 96, -90);
      }

      // Block Shield Barrier
      if (f.action === 'BLOCK') {
        ctx.strokeStyle = '#38BDF8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(24, -75 + crouchOffset, 48, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.fill();
        ctx.stroke();
      }

      // Head
      ctx.fillStyle = f.config.skinTone;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -136 + crouchOffset + breath, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes & Expression
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(9, -140 + crouchOffset + breath, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Spectacles for MitraMan / Shanti Bapu / Sutti Babu
      if (['glasses_beard', 'gandhi_sage', 'files_glasses'].includes(f.config.headgear)) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(9, -140 + crouchOffset + breath, 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // White Beard for MitraMan / Shanti Bapu
      if (f.config.headgear === 'glasses_beard' || f.config.headgear === 'gandhi_sage') {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(6, -124 + crouchOffset + breath, 13, 0, Math.PI);
        ctx.fill();
      }

      ctx.restore();

      // Player Tag Indicator above Fighter (`1P` vs `CPU`/`2P`)
      ctx.save();
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isP1 ? '#FF9933' : '#38BDF8';
      ctx.fillText(isP1 ? '▼ 1P' : mode === 'online' ? '▼ 2P' : '▼ CPU', f.x, f.y - 174);
      ctx.restore();
    };

    const tick = () => {
      frameCounter++;
      const sim = simRef.current;

      if (!isPaused) {
        // Hit-stop freeze frames for impact feel
        if (sim.hitStopFrames > 0) {
          sim.hitStopFrames--;
        } else {
          if (sim.phase === 'INTRO') {
            sim.phaseTimer--;
            if (sim.phaseTimer <= 0) {
              sim.phase = 'PLAYING';
              setHudState((prev) => ({ ...prev, bannerText: '' }));
            }
          } else if (sim.phase === 'PLAYING') {
            sim.roundTimerFrames = Math.max(0, sim.roundTimerFrames - 1);

            const isP1Controlled = mode === 'cpu' || onlineSlot === 'p1';
            const isP2Controlled = mode === 'online' && onlineSlot === 'p2';

            updateFighterPhysics(sim.p1, sim.p2, isP1Controlled);
            updateFighterPhysics(sim.p2, sim.p1, isP2Controlled);
            updateCpuAi();

            resolveHitCheck(sim.p1, sim.p2, true);
            resolveHitCheck(sim.p2, sim.p1, false);

            // Emit state to WebSocket server if in Online mode
            if (mode === 'online' && wsRef?.current && frameCounter % 2 === 0) {
              const myFighter = onlineSlot === 'p1' ? sim.p1 : sim.p2;
              if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    type: 'game:state',
                    payload: {
                      x: Math.round(myFighter.x),
                      y: Math.round(myFighter.y),
                      vx: myFighter.vx,
                      vy: myFighter.vy,
                      hp: myFighter.hp,
                      shakti: myFighter.shakti,
                      action: myFighter.action,
                      facing: myFighter.facing,
                    },
                  })
                );
              }
            }

            // Check Ahinsa Non-Violence Victory Condition against Boss (`GTu026DgX-U`)
            const ahinsaWon = Boolean(sim.p2.config.isBoss && sim.ahinsaProgress >= 100);

            // Check Round End Conditions (KO, Time Over, or Ahinsa Victory)
            if (sim.p1.hp <= 0 || sim.p2.hp <= 0 || sim.roundTimerFrames <= 0 || ahinsaWon) {
              sim.phase = 'ROUND_END';
              sim.phaseTimer = 110;

              let p1WonRound = false;
              if (ahinsaWon) {
                p1WonRound = true;
                sim.p1.roundsWon = 2; // Instant Satyagraha Match Victory!
              } else if (sim.p2.hp <= 0) {
                p1WonRound = true;
                sim.p1.roundsWon += 1;
              } else if (sim.p1.hp <= 0) {
                p1WonRound = false;
                sim.p2.roundsWon += 1;
              } else {
                // Time Over: higher HP wins
                if (sim.p1.hp >= sim.p2.hp) {
                  p1WonRound = true;
                  sim.p1.roundsWon += 1;
                } else {
                  p1WonRound = false;
                  sim.p2.roundsWon += 1;
                }
              }

              const roundWinnerConfig = p1WonRound ? sim.p1.config : sim.p2.config;
              sound.playKO(roundWinnerConfig.id, p1WonRound);

              sim.p1.action = p1WonRound ? 'VICTORY' : 'KNOCKDOWN';
              sim.p2.action = p1WonRound ? 'KNOCKDOWN' : 'VICTORY';

              const bannerMsg = ahinsaWon
                ? '🕊️ AHINSA VICTORY! SATYAGRAHA PREVAILS!'
                : sim.roundTimerFrames <= 0
                ? 'TIME OVER!'
                : 'K.O. · KURSI SHAKEUP!';

              setHudState((prev) => ({
                ...prev,
                p1Wins: sim.p1.roundsWon,
                p2Wins: sim.p2.roundsWon,
                bannerText: bannerMsg,
              }));
            }
          } else if (sim.phase === 'ROUND_END') {
            sim.phaseTimer--;
            if (sim.phaseTimer <= 0) {
              const ahinsaWon = Boolean(sim.p2.config.isBoss && sim.ahinsaProgress >= 100);
              if (sim.p1.roundsWon >= 2 || sim.p2.roundsWon >= 2 || ahinsaWon) {
                sim.phase = 'MATCH_DONE';
                const userWon = sim.p1.roundsWon >= sim.p2.roundsWon || ahinsaWon;
                const winner = userWon ? sim.p1.config : sim.p2.config;
                const loser = userWon ? sim.p2.config : sim.p1.config;
                const durationSec = Math.max(5, Math.round((Date.now() - sim.matchStartTime) / 1000));

                const headline = ahinsaWon
                  ? `${sim.p1.config.name} HUMBLES SHANTI BAPU WITH 100% AHINSA PEACE!`
                  : `${winner.name} SWEEPS ${stage.name} (${sim.p1.roundsWon}-${sim.p2.roundsWon})!`;

                onMatchEnd({
                  userWon,
                  roundsWonP1: sim.p1.roundsWon,
                  roundsWonP2: sim.p2.roundsWon,
                  durationSec,
                  maxCombo: sim.maxComboP1,
                  damageDealt: sim.totalDamageP1,
                  ahinsaVictory: ahinsaWon,
                  headline,
                  subheadline: winner.quotes.win,
                  loserExcuse: loser.quotes.excuse,
                });
              } else {
                resetRoundPositions(sim.roundNumber + 1);
              }
            }
          }
        }

        // Update Sparks & Popups
        sim.sparks = sim.sparks
          .map((s) => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, vy: s.vy + 0.35, life: s.life - 1 }))
          .filter((s) => s.life > 0);

        sim.popups = sim.popups
          .map((p) => ({ ...p, y: p.y - 1.2, life: p.life - 1 }))
          .filter((p) => p.life > 0);

        if (sim.shakeFrames > 0) sim.shakeFrames--;

        // Sync HUD every 4 frames for crisp 60fps performance
        if (frameCounter % 4 === 0) {
          setHudState((prev) => ({
            ...prev,
            p1Hp: Math.ceil(sim.p1.hp),
            p1Trail: Math.ceil(sim.p1.hpTrail),
            p2Hp: Math.ceil(sim.p2.hp),
            p2Trail: Math.ceil(sim.p2.hpTrail),
            p1Shakti: Math.floor(sim.p1.shakti),
            p2Shakti: Math.floor(sim.p2.shakti),
            p1Wins: sim.p1.roundsWon,
            p2Wins: sim.p2.roundsWon,
            timer: Math.ceil(sim.roundTimerFrames / 60),
            p1Combo: sim.p1.comboCount,
            p2Combo: sim.p2.comboCount,
            ahinsaMeter: Math.floor(sim.ahinsaProgress),
            budgetMeter: Math.floor(sim.budgetProgress),
          }));
        }
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          if (sim.shakeFrames > 0) {
            ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10);
          }

          // Background Sky / Arena Image
          if (bgImgRef.current) {
            ctx.drawImage(bgImgRef.current, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
            ctx.fillStyle = 'rgba(18, 10, 6, 0.35)';
            ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
          } else {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
            skyGrad.addColorStop(0, stage.skyTop);
            skyGrad.addColorStop(1, stage.skyBottom);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, STAGE_WIDTH, GROUND_Y);

            // Architectural Pillars / Stage Backdrop Details
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            for (let x = 120; x < STAGE_WIDTH; x += 240) {
              ctx.fillRect(x - 28, 70, 56, GROUND_Y - 70);
            }
          }

          // Stage Floor Carpet
          ctx.fillStyle = stage.floorColor;
          ctx.fillRect(0, GROUND_Y, STAGE_WIDTH, STAGE_HEIGHT - GROUND_Y);
          ctx.fillStyle = stage.trimColor;
          ctx.fillRect(0, GROUND_Y, STAGE_WIDTH, 6);

          // Draw Both Fighters
          drawFighterOnCanvas(ctx, sim.p1, true);
          drawFighterOnCanvas(ctx, sim.p2, false);

          // Draw Particle Sparks
          sim.sparks.forEach((s) => {
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Floating Comic Popups
          sim.popups.forEach((p) => {
            ctx.save();
            ctx.font = 'bold 24px Oswald, sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 4;
            ctx.strokeText(p.text, p.x, p.y);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
          });

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [
    ahinsaMultiplier,
    difficulty,
    isPaused,
    mode,
    onMatchEnd,
    onlineSlot,
    roundTimeConfigSec,
    shaktiMultiplier,
    stage,
    triggerAttack,
    wsRef,
    addPopup,
    addSparks,
  ]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[560px] bg-[#120A06] overflow-hidden select-none flex flex-col justify-between">
      {/* Main 2.5D Fighting Game Canvas */}
      <canvas
        ref={canvasRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top In-Fight HUD (`#hud`) */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 pt-3">
        <div className="grid grid-cols-12 items-center gap-3 bg-[#120A06]/85 backdrop-blur-md border border-white/15 rounded-xl p-3">
          {/* Player 1 Side */}
          <div className="col-span-5 flex items-center gap-3">
            <FighterAvatar fighter={p1Config} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-lg font-bold tracking-wide text-white truncate">
                  {p1Config.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-amber-400">
                    HP {hudState.p1Hp}%
                  </span>
                  {[0, 1].map((idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-sm border ${
                        hudState.p1Wins > idx
                          ? 'bg-[#FF9933] border-amber-300'
                          : 'bg-white/10 border-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Health Bar with Trail */}
              <div className="relative w-full h-4 bg-black/70 rounded overflow-hidden border border-white/20">
                <div
                  className="absolute inset-y-0 left-0 bg-rose-600/80 transition-all duration-150"
                  style={{ width: `${hudState.p1Trail}%` }}
                />
                <div
                  className="
                    absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF9933] to-amber-400
                  "
                  style={{ width: `${hudState.p1Hp}%` }}
                />
              </div>
              {/* Shakti Super Bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-cyan-300">
                  SHAKTI {hudState.p1Shakti}%
                </span>
                <div className="flex-1 h-2 bg-black/70 rounded overflow-hidden border border-cyan-500/30">
                  <div
                    className={`h-full transition-all duration-75 ${
                      hudState.p1Shakti >= 100 ? 'bg-cyan-400' : 'bg-cyan-600'
                    }`}
                    style={{ width: `${hudState.p1Shakti}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center Round Clock & Pause Control */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-amber-300/80">
              ROUND {hudState.roundNum}
            </span>
            <div className="font-mono text-3xl md:text-4xl font-bold text-white tabular-nums leading-none my-0.5">
              {String(hudState.timer).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="px-2.5 py-0.5 text-xs font-mono bg-white/10 hover:bg-white/20 text-white rounded border border-white/15 cursor-pointer whitespace-nowrap"
              >
                II PAUSE
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.muted = !sound.muted;
                  setSoundOn(!sound.muted);
                }}
                className="px-2 py-0.5 text-xs font-mono bg-white/10 hover:bg-white/20 text-white rounded border border-white/15 cursor-pointer"
              >
                {soundOn ? 'SFX ON' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Player 2 / CPU / Boss Side */}
          <div className="col-span-5 flex flex-row-reverse items-center gap-3">
            <FighterAvatar fighter={p2Config} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {[0, 1].map((idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-sm border ${
                        hudState.p2Wins > idx
                          ? 'bg-cyan-400 border-cyan-200'
                          : 'bg-white/10 border-white/25'
                      }`}
                    />
                  ))}
                  <span className="font-mono text-xs text-cyan-300">
                    HP {hudState.p2Hp}%
                  </span>
                </div>
                <span className="font-display text-lg font-bold tracking-wide text-white truncate">
                  {p2Config.name}
                </span>
              </div>
              {/* Health Bar */}
              <div className="relative w-full h-4 bg-black/70 rounded overflow-hidden border border-white/20">
                <div
                  className="absolute inset-y-0 right-0 bg-rose-600/80 transition-all duration-150"
                  style={{ width: `${hudState.p2Trail}%` }}
                />
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-400"
                  style={{ width: `${hudState.p2Hp}%` }}
                />
              </div>
              {/* Shakti Super Bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-black/70 rounded overflow-hidden border border-cyan-500/30">
                  <div
                    className={`h-full ml-auto transition-all duration-75 ${
                      hudState.p2Shakti >= 100 ? 'bg-cyan-400' : 'bg-cyan-600'
                    }`}
                    style={{ width: `${hudState.p2Shakti}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold text-cyan-300">
                  {hudState.p2Shakti}% SHAKTI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Boss Ahinsa & Nirmala Budget Bar (Verified from GTu026DgX-U & fightkaro.com) */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          {p2Config.isBoss && (
            <div className="flex-1 min-w-[260px] bg-amber-950/90 border border-amber-400/50 rounded-lg px-3 py-1.5 flex items-center gap-3">
              <span className="font-display text-xs tracking-wider text-amber-300 whitespace-nowrap">
                🕊️ AHINSA HARMONY (HOLD PEACE TO WIN): {hudState.ahinsaMeter}%
              </span>
              <div className="flex-1 h-2.5 bg-black/60 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-150"
                  style={{ width: `${hudState.ahinsaMeter}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => triggerAttack('p1', 'BUDGET')}
            disabled={hudState.budgetMeter < 100}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer ${
              hudState.budgetMeter >= 100
                ? 'bg-rose-600 text-white border-amber-300 shadow-lg'
                : 'bg-[#1E1612]/90 text-slate-300 border-white/15 opacity-85'
            }`}
          >
            <span>📕 BUDGET STRIKE [KEY B]: {hudState.budgetMeter}%</span>
          </button>
        </div>
      </div>

      {/* Center Announcements & Super Activation Banners */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center my-auto px-4">
        {hudState.bannerText && (
          <div className="bg-[#120A06]/90 border-2 border-[#FF9933] px-8 py-3 rounded-xl shadow-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#FF9933] tracking-wider text-center">
              {hudState.bannerText}
            </h2>
          </div>
        )}
        {hudState.superBanner && (
          <div className="mt-3 bg-cyan-950/95 border-2 border-cyan-400 px-6 py-2 rounded-lg shadow-xl">
            <p className="font-display text-2xl font-bold text-cyan-300 tracking-wide">
              ⚡ {hudState.superBanner}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls Strip: Mobile Touch Pad + Live Satirical TV News Desk (`#newsdesk`) */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 pb-3 space-y-2">
        {/* Touch Controls for Mobile / Tablet */}
        <div className="flex items-center justify-between gap-4 md:hidden">
          <div className="flex items-center gap-1.5 bg-black/75 p-2 rounded-xl border border-white/15">
            <button
              type="button"
              onTouchStart={() => (simRef.current.touchStick.left = true)}
              onTouchEnd={() => (simRef.current.touchStick.left = false)}
              onMouseDown={() => (simRef.current.touchStick.left = true)}
              onMouseUp={() => (simRef.current.touchStick.left = false)}
              className="w-12 h-12 bg-white/10 active:bg-[#FF9933] rounded-lg font-bold text-white"
            >
              ←
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onTouchStart={() => (simRef.current.touchStick.up = true)}
                onTouchEnd={() => (simRef.current.touchStick.up = false)}
                onMouseDown={() => (simRef.current.touchStick.up = true)}
                onMouseUp={() => (simRef.current.touchStick.up = false)}
                className="w-12 h-10 bg-white/10 active:bg-[#FF9933] rounded-lg font-bold text-white"
              >
                ↑
              </button>
              <button
                type="button"
                onTouchStart={() => (simRef.current.touchStick.down = true)}
                onTouchEnd={() => (simRef.current.touchStick.down = false)}
                onMouseDown={() => (simRef.current.touchStick.down = true)}
                onMouseUp={() => (simRef.current.touchStick.down = false)}
                className="w-12 h-10 bg-white/10 active:bg-[#FF9933] rounded-lg font-bold text-white"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onTouchStart={() => (simRef.current.touchStick.right = true)}
              onTouchEnd={() => (simRef.current.touchStick.right = false)}
              onMouseDown={() => (simRef.current.touchStick.right = true)}
              onMouseUp={() => (simRef.current.touchStick.right = false)}
              className="w-12 h-12 bg-white/10 active:bg-[#FF9933] rounded-lg font-bold text-white"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-black/75 p-2 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => triggerAttack('p1', 'PUNCH')}
              className="px-4 py-2.5 bg-[#FF9933] text-black font-display font-bold text-sm rounded-lg"
            >
              PUNCH (J)
            </button>
            <button
              type="button"
              onClick={() => triggerAttack('p1', 'KICK')}
              className="px-4 py-2.5 bg-amber-500 text-black font-display font-bold text-sm rounded-lg"
            >
              KICK (K)
            </button>
            <button
              type="button"
              onClick={() => triggerAttack('p1', 'GRAB')}
              className="px-4 py-2 bg-rose-600 text-white font-display font-bold text-xs rounded-lg"
            >
              GRAB (I)
            </button>
            <button
              type="button"
              onClick={() => triggerAttack('p1', 'SUPER')}
              className="px-4 py-2 bg-cyan-500 text-black font-display font-bold text-xs rounded-lg"
            >
              SUPER (L)
            </button>
          </div>
        </div>

        {/* Live Satirical TV News Desk (`#newsdesk`) */}
        <div className="bg-[#120A06]/90 backdrop-blur-md border border-white/15 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-3 py-2 text-xs border-b border-white/10">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-bold text-rose-400 shrink-0">[PRIME DEBATE TV]</span>
              <span className="text-slate-200 truncate">{hudState.godiLine}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-bold text-cyan-400 shrink-0">[FACT CHECK DESK]</span>
              <span className="text-slate-300 truncate">{hudState.factLine}</span>
            </div>
          </div>
          <div className="flex items-center bg-black/80 px-3 py-1 text-[11px] font-mono text-amber-300/90 overflow-hidden">
            <span className="font-bold text-rose-500 mr-3 shrink-0">BREAKING NEWS ·</span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <div className="animate-ticker">
                <span className="mx-6">{BREAKING_TICKER_LINES.join('   ·   ')}</span>
                <span className="mx-6">{BREAKING_TICKER_LINES.join('   ·   ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chai Break Pause Overlay (`#pause`) */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1612] border border-[#FF9933]/50 rounded-2xl max-w-md w-full p-6 text-center space-y-4">
            <h2 className="font-display text-4xl font-bold text-[#FF9933]">CHAI BREAK ☕</h2>
            <p className="text-sm text-slate-300">
              Sansad session adjourned till further notice. Samosas are being served.
            </p>
            <div className="text-xs font-mono text-slate-400 bg-black/50 p-3 rounded-lg text-left space-y-1">
              <div>MOVE: A/D or ←/→ · JUMP: W/↑ · CROUCH: S/↓ · BLOCK: Hold Back</div>
              <div>PUNCH: J · KICK: K · GRAB: I · SHAKTI SUPER: L / Space · BUDGET: B</div>
              <div>TARGET COMBOS: J,J,J · J,J,K · J,K,K · K,K · ↓J,K Sweep</div>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-display font-bold text-lg rounded-lg cursor-pointer"
              >
                RESUME SESSION
              </button>
              <button
                type="button"
                onClick={onQuitToSelect}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg cursor-pointer"
              >
                QUIT TO CHARACTER SELECT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
