import React from 'react';
import { motion } from 'motion/react';
import { FighterConfig } from '../game/fighters';
import { MatchCompletionPayload } from '../game/ArenaCanvas';
import { FighterAvatar } from './FighterAvatar';

interface NewspaperResultProps {
  result: MatchCompletionPayload;
  p1: FighterConfig;
  p2: FighterConfig;
  stageName: string;
  xpEarned: number;
  coinsEarned: number;
  eloDelta: number;
  verifiedSignature: string;
  onRematch: () => void;
  onCharacterSelect: () => void;
}

export const NewspaperResult: React.FC<NewspaperResultProps> = ({
  result,
  p1,
  p2,
  stageName,
  xpEarned,
  coinsEarned,
  eloDelta,
  verifiedSignature,
  onRematch,
  onCharacterSelect,
}) => {
  const winner = result.userWon ? p1 : p2;
  const loser = result.userWon ? p2 : p1;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#120A06] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-6">
        {/* Vintage Satirical Newspaper Front Page (`#result` / `.paper`) */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#F4EAD5] text-[#1C1613] rounded-xl p-6 md:p-8 shadow-2xl border-4 border-[#2A1F1A]"
        >
          {/* Winner / Defeated Rubber Stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 2.35, rotate: -22 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 18,
              delay: 0.28,
            }}
            className={`absolute top-5 right-5 border-4 px-4 py-1 font-display text-2xl md:text-3xl font-bold tracking-widest shadow-md ${
              result.userWon
                ? 'border-emerald-700 text-emerald-800 bg-emerald-100/95'
                : 'border-rose-700 text-rose-800 bg-rose-100/95'
            }`}
          >
            {result.ahinsaVictory
              ? 'AHINSA VICTORY!'
              : result.userWon
              ? 'YOU WIN!'
              : 'KURSI LOST!'}
          </motion.div>

          {/* Masthead */}
          <div className="text-center border-b-2 border-[#1C1613] pb-3 mb-3">
            <p className="font-mono text-xs tracking-widest text-[#574840]">
              SPECIAL PARLIAMENTARY EDITION · REGISTERED SATIRE GAZETTE
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-[#120A06] mt-1">
              THE DAILY JUMLA
            </h1>
            <div className="mt-2 pt-1.5 border-t border-[#1C1613]/30 flex flex-wrap items-center justify-between text-xs font-mono text-[#4A3B32]">
              <span>NEW DELHI · {stageName}</span>
              <span>{dateStr}</span>
              <span>PRICE: 2 SAMOSAS</span>
            </div>
          </div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl md:text-4xl font-bold leading-tight text-[#120A06] mb-4 text-balance"
          >
            {result.headline}
          </motion.h2>

          {/* Newspaper 2-Column Editorial Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-t border-[#1C1613]/25 pt-4">
            {/* Winner Feature Box */}
            <div className="md:col-span-5 bg-[#E6D7B8] border border-[#1C1613]/30 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FighterAvatar fighter={winner} size="lg" />
                <div>
                  <div className="text-xs font-mono text-[#574840]">VICTORIOUS NETA</div>
                  <div className="font-display text-2xl font-bold text-[#120A06]">
                    {winner.name}
                  </div>
                  <div className="text-xs text-[#4A3B32]">{winner.party}</div>
                </div>
              </div>
              <p className="text-xs italic text-[#2D231E] border-t border-[#1C1613]/20 pt-2">
                &ldquo;{result.subheadline}&rdquo;
              </p>
            </div>

            {/* Columns: Excuse & Match Telemetry */}
            <div className="md:col-span-7 space-y-3 text-sm leading-relaxed text-[#2D231E]">
              <p className="font-semibold text-[#120A06]">
                <strong>OPPOSITION EXCUSE DESK ({loser.name}):</strong> &ldquo;
                {result.loserExcuse}&rdquo;
              </p>
              <p className="text-xs text-[#4A3B32]">
                Sources confirm the chai bhaiya in the gallery has demanded compensation for
                broken kulhads. A stray microphone that flew across the podium was later seen in
                a sub-committee meeting. Exit polls, as usual, predicted a tie.
              </p>

              {/* Verified Match Telemetry & Rewards */}
              <div className="pt-2 border-t border-[#1C1613]/25 font-mono text-xs text-[#1C1613] space-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>ROUNDS: {result.roundsWonP1} - {result.roundsWonP2}</span>
                  <span>·</span>
                  <span>TIME: {result.durationSec}s</span>
                  <span>·</span>
                  <span>MAX COMBO: {result.maxCombo} HITS</span>
                  <span>·</span>
                  <span>DMG: {result.damageDealt}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-emerald-900 font-bold">
                  <span>REWARD: +{xpEarned} XP</span>
                  <span>·</span>
                  <span>+{coinsEarned} KURSI COINS</span>
                  <span>·</span>
                  <span>ELO: {eloDelta >= 0 ? `+${eloDelta}` : eloDelta}</span>
                  {verifiedSignature && (
                    <>
                      <span>·</span>
                      <span className="text-[11px] font-normal text-[#574840]">
                        VERIFIED ({verifiedSignature})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons (`#rematch-btn` & `#select-btn`) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onRematch}
            className="px-8 py-3.5 bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-display font-bold text-xl tracking-wide rounded-xl shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            REMATCH NOW
          </button>
          <button
            type="button"
            onClick={onCharacterSelect}
            className="px-6 py-3.5 bg-[#1E1612] hover:bg-[#2A1F1A] text-white border border-white/15 font-display font-bold text-xl tracking-wide rounded-xl cursor-pointer transition-colors"
          >
            CHARACTER SELECT
          </button>
        </div>
      </div>
    </div>
  );
};
