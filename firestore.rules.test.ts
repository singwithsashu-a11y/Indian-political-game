/**
 * Phase 0: Payload-First Security TDD Spec (`firestore.rules.test.ts`)
 * Verifies that all 12 "Dirty Dozen" adversarial payloads defined in `security_spec.md`
 * are rejected with PERMISSION_DENIED by `firestore.rules`.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  authUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
  mitigationRule: string;
}

export const DIRTY_DOZEN_PAYLOAD_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile Create',
    collection: '/users/user_alpha',
    operation: 'create',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      uid: 'user_alpha',
      username: 'AlphaNeta',
      isSuperAdmin: true // Ghost field rejected by keys().hasOnly(...)
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'isValidUserProfile(incoming()) keys().hasOnly() guard'
  },
  {
    id: 2,
    name: 'Identity Spoofing on MatchRecord Create',
    collection: '/matches/match_spoof_01',
    operation: 'create',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      matchId: 'match_spoof_01',
      player1Uid: 'victim_uid_999' // Mismatches request.auth.uid
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'data.player1Uid == request.auth.uid'
  },
  {
    id: 3,
    name: 'Unverified Email Write Attempt',
    collection: '/users/user_unverified',
    operation: 'create',
    authUid: 'user_unverified',
    emailVerified: false,
    payload: { uid: 'user_unverified', username: 'Spoofer' },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'isVerifiedUser() requires request.auth.token.email_verified == true'
  },
  {
    id: 4,
    name: 'Cross-User PII Snooping on users_private',
    collection: '/users_private/victim_uid',
    operation: 'get',
    authUid: 'attacker_uid',
    emailVerified: true,
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'allow get: if isValidId(userId) && (isOwner(userId) || isAdmin())'
  },
  {
    id: 5,
    name: 'Unbounded Array Poisoning on unlockedAchievements',
    collection: '/users/user_alpha',
    operation: 'update',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      unlockedAchievements: Array.from({ length: 35 }, (_, i) => `ach_${i}`)
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'data.unlockedAchievements.size() <= 20'
  },
  {
    id: 6,
    name: 'Document ID Poisoning with Illegal Characters',
    collection: '/matches/bad$id!injection',
    operation: 'create',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: { matchId: 'bad$id!injection' },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'isValidId(matchId) regex ^[a-zA-Z0-9_\\-]+$'
  },
  {
    id: 7,
    name: 'Client Timestamp Forgery on Match Create',
    collection: '/matches/match_time_forge',
    operation: 'create',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      matchId: 'match_time_forge',
      createdAt: '2020-01-01T00:00:00Z' // Mismatches request.time
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'incoming().createdAt == request.time'
  },
  {
    id: 8,
    name: 'Immutable createdAt Field Mutation on Update',
    collection: '/users/user_alpha',
    operation: 'update',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      createdAt: '2026-11-09T00:00:00Z'
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'incoming().createdAt == existing().createdAt'
  },
  {
    id: 9,
    name: 'Self-Unbanning Exploit on UserProfile',
    collection: '/users/banned_user',
    operation: 'update',
    authUid: 'banned_user',
    emailVerified: true,
    payload: {
      isBanned: false
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'existing().isBanned == false && incoming().isBanned == existing().isBanned'
  },
  {
    id: 10,
    name: 'Orphaned Match Record Without Existing UserProfile',
    collection: '/matches/match_orphan_01',
    operation: 'create',
    authUid: 'ghost_user_no_profile',
    emailVerified: true,
    payload: {
      matchId: 'match_orphan_01',
      player1Uid: 'ghost_user_no_profile'
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'exists(/databases/$(database)/documents/users/$(request.auth.uid))'
  },
  {
    id: 11,
    name: 'Value Type/Range Poisoning on XP Update',
    collection: '/users/user_alpha',
    operation: 'update',
    authUid: 'user_alpha',
    emailVerified: true,
    payload: {
      xp: -999999
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'isValidUserProfile(incoming()) enforces data.xp >= 0 && data.xp <= 10000000'
  },
  {
    id: 12,
    name: 'Unauthorized Non-Admin GameConfig Mutation',
    collection: '/game_config/global',
    operation: 'update',
    authUid: 'normal_player_uid',
    emailVerified: true,
    payload: {
      roundTimeSec: 999
    },
    expectedResult: 'PERMISSION_DENIED',
    mitigationRule: 'isAdmin() required on /game_config/{configId} writes'
  }
];
