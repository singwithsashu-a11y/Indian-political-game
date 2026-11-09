import React, { useState } from 'react';
import { FighterConfig } from '../game/fighters';

interface FighterAvatarProps {
  fighter: FighterConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FighterAvatar: React.FC<FighterAvatarProps> = ({
  fighter,
  className = '',
  size = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const dims =
    size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-24 h-24' : 'w-14 h-14';

  if (fighter.portraitUrl && !imgFailed) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-[#1A120E] border border-white/15 shrink-0 ${dims} ${className}`}
        style={{ borderColor: `${fighter.accent}66` }}
      >
        <img
          src={fighter.portraitUrl}
          alt={fighter.name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-[#1A120E] border border-white/15 flex items-center justify-center shrink-0 ${dims} ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 35%, ${fighter.accent}35, #120A06 85%)`,
        borderColor: `${fighter.accent}66`,
      }}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full">
        {/* Shoulders / Kurta */}
        <path
          d="M12 78 C14 56, 66 56, 68 78 Z"
          fill={fighter.accent}
          stroke="#120A06"
          strokeWidth="2.5"
        />
        <path
          d="M28 58 L40 72 L52 58"
          fill={fighter.secondaryColor}
          stroke="#120A06"
          strokeWidth="1.5"
        />
        {/* Head */}
        <circle
          cx="40"
          cy="36"
          r="17"
          fill={fighter.skinTone}
          stroke="#120A06"
          strokeWidth="2.5"
        />
        {/* Headgear / Distinct Caricature Traits */}
        {fighter.headgear === 'glasses_beard' && (
          <>
            <path d="M23 30 Q40 12 57 30" fill="#F1F5F9" />
            <path d="M24 40 Q40 62 56 40 Q48 54 40 55 Q32 54 24 40 Z" fill="#F8FAFC" />
            <circle cx="33" cy="34" r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="47" cy="34" r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />
            <line x1="38" y1="34" x2="42" y2="34" stroke="#F59E0B" strokeWidth="2" />
          </>
        )}
        {fighter.headgear === 'headband' && (
          <>
            <path d="M22 28 Q40 10 58 28" fill="#1E293B" />
            <rect x="23" y="24" width="34" height="5" rx="2" fill="#2E9BFF" />
            <circle cx="34" cy="35" r="2.2" fill="#0F172A" />
            <circle cx="46" cy="35" r="2.2" fill="#0F172A" />
            <path d="M34 44 Q40 48 46 44" fill="none" stroke="#0F172A" strokeWidth="2" />
          </>
        )}
        {fighter.headgear === 'bun_saree' && (
          <>
            <circle cx="40" cy="15" r="8" fill="#0F172A" />
            <path d="M23 32 Q40 14 57 32" fill="#0F172A" />
            <circle cx="40" cy="29" r="2" fill="#E11D48" />
            <circle cx="34" cy="35" r="2.2" fill="#0F172A" />
            <circle cx="46" cy="35" r="2.2" fill="#0F172A" />
            <path d="M34 44 Q40 42 46 44" fill="none" stroke="#0F172A" strokeWidth="2" />
          </>
        )}
        {fighter.headgear === 'pompadour' && (
          <>
            <path d="M20 28 Q35 8 60 22 Q54 30 23 28 Z" fill="#FACC15" />
            <circle cx="34" cy="35" r="2.2" fill="#0F172A" />
            <circle cx="46" cy="35" r="2.2" fill="#0F172A" />
            <circle cx="40" cy="45" r="3" fill="#7F1D1D" />
          </>
        )}
        {fighter.headgear === 'saffron_robe' && (
          <>
            <circle cx="40" cy="29" r="2.2" fill="#EF4444" />
            <circle cx="34" cy="35" r="2.4" fill="#0F172A" />
            <circle cx="46" cy="35" r="2.4" fill="#0F172A" />
            <path d="M33 45 L47 45" stroke="#0F172A" strokeWidth="2.5" />
          </>
        )}
        {fighter.headgear === 'gandhi_sage' && (
          <>
            <circle cx="40" cy="36" r="24" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="33" cy="35" r="5.5" fill="none" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="47" cy="35" r="5.5" fill="none" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="38.5" y1="35" x2="41.5" y2="35" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M33 45 Q40 49 47 45" fill="none" stroke="#F8FAFC" strokeWidth="2" />
          </>
        )}
        {!['glasses_beard', 'headband', 'bun_saree', 'pompadour', 'saffron_robe', 'gandhi_sage'].includes(
          fighter.headgear
        ) && (
          <>
            <path d="M23 27 Q40 13 57 27" fill="#334155" />
            <circle cx="34" cy="35" r="2.3" fill="#0F172A" />
            <circle cx="46" cy="35" r="2.3" fill="#0F172A" />
            <path d="M33 44 Q40 47 47 44" fill="none" stroke="#0F172A" strokeWidth="2.2" />
          </>
        )}
      </svg>
    </div>
  );
};
