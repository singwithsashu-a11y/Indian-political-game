import React, { useEffect, useRef, useState } from 'react';
import {
  FIGHTERS,
  STAGES,
  ACHIEVEMENTS,
  FighterConfig,
  StageConfig,
} from './game/fighters';
import { ArenaCanvas, MatchCompletionPayload } from './game/ArenaCanvas';
import { FighterAvatar } from './components/FighterAvatar';
import { NewspaperResult } from './components/NewspaperResult';
import { DocsAndTestsModal } from './components/DocsAndTestsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { CharacterModelSheetStudio } from './components/CharacterModelSheetStudio';
import { sound } from './game/sound';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  onSnapshot,
  doc,
  ensureUserProfile,
  updatePlayerProfileInDb,
  recordMatchInDb,
  fetchLeaderboardFromDb,
  fetchUserMatchesFromDb,
  submitReportToDb,
  computeLevelAndTitle,
  sanitizeUsername,
  PlayerProfileData,
  MatchHistoryItem,
  GameConfigData,
  OWNER_ADMIN_EMAIL,
} from './lib/firebase';
import { User } from 'firebase/auth';

type ScreenView =
  | 'MODELSHEET'
  | 'SELECT'
  | 'MULTIPLAYER'
  | 'PLAYING'
  | 'RESULT'
  | 'LEADERBOARD'
  | 'PROFILE';

const DEFAULT_GUEST_PROFILE: PlayerProfileData = {
  uid: 'guest_local',
  username: 'Guest Neta',
  avatarId: 'vikas',
  title: 'Ward Karyakarta',
  xp: 120,
  level: 2,
  coins: 200,
  wins: 1,
  losses: 0,
  elo: 1020,
  streak: 1,
  bestStreak: 1,
  bossDefeated: false,
  unlockedAchievements: ['first_login'],
  lastDailyClaim: '',
  isBanned: false,
};

export default function App() {
  // Legal Satire Disclaimer Gate (non-blocking on initial load)
  const [legalAccepted, setLegalAccepted] = useState<boolean>(true);

  // Main Screen & Modal Navigation (Defaults to 3D Character Model Sheet Studio, or PLAYING when ?autostart=1)
  const [view, setView] = useState<ScreenView>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'PLAYING';
      if (params.get('view') === 'select') return 'SELECT';
    } catch {
      // ignore
    }
    return 'MODELSHEET';
  });
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Roster & Match Setup State
  const [p1Fighter, setP1Fighter] = useState<FighterConfig>(FIGHTERS[0]);
  const [p2Fighter, setP2Fighter] = useState<FighterConfig>(FIGHTERS[1]);
  const [selectingSlot, setSelectingSlot] = useState<'p1' | 'p2'>('p1');
  const [selectedStage, setSelectedStage] = useState<StageConfig>(STAGES[0]);
  const [cpuDifficulty, setCpuDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [matchMode, setMatchMode] = useState<'cpu' | 'online'>('cpu');

  // Auth & Persistent Profile State
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfileData>(() => {
    try {
      const saved = localStorage.getItem('loksabha-legends:profile');
      return saved ? JSON.parse(saved) : DEFAULT_GUEST_PROFILE;
    } catch {
      return DEFAULT_GUEST_PROFILE;
    }
  });
  const [leaderboard, setLeaderboard] = useState<PlayerProfileData[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [editingUsername, setEditingUsername] = useState('');
  const [reportTarget, setReportTarget] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Live Game Config
  const [gameConfig, setGameConfig] = useState<GameConfigData>({
    configId: 'global',
    roundTimeSec: 60,
    shaktiGainMultiplier: 1.0,
    ahinsaSpeedMultiplier: 1.0,
    announcement: 'ZERO HOUR LIVE: Practice Ahinsa against Boss Shanti Bapu or unleash 100% Shakti Supers!',
  });

  // Last Completed Match Result & Verified Rewards
  const [lastResult, setLastResult] = useState<{
    payload: MatchCompletionPayload;
    xpEarned: number;
    coinsEarned: number;
    eloDelta: number;
    signature: string;
  } | null>(null);

  // Real-Time WebSocket Multiplayer State
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [roomState, setRoomState] = useState<{
    code: string;
    stage: string;
    status: string;
    host: { id: string; name: string; fighterId: string; ready: boolean };
    guest: { id: string; name: string; fighterId: string; ready: boolean } | null;
  } | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [publicRooms, setPublicRooms] = useState<
    Array<{ code: string; hostName: string; hostFighter: string; stage: string }>
  >([]);
  const [inQueue, setInQueue] = useState(false);
  const [onlineSlot, setOnlineSlot] = useState<'p1' | 'p2'>('p1');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  // Firebase Auth & Real-Time Firestore Config Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setFbUser(u);
      if (u) {
        try {
          const prof = await ensureUserProfile(u);
          setProfile(prof);
          setEditingUsername(prof.username);
        } catch (err) {
          console.error('Profile sync error:', err);
        }
      }
    });

    const unsubConfig = onSnapshot(
      doc(db, 'game_config', 'global'),
      (snap) => {
        if (snap.exists()) {
          setGameConfig(snap.data() as GameConfigData);
        }
      },
      () => {
        // Ignore if global config doc hasn't been created yet
      }
    );

    return () => {
      unsubAuth();
      unsubConfig();
    };
  }, []);

  // Save guest profile locally for immediate persistence
  useEffect(() => {
    try {
      localStorage.setItem('loksabha-legends:profile', JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  // Connect WebSocket for Real-Time Multiplayer
  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room:state') {
          setRoomState(msg.payload);
          setInQueue(false);
        } else if (msg.type === 'game:start') {
          const { stage, host, guest, yourSlot } = msg.payload;
          const f1 = FIGHTERS.find((f) => f.id === host.fighterId) || FIGHTERS[0];
          const f2 = FIGHTERS.find((f) => f.id === guest.fighterId) || FIGHTERS[1];
          const stg = STAGES.find((s) => s.id === stage) || STAGES[0];
          setP1Fighter(f1);
          setP2Fighter(f2);
          setSelectedStage(stg);
          setOnlineSlot(yourSlot);
          setMatchMode('online');
          setInQueue(false);
          setView('PLAYING');
        } else if (msg.type === 'player:disconnected') {
          notify(msg.payload?.message || 'Opponent disconnected.');
          setRoomState(null);
          if (view === 'PLAYING' && matchMode === 'online') {
            setView('MULTIPLAYER');
          }
        } else if (msg.type === 'error:msg') {
          notify(msg.payload?.message || 'Multiplayer room error.');
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Sync state attribute on body for verification tooling
  useEffect(() => {
    document.body.dataset.state =
      view === 'PLAYING'
        ? 'playing'
        : view === 'RESULT'
        ? 'gameover'
        : view === 'MODELSHEET'
        ? 'modelsheet'
        : 'title';
  }, [view]);

  // Load Leaderboard & Match History when opening those views
  useEffect(() => {
    if (view === 'LEADERBOARD') {
      fetchLeaderboardFromDb()
        .then((list) => setLeaderboard(list))
        .catch(() => {});
    } else if (view === 'PROFILE' && fbUser) {
      fetchUserMatchesFromDb(fbUser.uid)
        .then((list) => setMatchHistory(list))
        .catch(() => {});
    } else if (view === 'MULTIPLAYER') {
      fetch('/api/rooms')
        .then((r) => r.json())
        .then((d) => setPublicRooms(d.rooms || []))
        .catch(() => {});
    }
  }, [view, fbUser]);

  const handleAcceptLegal = () => {
    try {
      localStorage.setItem('loksabha-legends:legal-v1', '1');
    } catch {
      // ignore
    }
    setLegalAccepted(true);
    sound.playSelect();
  };

  const handleFighterTileClick = (fighter: FighterConfig) => {
    sound.playSelect();
    if (fighter.isBoss) {
      // Selecting Boss automatically sets P2 as Shanti Bapu for the Boss Challenge!
      setP2Fighter(fighter);
      setSelectingSlot('p1');
      notify('BOSS CHALLENGE SELECTED: Practice Ahinsa (Peace) or use Budget Audit [B] to defeat Shanti Bapu!');
      return;
    }
    if (selectingSlot === 'p1') {
      setP1Fighter(fighter);
      setSelectingSlot('p2');
    } else {
      setP2Fighter(fighter);
      setSelectingSlot('p1');
    }
  };

  const handleRandomPick = () => {
    sound.playSelect();
    const playables = FIGHTERS.filter((f) => !f.isBoss);
    const r1 = playables[Math.floor(Math.random() * playables.length)];
    const r2 = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
    setP1Fighter(r1);
    setP2Fighter(r2);
  };

  const startCpuMatch = () => {
    sound.playSelect();
    setMatchMode('cpu');
    setView('PLAYING');
  };

  const handleMatchCompleted = async (result: MatchCompletionPayload) => {
    const matchId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    let xpEarned = result.userWon ? 160 : 45;
    let coinsEarned = result.userWon ? 50 : 15;
    let eloDelta = result.userWon ? 16 : -8;
    let signature = 'local_verified';

    try {
      const verifyRes = await fetch('/api/matches/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          mode: matchMode,
          stage: selectedStage.id,
          p1Fighter: p1Fighter.id,
          p2Fighter: p2Fighter.id,
          roundsWonP1: result.roundsWonP1,
          roundsWonP2: result.roundsWonP2,
          durationSec: result.durationSec,
          maxCombo: result.maxCombo,
          damageDealt: result.damageDealt,
          ahinsaVictory: result.ahinsaVictory,
          difficulty: cpuDifficulty,
        }),
      });
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        xpEarned = data.rewards.xpEarned;
        coinsEarned = data.rewards.coinsEarned;
        eloDelta = data.rewards.eloDelta;
        signature = data.signature;
      }
    } catch {
      // Fallback to local verified calculation
    }

    const newXp = profile.xp + xpEarned;
    const { level: newLevel, title: newTitle } = computeLevelAndTitle(newXp);
    const newWins = profile.wins + (result.userWon ? 1 : 0);
    const newLosses = profile.losses + (result.userWon ? 0 : 1);
    const newStreak = result.userWon ? profile.streak + 1 : 0;
    const newBestStreak = Math.max(profile.bestStreak, newStreak);
    const newElo = Math.max(100, profile.elo + eloDelta);
    const newBossDefeated = profile.bossDefeated || Boolean(result.ahinsaVictory);

    const unlocked = new Set(profile.unlockedAchievements);
    if (result.userWon) unlocked.add('first_win');
    if (result.maxCombo >= 5) unlocked.add('combo_master');
    if (result.ahinsaVictory) unlocked.add('ahinsa_victor');
    if (result.userWon && cpuDifficulty === 'hard') unlocked.add('hard_campaigner');
    if (newStreak >= 3) unlocked.add('streak_3');

    const updatedProfile: PlayerProfileData = {
      ...profile,
      xp: newXp,
      level: newLevel,
      title: newTitle,
      coins: profile.coins + coinsEarned,
      wins: newWins,
      losses: newLosses,
      elo: newElo,
      streak: newStreak,
      bestStreak: newBestStreak,
      bossDefeated: newBossDefeated,
      unlockedAchievements: Array.from(unlocked).slice(0, 20),
    };

    setProfile(updatedProfile);

    const matchRecord: MatchHistoryItem = {
      matchId,
      player1Uid: fbUser ? fbUser.uid : profile.uid,
      player1Name: profile.username,
      player1Fighter: p1Fighter.name,
      player2Name: matchMode === 'online' ? 'Online Challenger' : p2Fighter.name,
      player2Fighter: p2Fighter.name,
      winnerName: result.userWon ? profile.username : p2Fighter.name,
      userWon: result.userWon,
      mode: matchMode,
      stage: selectedStage.id,
      roundsWonP1: result.roundsWonP1,
      roundsWonP2: result.roundsWonP2,
      durationSec: result.durationSec,
      maxCombo: result.maxCombo,
      ahinsaVictory: result.ahinsaVictory,
      headline: result.headline,
    };

    setMatchHistory((prev) => [matchRecord, ...prev.slice(0, 19)]);

    if (fbUser) {
      try {
        await updatePlayerProfileInDb(fbUser.uid, {
          username: updatedProfile.username,
          avatarId: updatedProfile.avatarId,
          title: updatedProfile.title,
          xp: updatedProfile.xp,
          level: updatedProfile.level,
          coins: updatedProfile.coins,
          wins: updatedProfile.wins,
          losses: updatedProfile.losses,
          elo: updatedProfile.elo,
          streak: updatedProfile.streak,
          bestStreak: updatedProfile.bestStreak,
          bossDefeated: updatedProfile.bossDefeated,
          unlockedAchievements: updatedProfile.unlockedAchievements,
          lastDailyClaim: updatedProfile.lastDailyClaim,
        });
        await recordMatchInDb(matchRecord);
      } catch (err) {
        console.error('Firestore match sync error:', err);
      }
    }

    setLastResult({
      payload: result,
      xpEarned,
      coinsEarned,
      eloDelta,
      signature,
    });
    setView('RESULT');
  };

  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const prof = await ensureUserProfile(cred.user);
      setProfile(prof);
      notify(`Signed in as ${prof.username}! Progress synced to Cloud Firestore.`);
    } catch (err) {
      console.error('Sign in failed:', err);
      notify('Google Sign-In popup closed or blocked.');
    }
  };

  const handleClaimDailyReward = async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (profile.lastDailyClaim === todayStr) {
      notify('Daily Chai Allowance already claimed today! Come back tomorrow.');
      return;
    }
    const updated: PlayerProfileData = {
      ...profile,
      coins: profile.coins + 100,
      xp: profile.xp + 75,
      lastDailyClaim: todayStr,
    };
    setProfile(updated);
    if (fbUser) {
      await updatePlayerProfileInDb(fbUser.uid, {
        coins: updated.coins,
        xp: updated.xp,
        lastDailyClaim: todayStr,
      });
    }
    notify('Claimed Daily Allowance: +100 Kursi Coins & +75 XP!');
  };

  // Multiplayer Actions
  const createMultiplayerRoom = (isPrivate: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      notify('Reconnecting to multiplayer coordinator…');
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: 'room:create',
        payload: {
          playerName: profile.username,
          fighterId: p1Fighter.id,
          stage: selectedStage.id,
          isPrivate,
        },
      })
    );
  };

  const joinMultiplayerRoom = (code: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'room:join',
        payload: {
          code: code.toUpperCase().trim(),
          playerName: profile.username,
          fighterId: p1Fighter.id,
        },
      })
    );
  };

  const toggleMultiplayerReady = () => {
    if (!wsRef.current || !roomState) return;
    const isHost = roomState.host.name === profile.username || !roomState.guest;
    const currentReady = isHost ? roomState.host.ready : roomState.guest?.ready;
    wsRef.current.send(
      JSON.stringify({
        type: 'player:select',
        payload: {
          fighterId: p1Fighter.id,
          stage: selectedStage.id,
          ready: !currentReady,
        },
      })
    );
  };

  const isAdminUser = Boolean(fbUser?.email === OWNER_ADMIN_EMAIL);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        view === 'MODELSHEET'
          ? 'bg-[#E5E7EB] text-[#0F172A]'
          : 'bg-[#120A06] text-[#F8FAFC]'
      }`}
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="h-16 flex items-center justify-between gap-8 px-6 border-b border-white/10 bg-[#120A06] text-[#F8FAFC] sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setView('MODELSHEET')}
          className="font-display text-2xl font-bold tracking-wider text-[#FF9933] whitespace-nowrap shrink-0 cursor-pointer"
        >
          LOKSABHA LEGENDS
        </button>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setView('MODELSHEET')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'MODELSHEET' ? 'text-[#FF9933] underline underline-offset-8' : ''
            }`}
          >
            3D Model Sheet
          </button>
          <button
            type="button"
            onClick={() => setView('SELECT')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'SELECT' ? 'text-[#FF9933] underline underline-offset-8' : ''
            }`}
          >
            Fighter Roster
          </button>
          <button
            type="button"
            onClick={() => setView('MULTIPLAYER')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'MULTIPLAYER' ? 'text-[#FF9933] underline underline-offset-8' : ''
            }`}
          >
            Multiplayer Rooms
          </button>
          <button
            type="button"
            onClick={() => setView('LEADERBOARD')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'LEADERBOARD' ? 'text-[#FF9933] underline underline-offset-8' : ''
            }`}
          >
            Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setView('PROFILE')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'PROFILE' ? 'text-[#FF9933] underline underline-offset-8' : ''
            }`}
          >
            Player Profile
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          {view === 'MODELSHEET' ? (
            <button
              type="button"
              data-start="true"
              onClick={() => setView('SELECT')}
              className="px-4 py-2 text-xs font-semibold bg-[#FF9933] hover:bg-amber-400 text-[#120A06] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Fight Arena
            </button>
          ) : fbUser ? (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="px-4 py-2 text-xs font-semibold bg-[#FF9933] hover:bg-amber-400 text-[#120A06] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Speaker Console
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="px-4 py-2 text-xs font-semibold bg-[#FF9933] hover:bg-amber-400 text-[#120A06] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E1612] border border-[#FF9933] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-mono max-w-md">
          {toastMessage}
        </div>
      )}

      {/* VIEW 0: AAA 3D GAME CHARACTER MODEL SHEET STUDIO */}
      {view === 'MODELSHEET' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
          <CharacterModelSheetStudio
            onSelectFighterForMatch={(fId) => {
              const found = FIGHTERS.find((f) => f.id === fId);
              if (found) {
                setP1Fighter(found);
                sound.playCharacterSuperVoice(found.id);
              }
              setView('SELECT');
            }}
          />
        </main>
      )}

      {/* VIEW 1: CHARACTER SELECT & MAIN HUB (`#select`) */}
      {view === 'SELECT' && (
        <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between gap-6">
          {/* Announcement & Quick Mode Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="text-xs text-slate-300 font-mono">
              <span>{gameConfig.announcement}</span>
              <span className="mx-2">·</span>
              <span className="text-amber-300">
                {profile.username} (Lv.{profile.level} {profile.title} · {profile.elo} ELO · {profile.coins} Coins)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClaimDailyReward}
                className="px-3 py-1.5 text-xs font-mono bg-white/10 hover:bg-white/15 text-amber-300 rounded-lg border border-amber-400/30 cursor-pointer whitespace-nowrap"
              >
                Claim Daily Chai (+100 Coins)
              </button>
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-1.5 text-xs font-mono bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 cursor-pointer whitespace-nowrap"
              >
                Server Telemetry
              </button>
            </div>
          </div>

          {/* 1P vs 2P/CPU Fighter Matchup Showcase + Roster Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Player 1 Selected Fighter Plate (`#plate-p1`) */}
            <div
              onClick={() => setSelectingSlot('p1')}
              className={`lg:col-span-3 rounded-2xl p-5 bg-[#1A120E] border transition-all cursor-pointer flex flex-col justify-between ${
                selectingSlot === 'p1'
                  ? 'border-[#FF9933] shadow-lg shadow-[#FF9933]/10'
                  : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#FF9933] mb-3">
                  <span>1P · YOUR NETA</span>
                  <span>{selectingSlot === 'p1' ? 'ACTIVE CURSOR' : 'CLICK TO CHANGE'}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <FighterAvatar fighter={p1Fighter} size="lg" />
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white tracking-wide">
                      {p1Fighter.name}
                    </h2>
                    <p className="text-xs text-amber-300/90 mt-0.5">{p1Fighter.party}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{p1Fighter.desc}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="text-cyan-300">SUPER: {p1Fighter.superName}</div>
                <div className="text-slate-400">SPECIAL: {p1Fighter.specialMoveName}</div>
                <div className="text-slate-300 pt-1">
                  PWR {p1Fighter.stats.power}/10 · SPD {p1Fighter.stats.speed}/10 · DEF{' '}
                  {p1Fighter.stats.defense}/10
                </div>
              </div>
            </div>

            {/* Center 11-Fighter Roster Grid + Stage & Difficulty Controls */}
            <div className="lg:col-span-6 bg-[#18110D] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
                      PICK YOUR NETA ({selectingSlot === 'p1' ? 'SELECTING 1P' : 'SELECTING OPPONENT'})
                    </h1>
                    <p className="text-xs text-slate-400">
                      Click any portrait to assign 1P or CPU/Boss opponent
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomPick}
                    className="px-3 py-1.5 text-xs font-mono bg-white/10 hover:bg-white/20 text-amber-300 rounded-lg cursor-pointer"
                  >
                    ? RANDOM MATCHUP
                  </button>
                </div>

                {/* Roster Tiles Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {FIGHTERS.map((f) => {
                    const isP1 = p1Fighter.id === f.id;
                    const isP2 = p2Fighter.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFighterTileClick(f)}
                        className={`group relative rounded-xl p-2.5 bg-[#120A06] border text-left transition-all cursor-pointer flex flex-col items-center ${
                          isP1 && isP2
                            ? 'border-amber-400 ring-2 ring-amber-400/40'
                            : isP1
                            ? 'border-[#FF9933] ring-2 ring-[#FF9933]/40'
                            : isP2
                            ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <FighterAvatar fighter={f} size="md" />
                        <span className="font-display text-sm font-bold text-white tracking-wide mt-2 truncate w-full text-center">
                          {f.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                          {f.isBoss ? 'BOSS · AHINSA' : f.archetype}
                        </span>
                        {/* Selection Cursors (`1P` / `CPU`) */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono font-bold">
                          {isP1 && <span className="text-[#FF9933]">1P</span>}
                          {isP1 && isP2 && <span>·</span>}
                          {isP2 && (
                            <span className="text-cyan-400">{f.isBoss ? 'BOSS' : 'CPU'}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage & CPU Difficulty Selector + FIGHT CTA */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Stage Segmented Control */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                    {STAGES.map((stg) => (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => setSelectedStage(stg)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          selectedStage.id === stg.id
                            ? 'bg-[#FF9933] text-[#120A06] font-bold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {stg.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* CPU Difficulty Segmented Control */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                    {(['easy', 'normal', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setCpuDifficulty(diff)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          cpuDifficulty === diff
                            ? 'bg-cyan-400 text-[#120A06] font-bold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        CPU: {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons (`#online-btn` & `#fight-btn`) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setView('MULTIPLAYER')}
                    className="py-3.5 px-5 bg-[#241914] hover:bg-[#2F211A] text-white border border-white/15 rounded-xl font-display font-bold text-lg tracking-wide cursor-pointer transition-colors"
                  >
                    PLAY WITH A FRIEND (ONLINE)
                  </button>
                  <button
                    type="button"
                    onClick={startCpuMatch}
                    className="py-3.5 px-6 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] rounded-xl font-display font-bold text-2xl tracking-wider shadow-lg cursor-pointer transition-transform active:scale-95"
                  >
                    FIGHT NOW!
                  </button>
                </div>
              </div>
            </div>

            {/* Player 2 / CPU / Boss Plate (`#plate-p2`) */}
            <div
              onClick={() => setSelectingSlot('p2')}
              className={`lg:col-span-3 rounded-2xl p-5 bg-[#1A120E] border transition-all cursor-pointer flex flex-col justify-between ${
                selectingSlot === 'p2'
                  ? 'border-cyan-400 shadow-lg shadow-cyan-400/10'
                  : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
                  <span>{p2Fighter.isBoss ? 'SECRET BOSS' : 'CPU OPPONENT'}</span>
                  <span>{selectingSlot === 'p2' ? 'ACTIVE CURSOR' : 'CLICK TO CHANGE'}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <FighterAvatar fighter={p2Fighter} size="lg" />
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white tracking-wide">
                      {p2Fighter.name}
                    </h2>
                    <p className="text-xs text-cyan-300/90 mt-0.5">{p2Fighter.party}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{p2Fighter.desc}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="text-amber-300">SUPER: {p2Fighter.superName}</div>
                <div className="text-slate-400">SPECIAL: {p2Fighter.specialMoveName}</div>
                <div className="text-slate-300 pt-1">
                  PWR {p2Fighter.stats.power}/10 · SPD {p2Fighter.stats.speed}/10 · DEF{' '}
                  {p2Fighter.stats.defense}/10
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls Reference Strip (`.controls` from fightkaro.com) */}
          <div className="bg-[#18110D] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong className="text-[#FF9933]">CONTROLS:</strong> Move: A/D or ←/→ · Jump: W/↑ ·
              Crouch: S/↓ · Block: Hold Back · Punch: J · Kick: K · Grab: I · Super: L / Space ·
              Budget Counter: B
            </div>
            <div>
              <strong className="text-cyan-300">TARGET COMBOS:</strong> J,J,J · J,J,K · J,K,K · K,K
              · ↓J,K Low Sweep
            </div>
          </div>
        </main>
      )}

      {/* VIEW 2: REAL-TIME WEBSOCKET MULTIPLAYER LOBBY (`#online`) */}
      {view === 'MULTIPLAYER' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wide">
                ONLINE MULTIPLAYER ROOMS & QUICK MATCHMAKING
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                WebSocket Status: {wsConnected ? 'CONNECTED TO AUTHORITATIVE SERVER' : 'RECONNECTING'} · Fighter: {p1Fighter.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('SELECT')}
              className="px-4 py-2 text-xs font-mono bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
            >
              ← BACK TO ROSTER
            </button>
          </div>

          {!roomState ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Room Card */}
              <div className="bg-[#1A120E] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#FF9933]">
                    1. CREATE ROOM CODE
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Host a 1v1 Sansad arena room and share the 6-character code with a friend.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => createMultiplayerRoom(false)}
                    className="w-full py-3 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-display font-bold text-base rounded-xl cursor-pointer"
                  >
                    CREATE PUBLIC ROOM
                  </button>
                  <button
                    type="button"
                    onClick={() => createMultiplayerRoom(true)}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer"
                  >
                    CREATE PRIVATE ROOM (CODE ONLY)
                  </button>
                </div>
              </div>

              {/* Join By Room Code Card */}
              <div className="bg-[#1A120E] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-cyan-400">
                    2. JOIN BY ROOM CODE
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Enter your friend&apos;s 6-character parliamentary room code to join immediately.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="E.G. KURS26"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="mt-4 w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-xl font-mono text-lg text-center tracking-widest text-white uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => joinMultiplayerRoom(joinCodeInput)}
                  disabled={joinCodeInput.trim().length < 4}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#120A06] font-display font-bold text-base rounded-xl cursor-pointer"
                >
                  JOIN ROOM
                </button>
              </div>

              {/* Automated Public Matchmaking Queue */}
              <div className="bg-[#1A120E] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-emerald-400">
                    3. QUICK MATCHMAKING
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Enter the live matchmaking queue to auto-pair with the next available contender.
                  </p>
                </div>
                {inQueue ? (
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-amber-300 text-center py-2 bg-black/40 rounded-lg">
                      SEARCHING FOR CONTENDER…
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        wsRef.current?.send(JSON.stringify({ type: 'matchmaking:leave', payload: {} }));
                        setInQueue(false);
                      }}
                      className="w-full py-2.5 bg-rose-600 text-white font-mono text-xs rounded-xl cursor-pointer"
                    >
                      LEAVE QUEUE
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      wsRef.current?.send(
                        JSON.stringify({
                          type: 'matchmaking:join',
                          payload: { playerName: profile.username, fighterId: p1Fighter.id },
                        })
                      );
                      setInQueue(true);
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#120A06] font-display font-bold text-base rounded-xl cursor-pointer"
                  >
                    FIND PUBLIC MATCH
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Active Room Waiting / Ready Check View */
            <div className="bg-[#1A120E] border border-[#FF9933]/50 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-400">ACTIVE MULTIPLAYER LOBBY</div>
                  <div className="font-mono text-3xl font-bold text-[#FF9933] tracking-widest mt-0.5">
                    ROOM CODE: {roomState.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    wsRef.current?.send(JSON.stringify({ type: 'room:leave', payload: {} }));
                    setRoomState(null);
                  }}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg font-mono text-xs cursor-pointer"
                >
                  LEAVE ROOM
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-[#FF9933]">HOST (1P)</div>
                    <div className="font-display text-2xl font-bold text-white">
                      {roomState.host.name}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Fighter: {roomState.host.fighterId.toUpperCase()}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      roomState.host.ready ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {roomState.host.ready ? 'READY' : 'NOT READY'}
                  </span>
                </div>

                <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex items-center justify-between">
                  {roomState.guest ? (
                    <>
                      <div>
                        <div className="text-xs font-mono text-cyan-400">CHALLENGER (2P)</div>
                        <div className="font-display text-2xl font-bold text-white">
                          {roomState.guest.name}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          Fighter: {roomState.guest.fighterId.toUpperCase()}
                        </div>
                      </div>
                      <span
                        className={`font-mono text-xs font-bold ${
                          roomState.guest.ready ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {roomState.guest.ready ? 'READY' : 'NOT READY'}
                      </span>
                    </>
                  ) : (
                    <div className="text-xs font-mono text-slate-400 py-4">
                      Waiting for challenger to join with code <strong>{roomState.code}</strong>…
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleMultiplayerReady}
                  disabled={!roomState.guest}
                  className="px-8 py-3 bg-[#FF9933] hover:bg-amber-400 disabled:opacity-40 text-[#120A06] font-display font-bold text-xl rounded-xl cursor-pointer"
                >
                  TOGGLE READY TO FIGHT
                </button>
              </div>
            </div>
          )}

          {/* Open Public Rooms List */}
          <div className="bg-[#18110D] border border-white/10 rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold text-white mb-3">
              OPEN PUBLIC ROOMS
            </h3>
            {publicRooms.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">
                No open public rooms waiting right now. Create one above or start Quick Matchmaking!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publicRooms.map((r) => (
                  <div
                    key={r.code}
                    className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between"
                  >
                    <div className="text-xs">
                      <div className="font-mono font-bold text-[#FF9933]">CODE: {r.code}</div>
                      <div className="text-slate-300">
                        Host: {r.hostName} ({r.hostFighter.toUpperCase()})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => joinMultiplayerRoom(r.code)}
                      className="px-3 py-1.5 bg-cyan-400 text-[#120A06] font-display font-bold text-xs rounded-lg cursor-pointer"
                    >
                      JOIN
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW 3: ACTIVE 60FPS FIGHTING GAME SCREEN */}
      {view === 'PLAYING' && (
        <ArenaCanvas
          p1Config={p1Fighter}
          p2Config={p2Fighter}
          stage={selectedStage}
          difficulty={cpuDifficulty}
          mode={matchMode}
          onlineSlot={onlineSlot}
          wsRef={wsRef}
          roundTimeConfigSec={gameConfig.roundTimeSec}
          shaktiMultiplier={gameConfig.shaktiGainMultiplier}
          ahinsaMultiplier={gameConfig.ahinsaSpeedMultiplier}
          onMatchEnd={handleMatchCompleted}
          onQuitToSelect={() => setView('SELECT')}
        />
      )}

      {/* VIEW 4: SATIRICAL NEWSPAPER RESULT SCREEN (`#result`) */}
      {view === 'RESULT' && lastResult && (
        <NewspaperResult
          result={lastResult.payload}
          p1={p1Fighter}
          p2={p2Fighter}
          stageName={selectedStage.name}
          xpEarned={lastResult.xpEarned}
          coinsEarned={lastResult.coinsEarned}
          eloDelta={lastResult.eloDelta}
          verifiedSignature={lastResult.signature}
          onRematch={() => setView('PLAYING')}
          onCharacterSelect={() => setView('SELECT')}
        />
      )}

      {/* VIEW 5: GLOBAL ELO LEADERBOARD */}
      {view === 'LEADERBOARD' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wide">
                SANSAD GLOBAL STANDINGS & ELO LEADERBOARD
              </h1>
              <p className="text-xs text-slate-400">
                Real-time rankings persisted in Cloud Firestore
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('SELECT')}
              className="px-4 py-2 text-xs font-mono bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
            >
              ← BACK TO ARENA
            </button>
          </div>

          <div className="bg-[#1A120E] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/60 text-xs font-mono text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Parliamentarian</th>
                  <th className="py-3.5 px-4">Title · Level</th>
                  <th className="py-3.5 px-4">W / L · Streak</th>
                  <th className="py-3.5 px-4 text-right">ELO Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(leaderboard.length > 0 ? leaderboard : [profile]).map((entry, idx) => (
                  <tr key={entry.uid} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono tabular-nums text-[#FF9933] font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {entry.username}
                      {entry.bossDefeated && (
                        <span className="ml-2 text-xs font-mono text-amber-300">
                          · Ahinsa Victor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {entry.title} · Lv.{entry.level}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-300">
                      {entry.wins}W / {entry.losses}L · Best Streak {entry.bestStreak}
                    </td>
                    <td className="py-3 px-4 font-mono text-base font-bold tabular-nums text-cyan-400 text-right">
                      {entry.elo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* VIEW 6: PLAYER PROFILE, PROGRESSION, ACHIEVEMENTS & MATCH HISTORY */}
      {view === 'PROFILE' && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile & Account Card */}
            <div className="lg:col-span-4 bg-[#1A120E] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-4">
                <FighterAvatar
                  fighter={FIGHTERS.find((f) => f.id === profile.avatarId) || FIGHTERS[0]}
                  size="lg"
                />
                <div>
                  <div className="text-xs font-mono text-[#FF9933]">{profile.title}</div>
                  <h2 className="font-display text-2xl font-bold text-white">{profile.username}</h2>
                  <div className="text-xs font-mono text-slate-400">
                    Level {profile.level} · {profile.xp} XP · {profile.coins} Coins
                  </div>
                </div>
              </div>

              {/* Edit Username & Avatar */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="block text-xs text-slate-400">Update Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={40}
                    value={editingUsername}
                    onChange={(e) => setEditingUsername(e.target.value)}
                    placeholder={profile.username}
                    className="flex-1 px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const clean = sanitizeUsername(editingUsername);
                      setProfile((p) => ({ ...p, username: clean }));
                      if (fbUser) {
                        await updatePlayerProfileInDb(fbUser.uid, { username: clean });
                      }
                      notify('Profile name updated!');
                    }}
                    className="px-3 py-2 bg-[#FF9933] text-[#120A06] font-bold text-xs rounded-lg cursor-pointer"
                  >
                    SAVE
                  </button>
                </div>
              </div>

              {/* Auth Status */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {fbUser ? (
                  <button
                    type="button"
                    onClick={() => fbSignOut(auth)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 rounded-lg cursor-pointer"
                  >
                    SIGN OUT ({fbUser.email})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 bg-[#FF9933] text-[#120A06] font-display font-bold text-sm rounded-lg cursor-pointer"
                  >
                    LINK GOOGLE ACCOUNT FOR CLOUD SYNC
                  </button>
                )}
              </div>

              {/* Submit Fair-Play / Moderation Report */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Report Unfair Conduct</div>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Opponent Name"
                  value={reportTarget}
                  onChange={(e) => setReportTarget(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Reason (e.g. suspicious disconnect)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!reportTarget.trim()) return;
                    if (fbUser) {
                      await submitReportToDb(fbUser.uid, reportTarget, reportReason);
                    }
                    setReportTarget('');
                    setReportReason('');
                    notify('Moderation report submitted to Speaker Console.');
                  }}
                  className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-xs font-mono text-slate-300 rounded-lg cursor-pointer"
                >
                  SUBMIT REPORT
                </button>
              </div>
            </div>

            {/* Achievements & Match History */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#1A120E] border border-white/10 rounded-2xl p-6">
                <h3 className="font-display text-xl font-bold text-white mb-4">
                  PARLIAMENTARY ACHIEVEMENTS ({profile.unlockedAchievements.length}/{ACHIEVEMENTS.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = profile.unlockedAchievements.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`p-3.5 rounded-xl border ${
                          isUnlocked
                            ? 'bg-[#FF9933]/10 border-[#FF9933]/50'
                            : 'bg-black/40 border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">{ach.title}</span>
                          <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                            {isUnlocked ? 'UNLOCKED' : `+${ach.xpReward} XP`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{ach.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#1A120E] border border-white/10 rounded-2xl p-6">
                <h3 className="font-display text-xl font-bold text-white mb-4">
                  RECENT MATCH HISTORY
                </h3>
                {matchHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono">
                    No matches recorded yet in this session. Step into the arena and fight!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {matchHistory.map((m) => (
                      <div
                        key={m.matchId}
                        className="p-3 bg-black/50 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span
                            className={`font-mono font-bold mr-2 ${
                              m.userWon ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {m.userWon ? 'VICTORY' : 'DEFEAT'}
                          </span>
                          <span className="text-white font-semibold">
                            {m.player1Fighter} vs {m.player2Fighter}
                          </span>
                          <span className="text-slate-400 ml-2">({m.headline})</span>
                        </div>
                        <div className="font-mono text-slate-400 tabular-nums">
                          {m.roundsWonP1}-{m.roundsWonP2} · {m.durationSec}s · Max Combo {m.maxCombo}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Opening Bilingual Satire Notice (`#legal` verified from fightkaro.com) */}
      {!legalAccepted && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#1A120E] border-2 border-[#FF9933] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h2 className="font-display text-3xl font-bold text-[#FF9933] tracking-wide">
              SATIRE NOTICE · व्यंग्य सूचना
            </h2>
            <div className="max-h-72 overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-200 pr-2">
              <p className="text-amber-200 font-medium">
                यह एक व्यंग्यात्मक खेल है। इसमें दिखाए गए पात्र, संवाद और घटनाएं मनोरंजन, हास्य और
                सामाजिक टिप्पणी के उद्देश्य से काल्पनिक एवं अतिरंजित रूप में प्रस्तुत किए गए हैं।
                इन्हें वास्तविक घटनाओं या तथ्यों के रूप में न लें।
              </p>
              <p>
                <strong>LOKSABHA LEGENDS: THE GREAT KURSI SHOWDOWN</strong> is an independent,
                original political satire and parody arcade game created strictly for entertainment,
                humour, and creative expression.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  All fictional dialogues, newspaper headlines, and characters are original
                  satirical caricatures and do not represent factual statements.
                </li>
                <li>
                  This game is not affiliated with, endorsed by, or connected to any political
                  party, leader, government body, or news channel.
                </li>
                <li>
                  Contains cartoon slapstick martial arts and comedic exaggerations—do not imitate
                  in real life.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleAcceptLegal}
              className="w-full py-3.5 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-display font-bold text-xl tracking-wider rounded-xl cursor-pointer"
            >
              I UNDERSTAND · ENTER SANSAD ARENA
            </button>
          </div>
        </div>
      )}

      {/* Docs, GDD & Automated QA Modal */}
      {showDocsModal && <DocsAndTestsModal onClose={() => setShowDocsModal(false)} />}

      {/* Admin Dashboard Modal */}
      {showAdminModal && (
        <AdminDashboardModal
          isAdminUser={isAdminUser}
          gameConfig={gameConfig}
          onConfigUpdated={(cfg) => setGameConfig(cfg)}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
