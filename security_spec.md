# Phase 0: Payload-First Security TDD (`security_spec.md`)

## 1. Data Invariants
1. **Identity & Ownership Invariant**: A `/users/{userId}` or `/users_private/{userId}` document can only be created or updated by `request.auth.uid == userId` (with verified email) or a trusted `isAdmin()`.
2. **PII Isolation Invariant**: `/users_private/{userId}` contains `email` and is strictly unreadable by any user except `isOwner(userId)` or `isAdmin()`. `/users/{userId}` contains zero PII so leaderboard queries do not leak emails.
3. **Self-Ban / Role Escalation Prevention**: A standard user creating `/users/{userId}` MUST set `isBanned == false` and cannot unban themselves on update (`incoming().isBanned == existing().isBanned`).
4. **Immutable Match History**: `/matches/{matchId}` must verify `incoming().player1Uid == request.auth.uid`, enforce `exists(/databases/$(database)/documents/users/$(request.auth.uid))`, and forbid all client `update` and `delete` operations.
5. **Terminal State Locking on Reports**: Once `/reports/{reportId}` reaches `status == 'resolved'` or `'dismissed'`, non-admins cannot mutate it.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection**: Creating `/users/u1` with an extra field `{ ..., "isSuperAdmin": true }` → `PERMISSION_DENIED` (`hasOnly` check).
2. **Identity Spoofing on Match Create**: Authenticated as `u1`, creating `/matches/m1` with `player1Uid: "u2"` → `PERMISSION_DENIED`.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempting to create `/users/u1` → `PERMISSION_DENIED`.
4. **PII Snooping (`get` on `users_private`)**: User `u2` reading `/users_private/u1` → `PERMISSION_DENIED`.
5. **Unbounded Array Poisoning**: Updating `unlockedAchievements` with 50 items (`size() > 20`) → `PERMISSION_DENIED`.
6. **ID Poisoning Attack**: Creating a document with a 500-char or special-char ID (`/matches/bad$id!`) → `PERMISSION_DENIED` (`isValidId` check).
7. **Timestamp Forgery**: Creating `/matches/m1` with a past or future `createdAt != request.time` → `PERMISSION_DENIED`.
8. **Immutable Field Mutation**: Updating `createdAt` or `uid` on `/users/u1` → `PERMISSION_DENIED`.
9. **Self-Unbanning Exploit**: Banned user `u1` updating `isBanned: false` on `/users/u1` → `PERMISSION_DENIED`.
10. **Orphaned Match Record**: Creating `/matches/m1` when `/users/$(request.auth.uid)` does not exist → `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: Updating `xp` on `/users/u1` with a string `"999999"` or negative number → `PERMISSION_DENIED` (`isValidUserProfile` wrapper on update).
12. **Unauthorized GameConfig Mutation**: Non-admin attempting to update `/game_config/global` → `PERMISSION_DENIED`.
