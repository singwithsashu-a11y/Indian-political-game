import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'game_config', 'global'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface PlayerProfileData {
  uid: string;
  username: string;
  avatarId: string;
  title: string;
  xp: number;
  level: number;
  coins: number;
  wins: number;
  losses: number;
  elo: number;
  streak: number;
  bestStreak: number;
  bossDefeated: boolean;
  unlockedAchievements: string[];
  lastDailyClaim: string;
  isBanned: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface MatchHistoryItem {
  matchId: string;
  player1Uid: string;
  player1Name: string;
  player1Fighter: string;
  player2Name: string;
  player2Fighter: string;
  winnerName: string;
  userWon: boolean;
  mode: string;
  stage: string;
  roundsWonP1: number;
  roundsWonP2: number;
  durationSec: number;
  maxCombo: number;
  ahinsaVictory: boolean;
  headline: string;
  createdAt?: Timestamp | string;
}

export interface PlayerReportItem {
  reportId: string;
  reporterUid: string;
  reportedName: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt?: Timestamp | string;
}

export interface GameConfigData {
  configId: string;
  roundTimeSec: number;
  shaktiGainMultiplier: number;
  ahinsaSpeedMultiplier: number;
  announcement: string;
}

export const OWNER_ADMIN_EMAIL = 'Mq5023789@gmail.com';

export function computeLevelAndTitle(xp: number): { level: number; title: string } {
  const safeXp = Math.max(0, Math.min(10000000, Math.floor(xp)));
  const level = Math.max(1, Math.min(500, Math.floor(Math.sqrt(safeXp / 100)) + 1));
  let title = 'Ward Karyakarta';
  if (level >= 20) title = 'Kursi Samrat';
  else if (level >= 15) title = 'Speaker of the House';
  else if (level >= 10) title = 'Cabinet Mantri';
  else if (level >= 6) title = 'Sansad Star';
  else if (level >= 3) title = 'Yuva Morcha Leader';
  return { level, title };
}

export function sanitizeUsername(raw: string): string {
  const cleaned = raw.trim().slice(0, 40);
  return cleaned.length >= 2 ? cleaned : 'SansadContender';
}

export async function ensureUserProfile(user: User): Promise<PlayerProfileData> {
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      return snap.data() as PlayerProfileData;
    }

    const defaultName = sanitizeUsername(user.displayName || user.email?.split('@')[0] || 'NetaJi');
    const newProfile: PlayerProfileData = {
      uid: user.uid,
      username: defaultName,
      avatarId: 'vikas',
      title: 'Ward Karyakarta',
      xp: 0,
      level: 1,
      coins: 150,
      wins: 0,
      losses: 0,
      elo: 1000,
      streak: 0,
      bestStreak: 0,
      bossDefeated: false,
      unlockedAchievements: ['first_login'],
      lastDailyClaim: '',
      isBanned: false,
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (user.email) {
      await setDoc(doc(db, 'users_private', user.uid), {
        uid: user.uid,
        email: user.email.slice(0, 254),
        soundEnabled: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updatePlayerProfileInDb(
  uid: string,
  updates: Partial<PlayerProfileData>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const safeUpdates: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (typeof safeUpdates.username === 'string') {
      safeUpdates.username = sanitizeUsername(safeUpdates.username);
    }
    if (Array.isArray(safeUpdates.unlockedAchievements)) {
      safeUpdates.unlockedAchievements = safeUpdates.unlockedAchievements.slice(0, 20);
    }
    await updateDoc(doc(db, 'users', uid), safeUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordMatchInDb(record: MatchHistoryItem): Promise<void> {
  const path = `matches/${record.matchId}`;
  try {
    await setDoc(doc(db, 'matches', record.matchId), {
      matchId: record.matchId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64),
      player1Uid: record.player1Uid,
      player1Name: record.player1Name.slice(0, 40),
      player1Fighter: record.player1Fighter.slice(0, 32),
      player2Name: record.player2Name.slice(0, 40),
      player2Fighter: record.player2Fighter.slice(0, 32),
      winnerName: record.winnerName.slice(0, 40),
      userWon: Boolean(record.userWon),
      mode: record.mode.slice(0, 24),
      stage: record.stage.slice(0, 24),
      roundsWonP1: Math.max(0, Math.min(3, Math.floor(record.roundsWonP1))),
      roundsWonP2: Math.max(0, Math.min(3, Math.floor(record.roundsWonP2))),
      durationSec: Math.max(1, Math.min(600, Math.floor(record.durationSec))),
      maxCombo: Math.max(0, Math.min(99, Math.floor(record.maxCombo))),
      ahinsaVictory: Boolean(record.ahinsaVictory),
      headline: record.headline.slice(0, 160),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchLeaderboardFromDb(): Promise<PlayerProfileData[]> {
  const path = 'users';
  try {
    const q = query(
      collection(db, 'users'),
      where('isBanned', '==', false),
      orderBy('elo', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PlayerProfileData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchUserMatchesFromDb(uid: string): Promise<MatchHistoryItem[]> {
  const path = 'matches';
  try {
    const q = query(
      collection(db, 'matches'),
      where('player1Uid', '==', uid),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MatchHistoryItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitReportToDb(
  reporterUid: string,
  reportedName: string,
  reason: string
): Promise<void> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `reports/${reportId}`;
  try {
    await setDoc(doc(db, 'reports', reportId), {
      reportId,
      reporterUid,
      reportedName: reportedName.trim().slice(0, 40) || 'Unknown Player',
      reason: reason.trim().slice(0, 300) || 'Suspicious movement / unsportsmanlike conduct',
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllReportsAdmin(): Promise<PlayerReportItem[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, 'reports'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PlayerReportItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateReportStatusAdmin(
  reportId: string,
  status: 'resolved' | 'dismissed'
): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleUserBanAdmin(uid: string, isBanned: boolean): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      isBanned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveGameConfigAdmin(config: GameConfigData): Promise<void> {
  const path = 'game_config/global';
  try {
    const snap = await getDoc(doc(db, 'game_config', 'global'));
    const payload = {
      configId: 'global',
      roundTimeSec: Math.max(30, Math.min(180, Math.floor(config.roundTimeSec))),
      shaktiGainMultiplier: Math.max(0.5, Math.min(3.0, Number(config.shaktiGainMultiplier))),
      ahinsaSpeedMultiplier: Math.max(0.5, Math.min(3.0, Number(config.ahinsaSpeedMultiplier))),
      announcement: config.announcement.slice(0, 200),
      updatedAt: serverTimestamp(),
    };
    if (snap.exists()) {
      await updateDoc(doc(db, 'game_config', 'global'), payload);
    } else {
      await setDoc(doc(db, 'game_config', 'global'), payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export { signInWithPopup, fbSignOut, onAuthStateChanged, onSnapshot, doc };
