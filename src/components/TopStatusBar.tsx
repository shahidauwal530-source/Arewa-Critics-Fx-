import React from 'react';
import { MarketSessionInfo } from '../types/forex';

interface TopStatusBarProps {
  session: MarketSessionInfo;
  onOpenTestOverride: () => void;
  isOverrideActive: boolean;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  session,
  onOpenTestOverride,
  isOverrideActive,
}) => {
  return (
    <div className="w-full bg-[#141414] border-b border-[#2A2A2A] px-4 py-2 flex items-center justify-between text-xs">
      {/* Left: Session Indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: session.color }}
        />
        <div className="flex items-center gap-1.5 truncate">
          <span
            className="font-bold text-[11px] tracking-wide uppercase truncate"
            style={{ color: session.color }}
          >
            {session.type === 'OFF_HOURS' ? 'NOW: Market Closed' : `${session.name}`}
          </span>
          {session.type !== 'OFF_HOURS' && (
            <span className="text-[10px] text-gray-400 font-medium truncate">
              - {session.subtext}
            </span>
          )}
        </div>
      </div>

      {/* Right: Test Override button in yellow underline */}
      <div className="flex items-center gap-2 shrink-0">
        {isOverrideActive && (
          <span className="bg-[#FFD700]/20 text-[#FFD700] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#FFD700]/40 animate-pulse">
            OVERRIDE ON
          </span>
        )}
        <button
          onClick={onOpenTestOverride}
          className="text-[#FFD700] hover:text-[#FFE34D] text-[11px] font-bold underline underline-offset-4 cursor-pointer transition-colors"
        >
          Test Override
        </button>
      </div>
    </div>
  );
};
