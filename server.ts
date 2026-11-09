import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const PORT = 3000;

interface RoomPlayer {
  id: string;
  name: string;
  fighterId: string;
  ready: boolean;
  ws: WebSocket;
  x: number;
  y: number;
  hp: number;
  shakti: number;
  lastUpdateAt: number;
}

interface GameRoom {
  code: string;
  stage: string;
  isPrivate: boolean;
  status: 'WAITING' | 'READY_CHECK' | 'PLAYING' | 'FINISHED';
  host: RoomPlayer;
  guest: RoomPlayer | null;
  createdAt: number;
  seed: number;
}

const rooms = new Map<string, GameRoom>();
const matchmakingQueue: RoomPlayer[] = [];
const verifiedMatchIds = new Set<string>();
const serverAuditLogs: Array<{ id: string; time: string; event: string; detail: string }> = [];

function logAudit(event: string, detail: string) {
  serverAuditLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time: new Date().toISOString(),
    event,
    detail,
  });
  if (serverAuditLogs.length > 100) serverAuditLogs.pop();
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function sendJson(ws: WebSocket, type: string, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

function serializeRoom(room: GameRoom) {
  return {
    code: room.code,
    stage: room.stage,
    isPrivate: room.isPrivate,
    status: room.status,
    seed: room.seed,
    host: {
      id: room.host.id,
      name: room.host.name,
      fighterId: room.host.fighterId,
      ready: room.host.ready,
    },
    guest: room.guest
      ? {
          id: room.guest.id,
          name: room.guest.name,
          fighterId: room.guest.fighterId,
          ready: room.guest.ready,
        }
      : null,
  };
}

function broadcastRoomState(room: GameRoom) {
  const state = serializeRoom(room);
  sendJson(room.host.ws, 'room:state', state);
  if (room.guest) {
    sendJson(room.guest.ws, 'room:state', state);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  logAudit('SERVER_BOOT', 'LokSabha Legends authoritative server & anti-cheat engine initialized');

  // --- REST API: Health & Live Telemetry ---
  app.get('/api/health', (_req, res) => {
    let onlineClients = 0;
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) onlineClients++;
    });
    res.json({
      status: 'ok',
      uptimeSec: Math.floor(process.uptime()),
      activeRooms: rooms.size,
      queueSize: matchmakingQueue.length,
      onlinePlayers: Math.max(1, onlineClients),
      verifiedMatchesCount: verifiedMatchIds.size,
      auditLogs: serverAuditLogs.slice(0, 25),
    });
  });

  // --- REST API: Public Rooms ---
  app.get('/api/rooms', (_req, res) => {
    const publicRooms = Array.from(rooms.values())
      .filter((r) => !r.isPrivate && r.status === 'WAITING' && !r.guest)
      .map((r) => ({
        code: r.code,
        hostName: r.host.name,
        hostFighter: r.host.fighterId,
        stage: r.stage,
        createdAt: r.createdAt,
      }));
    res.json({ rooms: publicRooms });
  });

  // --- REST API: Server-Side Anti-Cheat Match Result Verifier ---
  app.post('/api/matches/verify', (req, res) => {
    const {
      matchId,
      mode,
      stage,
      p1Fighter,
      p2Fighter,
      roundsWonP1,
      roundsWonP2,
      durationSec,
      maxCombo,
      damageDealt,
      ahinsaVictory,
      difficulty,
    } = req.body || {};

    if (!matchId || typeof matchId !== 'string' || matchId.length > 64) {
      logAudit('ANTICHEAT_REJECT', `Invalid matchId format`);
      return res.status(400).json({ verified: false, error: 'Invalid match identifier.' });
    }

    if (verifiedMatchIds.has(matchId)) {
      logAudit('ANTICHEAT_DUPLICATE', `Blocked duplicate reward claim for ${matchId}`);
      return res.status(409).json({ verified: false, error: 'Duplicate match reward claim blocked.' });
    }

    const dur = Number(durationSec);
    const r1 = Number(roundsWonP1);
    const r2 = Number(roundsWonP2);
    const combo = Number(maxCombo || 1);
    const dmg = Number(damageDealt || 0);

    // Anti-cheat plausibility checks
    if (isNaN(dur) || dur < 3 || dur > 600) {
      logAudit('ANTICHEAT_SPEEDHACK', `Rejected impossible match duration (${dur}s) on ${matchId}`);
      return res.status(422).json({ verified: false, error: 'Match duration failed anti-cheat validation.' });
    }

    if (r1 < 0 || r1 > 3 || r2 < 0 || r2 > 3 || (r1 < 2 && r2 < 2 && !ahinsaVictory)) {
      logAudit('ANTICHEAT_SCORE', `Invalid round score (${r1}-${r2}) on ${matchId}`);
      return res.status(422).json({ verified: false, error: 'Round score failed server validation.' });
    }

    if (combo < 0 || combo > 40 || dmg < 0 || dmg > 1200) {
      logAudit('ANTICHEAT_STATS', `Out-of-bounds combo (${combo}) or damage (${dmg}) on ${matchId}`);
      return res.status(422).json({ verified: false, error: 'Combat telemetry exceeded maximum legal frame thresholds.' });
    }

    verifiedMatchIds.add(matchId);

    const userWon = r1 > r2 || Boolean(ahinsaVictory);
    let xpEarned = 45;
    let coinsEarned = 15;
    let eloDelta = -8;

    if (userWon) {
      if (ahinsaVictory) {
        xpEarned = 350;
        coinsEarned = 120;
        eloDelta = 32;
      } else if (mode === 'online') {
        xpEarned = 300;
        coinsEarned = 100;
        eloDelta = 25;
      } else if (difficulty === 'hard') {
        xpEarned = 260;
        coinsEarned = 85;
        eloDelta = 20;
      } else if (difficulty === 'normal') {
        xpEarned = 180;
        coinsEarned = 55;
        eloDelta = 14;
      } else {
        xpEarned = 120;
        coinsEarned = 35;
        eloDelta = 10;
      }
      xpEarned += Math.min(40, combo * 3);
    }

    const signature = `sig_${Buffer.from(`${matchId}:${xpEarned}:${coinsEarned}`).toString('base64').slice(0, 16)}`;
    logAudit(
      'MATCH_VERIFIED',
      `${matchId} (${mode || 'cpu'}/${stage || 'sansad'}): ${p1Fighter} vs ${p2Fighter} [${r1}-${r2}] -> +${xpEarned}XP`
    );

    return res.json({
      verified: true,
      signature,
      rewards: {
        xpEarned,
        coinsEarned,
        eloDelta,
      },
    });
  });

  // --- REST API: Serve Project Documentation Files (`docs/*.md` & `security_spec.md`) ---
  app.get('/api/docs', (_req, res) => {
    const docFiles = [
      { id: 'reference-analysis', title: '1. Reference Analysis (fightkaro.com)', path: 'docs/reference-analysis.md' },
      { id: 'game-mechanics', title: '2. Game Mechanics & Frame Data', path: 'docs/game-mechanics.md' },
      { id: 'gdd', title: '3. Game Design Document (GDD)', path: 'docs/gdd.md' },
      { id: 'user-flow', title: '4. User Flow & State Machine', path: 'docs/user-flow.md' },
      { id: 'ui-design', title: '5. UI/UX Design System', path: 'docs/ui-design.md' },
      { id: 'technical-architecture', title: '6. Technical Architecture & Anti-Cheat', path: 'docs/technical-architecture.md' },
      { id: 'database-schema', title: '7. Database Schema (Firestore & SQL DDL)', path: 'docs/database-schema.md' },
      { id: 'api-documentation', title: '8. REST & WebSocket API Docs', path: 'docs/api-documentation.md' },
      { id: 'security-spec', title: '9. Security TDD & Dirty Dozen Spec', path: 'security_spec.md' },
      { id: 'testing-documentation', title: '10. QA & Testing Documentation', path: 'docs/testing-documentation.md' },
      { id: 'deployment-guide', title: '11. Production Deployment Guide', path: 'docs/deployment-guide.md' },
    ];

    const loaded = docFiles.map((docItem) => {
      try {
        const fullPath = path.resolve(process.cwd(), docItem.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return { ...docItem, content };
      } catch {
        return { ...docItem, content: `# ${docItem.title}\nDocumentation file not found.` };
      }
    });

    res.json({ docs: loaded });
  });

  // --- WebSocket Authoritative Multiplayer Coordinator ---
  wss.on('connection', (ws) => {
    const clientId = `plr_${Math.random().toString(36).slice(2, 10)}`;
    let currentRoomCode: string | null = null;

    sendJson(ws, 'connected', { clientId });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type, payload } = msg;

        if (type === 'room:create') {
          const code = generateRoomCode();
          const hostPlayer: RoomPlayer = {
            id: clientId,
            name: String(payload?.playerName || 'Neta 1P').slice(0, 32),
            fighterId: String(payload?.fighterId || 'vikas'),
            ready: false,
            ws,
            x: 280,
            y: 510,
            hp: 100,
            shakti: 0,
            lastUpdateAt: Date.now(),
          };
          const room: GameRoom = {
            code,
            stage: String(payload?.stage || 'sansad'),
            isPrivate: Boolean(payload?.isPrivate),
            status: 'WAITING',
            host: hostPlayer,
            guest: null,
            createdAt: Date.now(),
            seed: Math.floor(Math.random() * 100000),
          };
          rooms.set(code, room);
          currentRoomCode = code;
          logAudit('ROOM_CREATED', `Room ${code} created by ${hostPlayer.name}`);
          broadcastRoomState(room);
        } else if (type === 'room:join') {
          const code = String(payload?.code || '').toUpperCase().trim();
          const room = rooms.get(code);
          if (!room) {
            sendJson(ws, 'error:msg', { message: `Room "${code}" not found.` });
            return;
          }
          if (room.guest && room.guest.id !== clientId) {
            sendJson(ws, 'error:msg', { message: `Room "${code}" is already full.` });
            return;
          }
          room.guest = {
            id: clientId,
            name: String(payload?.playerName || 'Challenger 2P').slice(0, 32),
            fighterId: String(payload?.fighterId || 'yatra'),
            ready: false,
            ws,
            x: 920,
            y: 510,
            hp: 100,
            shakti: 0,
            lastUpdateAt: Date.now(),
          };
          room.status = 'READY_CHECK';
          currentRoomCode = code;
          logAudit('ROOM_JOINED', `${room.guest.name} joined room ${code}`);
          broadcastRoomState(room);
        } else if (type === 'matchmaking:join') {
          const existingIdx = matchmakingQueue.findIndex((p) => p.id === clientId);
          if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

          const seeker: RoomPlayer = {
            id: clientId,
            name: String(payload?.playerName || 'Contender').slice(0, 32),
            fighterId: String(payload?.fighterId || 'vikas'),
            ready: true,
            ws,
            x: 280,
            y: 510,
            hp: 100,
            shakti: 0,
            lastUpdateAt: Date.now(),
          };

          if (matchmakingQueue.length > 0) {
            const opponent = matchmakingQueue.shift()!;
            if (opponent.ws.readyState === WebSocket.OPEN && opponent.id !== clientId) {
              const code = generateRoomCode();
              seeker.x = 920;
              const room: GameRoom = {
                code,
                stage: 'sansad',
                isPrivate: false,
                status: 'PLAYING',
                host: opponent,
                guest: seeker,
                createdAt: Date.now(),
                seed: Math.floor(Math.random() * 100000),
              };
              rooms.set(code, room);
              currentRoomCode = code;
              logAudit('MATCHMAKING_PAIRED', `Paired ${opponent.name} vs ${seeker.name} in ${code}`);
              broadcastRoomState(room);
              const startPayload = {
                code,
                stage: room.stage,
                seed: room.seed,
                host: { id: room.host.id, name: room.host.name, fighterId: room.host.fighterId },
                guest: { id: room.guest!.id, name: room.guest!.name, fighterId: room.guest!.fighterId },
              };
              sendJson(room.host.ws, 'game:start', { ...startPayload, yourSlot: 'p1' });
              sendJson(room.guest!.ws, 'game:start', { ...startPayload, yourSlot: 'p2' });
              return;
            }
          }

          matchmakingQueue.push(seeker);
          sendJson(ws, 'matchmaking:queued', { position: matchmakingQueue.length });
        } else if (type === 'matchmaking:leave') {
          const idx = matchmakingQueue.findIndex((p) => p.id === clientId);
          if (idx !== -1) matchmakingQueue.splice(idx, 1);
          sendJson(ws, 'matchmaking:left', {});
        } else if (type === 'player:select') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;
          const isHost = room.host.id === clientId;
          const target = isHost ? room.host : room.guest;
          if (!target) return;

          if (payload?.fighterId) target.fighterId = String(payload.fighterId);
          if (isHost && payload?.stage) room.stage = String(payload.stage);
          if (typeof payload?.ready === 'boolean') target.ready = payload.ready;

          if (room.host.ready && room.guest && room.guest.ready) {
            room.status = 'PLAYING';
            broadcastRoomState(room);
            const startPayload = {
              code: room.code,
              stage: room.stage,
              seed: room.seed,
              host: { id: room.host.id, name: room.host.name, fighterId: room.host.fighterId },
              guest: { id: room.guest.id, name: room.guest.name, fighterId: room.guest.fighterId },
            };
            sendJson(room.host.ws, 'game:start', { ...startPayload, yourSlot: 'p1' });
            sendJson(room.guest.ws, 'game:start', { ...startPayload, yourSlot: 'p2' });
          } else {
            broadcastRoomState(room);
          }
        } else if (type === 'game:state') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room || !room.guest) return;

          const isHost = room.host.id === clientId;
          const sender = isHost ? room.host : room.guest;
          const receiver = isHost ? room.guest : room.host;

          // Authoritative Anti-Cheat Clamping on Position & Speed
          const rawX = Number(payload?.x ?? sender.x);
          const rawY = Number(payload?.y ?? sender.y);
          const clampedX = Math.max(70, Math.min(1130, rawX));
          const clampedY = Math.max(120, Math.min(510, rawY));

          // Speed-hack guard: if jump in X is implausibly huge (> 180px in one tick), clamp delta
          const deltaX = Math.abs(clampedX - sender.x);
          sender.x = deltaX > 180 ? sender.x + Math.sign(clampedX - sender.x) * 32 : clampedX;
          sender.y = clampedY;
          sender.hp = Math.max(0, Math.min(100, Number(payload?.hp ?? sender.hp)));
          sender.shakti = Math.max(0, Math.min(100, Number(payload?.shakti ?? sender.shakti)));
          sender.lastUpdateAt = Date.now();

          sendJson(receiver.ws, 'game:sync', {
            slot: isHost ? 'p1' : 'p2',
            x: sender.x,
            y: sender.y,
            vx: Number(payload?.vx || 0),
            vy: Number(payload?.vy || 0),
            hp: sender.hp,
            shakti: sender.shakti,
            action: String(payload?.action || 'IDLE'),
            facing: Number(payload?.facing || 1),
            combo: Number(payload?.combo || 0),
            hitEvent: payload?.hitEvent || null,
          });
        } else if (type === 'game:rematch') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room || !room.guest) return;
          room.host.hp = 100;
          room.guest.hp = 100;
          room.status = 'PLAYING';
          const startPayload = {
            code: room.code,
            stage: room.stage,
            seed: Math.floor(Math.random() * 100000),
            host: { id: room.host.id, name: room.host.name, fighterId: room.host.fighterId },
            guest: { id: room.guest.id, name: room.guest.name, fighterId: room.guest.fighterId },
          };
          sendJson(room.host.ws, 'game:start', { ...startPayload, yourSlot: 'p1' });
          sendJson(room.guest.ws, 'game:start', { ...startPayload, yourSlot: 'p2' });
        } else if (type === 'room:leave') {
          if (currentRoomCode && rooms.has(currentRoomCode)) {
            const room = rooms.get(currentRoomCode)!;
            const other = room.host.id === clientId ? room.guest : room.host;
            if (other) {
              sendJson(other.ws, 'player:disconnected', { message: 'Opponent left the room.' });
            }
            rooms.delete(currentRoomCode);
            currentRoomCode = null;
          }
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    });

    ws.on('close', () => {
      const qIdx = matchmakingQueue.findIndex((p) => p.id === clientId);
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

      if (currentRoomCode && rooms.has(currentRoomCode)) {
        const room = rooms.get(currentRoomCode)!;
        const other = room.host.id === clientId ? room.guest : room.host;
        if (other) {
          sendJson(other.ws, 'player:disconnected', {
            message: 'Opponent connection dropped. Room closed.',
          });
        }
        rooms.delete(currentRoomCode);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`LokSabha Legends server running on http://localhost:${PORT}`);
  });
}

startServer();
