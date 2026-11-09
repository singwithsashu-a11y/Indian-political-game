import React, { useEffect, useState } from 'react';
import {
  PlayerProfileData,
  PlayerReportItem,
  GameConfigData,
  fetchLeaderboardFromDb,
  fetchAllReportsAdmin,
  updateReportStatusAdmin,
  toggleUserBanAdmin,
  saveGameConfigAdmin,
} from '../lib/firebase';

interface AdminDashboardModalProps {
  isAdminUser: boolean;
  gameConfig: GameConfigData;
  onConfigUpdated: (cfg: GameConfigData) => void;
  onClose: () => void;
}

interface ServerHealthData {
  status: string;
  uptimeSec: number;
  activeRooms: number;
  queueSize: number;
  onlinePlayers: number;
  verifiedMatchesCount: number;
  auditLogs: Array<{ id: string; time: string; event: string; detail: string }>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isAdminUser,
  gameConfig,
  onConfigUpdated,
  onClose,
}) => {
  const [health, setHealth] = useState<ServerHealthData | null>(null);
  const [usersList, setUsersList] = useState<PlayerProfileData[]>([]);
  const [reports, setReports] = useState<PlayerReportItem[]>([]);
  const [draftConfig, setDraftConfig] = useState<GameConfigData>(gameConfig);
  const [statusMsg, setStatusMsg] = useState('');

  const refreshAdminData = async () => {
    try {
      const hRes = await fetch('/api/health');
      if (hRes.ok) {
        setHealth(await hRes.json());
      }
      const lb = await fetchLeaderboardFromDb();
      setUsersList(lb);
      if (isAdminUser) {
        const rep = await fetchAllReportsAdmin();
        setReports(rep);
      }
    } catch (err) {
      console.error('Admin refresh error:', err);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, [isAdminUser]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    onConfigUpdated(draftConfig);
    if (isAdminUser) {
      try {
        await saveGameConfigAdmin(draftConfig);
        setStatusMsg('Global game configuration saved to Firestore.');
      } catch {
        setStatusMsg('Applied configuration locally for current session.');
      }
    } else {
      setStatusMsg('Applied configuration locally for current session.');
    }
  };

  const handleBanToggle = async (u: PlayerProfileData) => {
    if (!isAdminUser) return;
    try {
      await toggleUserBanAdmin(u.uid, !u.isBanned);
      setStatusMsg(`Updated moderation status for ${u.username}.`);
      refreshAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!isAdminUser) return;
    try {
      await updateReportStatusAdmin(reportId, status);
      setStatusMsg(`Report ${reportId} marked as ${status}.`);
      refreshAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#18120E] border border-white/15 rounded-2xl max-w-6xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">
              SANSAD SPEAKER ADMIN & TELEMETRY CONSOLE
            </h2>
            <p className="text-xs text-slate-400">
              {isAdminUser
                ? 'Authenticated Speaker Admin Access (Full RBAC Write Privileges)'
                : 'Read-Only Observer Mode (Sign in with Speaker Admin account for moderation writes)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {statusMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-2 rounded-lg text-xs font-mono">
              {statusMsg}
            </div>
          )}

          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#120A06] border border-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-400">ONLINE PLAYERS / ROOMS</div>
              <div className="font-mono text-2xl font-bold text-[#FF9933] tabular-nums mt-1">
                {health?.onlinePlayers ?? 1} Players · {health?.activeRooms ?? 0} Rooms
              </div>
            </div>
            <div className="bg-[#120A06] border border-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-400">VERIFIED MATCHES</div>
              <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                {health?.verifiedMatchesCount ?? 0}
              </div>
            </div>
            <div className="bg-[#120A06] border border-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-400">REGISTERED NETAS</div>
              <div className="font-mono text-2xl font-bold text-cyan-400 tabular-nums mt-1">
                {usersList.length}
              </div>
            </div>
            <div className="bg-[#120A06] border border-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-400">SERVER UPTIME</div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums mt-1">
                {health?.uptimeSec ?? 0}s
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Game Balance & Live Configuration */}
            <form
              onSubmit={handleSaveConfig}
              className="lg:col-span-5 bg-[#120A06] border border-white/10 rounded-xl p-5 space-y-4"
            >
              <h3 className="font-display text-lg font-bold text-[#FF9933]">
                LIVE GAME BALANCE CONFIGURATION
              </h3>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Round Timer Duration (Seconds: 30–180)
                </label>
                <input
                  type="number"
                  min={30}
                  max={180}
                  value={draftConfig.roundTimeSec}
                  onChange={(e) =>
                    setDraftConfig({ ...draftConfig, roundTimeSec: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Shakti Meter Gain Multiplier (0.5x – 3.0x)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={0.5}
                  max={3.0}
                  value={draftConfig.shaktiGainMultiplier}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      shaktiGainMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Ahinsa Boss Peace Speed Multiplier (0.5x – 3.0x)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={0.5}
                  max={3.0}
                  value={draftConfig.ahinsaSpeedMultiplier}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      ahinsaSpeedMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Parliamentary Ticker Announcement Banner
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={draftConfig.announcement}
                  onChange={(e) =>
                    setDraftConfig({ ...draftConfig, announcement: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-display font-bold text-sm rounded-lg cursor-pointer"
              >
                APPLY BALANCE PARAMETERS
              </button>
            </form>

            {/* Server Anti-Cheat & Audit Logs */}
            <div className="lg:col-span-7 bg-[#120A06] border border-white/10 rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-bold text-white">
                  AUTHORITATIVE ANTI-CHEAT & MATCH AUDIT LOGS
                </h3>
                <button
                  type="button"
                  onClick={refreshAdminData}
                  className="px-2.5 py-1 text-xs font-mono bg-white/10 hover:bg-white/20 rounded text-slate-200 cursor-pointer"
                >
                  REFRESH
                </button>
              </div>
              <div className="flex-1 max-h-64 overflow-y-auto space-y-1.5 font-mono text-xs bg-black/50 p-3 rounded-lg border border-white/10">
                {health?.auditLogs && health.auditLogs.length > 0 ? (
                  health.auditLogs.map((log) => (
                    <div key={log.id} className="text-slate-300 border-b border-white/5 pb-1">
                      <span className="text-slate-500">[{log.time.slice(11, 19)}]</span>{' '}
                      <span className="text-[#FF9933] font-bold">{log.event}</span> · {log.detail}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No audit events recorded yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Player Moderation & Reports Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#120A06] border border-white/10 rounded-xl p-5">
              <h3 className="font-display text-lg font-bold text-white mb-3">
                PLAYER DIRECTORY & MODERATION
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 font-mono border-b border-white/10">
                    <tr>
                      <th className="py-2">Player</th>
                      <th className="py-2">ELO · W/L</th>
                      <th className="py-2">Level</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {usersList.map((u) => (
                      <tr key={u.uid}>
                        <td className="py-2 font-medium text-white">{u.username}</td>
                        <td className="py-2 font-mono tabular-nums text-slate-300">
                          {u.elo} · {u.wins}W/{u.losses}L
                        </td>
                        <td className="py-2 font-mono tabular-nums text-amber-300">
                          Lv.{u.level}
                        </td>
                        <td className="py-2 text-right">
                          {isAdminUser ? (
                            <button
                              type="button"
                              onClick={() => handleBanToggle(u)}
                              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded font-mono text-[11px] cursor-pointer"
                            >
                              {u.isBanned ? 'UNBAN' : 'SUSPEND'}
                            </button>
                          ) : (
                            <span className="text-slate-500 font-mono">ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#120A06] border border-white/10 rounded-xl p-5">
              <h3 className="font-display text-lg font-bold text-white mb-3">
                PLAYER INCIDENT REPORTS
              </h3>
              {reports.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No open incident reports requiring moderation.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {reports.map((r) => (
                    <div
                      key={r.reportId}
                      className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="text-xs">
                        <div className="font-bold text-white">
                          Reported: {r.reportedName} · Status: {r.status.toUpperCase()}
                        </div>
                        <div className="text-slate-400">{r.reason}</div>
                      </div>
                      {isAdminUser && r.status === 'open' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResolveReport(r.reportId, 'resolved')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-mono cursor-pointer"
                          >
                            RESOLVE
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveReport(r.reportId, 'dismissed')}
                            className="px-2 py-1 bg-white/10 text-slate-300 rounded text-[11px] font-mono cursor-pointer"
                          >
                            DISMISS
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
