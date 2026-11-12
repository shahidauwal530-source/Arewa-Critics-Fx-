import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { formatWATTime } from '../utils/watTime';

interface SignalActiveCardProps {
  lockUntilUTC: number;
  isActive: boolean;
  onUnlock?: () => void;
}

export const SignalActiveCard: React.FC<SignalActiveCardProps> = ({
  lockUntilUTC,
  isActive,
  onUnlock,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, lockUntilUTC - Date.now());
      setTimeLeftMs(remaining);
      if (remaining === 0 && onUnlock) {
        onUnlock();
      }
    }, 1000);

    setTimeLeftMs(Math.max(0, lockUntilUTC - Date.now()));
    return () => clearInterval(interval);
  }, [lockUntilUTC, isActive, onUnlock]);

  if (!isActive || timeLeftMs <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const lockedUntilTime = formatWATTime(new Date(lockUntilUTC));

  return (
    <div className="w-full bg-[#1A1A1A] border-2 border-[#FFD700] rounded-xl p-3.5 shadow-lg shadow-yellow-950/20 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[#FFD700] font-black text-xs uppercase tracking-wider">
              SIGNAL ACTIVE
            </h3>
            <p className="text-[10px] text-gray-300">
              Locked until <strong className="text-white font-mono">{lockedUntilTime}</strong>
            </p>
          </div>
        </div>

        {/* Live Countdown Timer Badge */}
        <div className="bg-[#111111] border border-[#FFD700]/40 px-2.5 py-1 rounded-lg text-right">
          <div className="text-[9px] text-gray-400 uppercase font-semibold">
            LOCK EXPIRES IN
          </div>
          <div className="font-mono text-sm font-black text-[#FFD700] tabular-nums">
            {formattedCountdown}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 font-medium">
        No new signal until this expires. One high-probability trade per cycle to prevent overtrading.
      </p>
    </div>
  );
};
