import React from 'react';
import { SignalGrade, SignalStrength, SignalType } from '../types/forex';

interface BigSignalDisplayProps {
  signalType: SignalType;
  strength: SignalStrength;
  score: number;
  grade: SignalGrade;
  isBlocked?: boolean;
  blockReason?: string | null;
}

export const BigSignalDisplay: React.FC<BigSignalDisplayProps> = ({
  signalType,
  strength,
  score,
  grade,
  isBlocked,
  blockReason,
}) => {
  // Color configuration:
  // WAIT / BLOCKED: #FFD700
  // SELL: #FF3333
  // BUY: #00FF88
  const isWait = isBlocked || signalType === 'WAIT';
  const isSell = !isBlocked && signalType === 'SELL';
  const isBuy = !isBlocked && signalType === 'BUY';

  const mainColor = isWait ? '#FFD700' : isSell ? '#FF3333' : '#00FF88';
  const displayText = isWait ? 'WAIT' : isSell ? 'SELL' : 'BUY';

  const badgeBg = isBlocked
    ? 'bg-[#FF3333]/15 border-[#FF3333]'
    : grade === 'A'
    ? 'bg-[#00FF88]/15 border-[#00FF88]'
    : grade === 'B'
    ? 'bg-[#FFD700]/15 border-[#FFD700]'
    : 'bg-[#FF3333]/15 border-[#FF3333]';

  const badgeTextColor = isBlocked
    ? 'text-[#FF3333]'
    : grade === 'A'
    ? 'text-[#00FF88]'
    : grade === 'B'
    ? 'text-[#FFD700]'
    : 'text-[#FF3333]';

  const scoreDescription = isBlocked
    ? 'BLOCKED BY SCAN'
    : grade === 'A'
    ? 'STRONG SIGNAL'
    : grade === 'B'
    ? 'MEDIUM SIGNAL'
    : 'WAITING SETUP';

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 shadow-md flex items-center justify-between gap-4">
      {/* Left: Huge text "WAIT" 80px / "SELL" / "BUY" */}
      <div className="flex-1 min-w-0">
        <div
          className="font-black text-6xl sm:text-7xl tracking-tighter leading-none select-none transition-colors duration-300"
          style={{ color: mainColor }}
        >
          {displayText}
        </div>
        <p className="text-[11px] font-semibold tracking-wide mt-1 uppercase truncate max-w-[220px]" style={{ color: isBlocked ? '#FF3333' : '#9CA3AF' }}>
          {isBlocked
            ? `BLOCKED: ${blockReason || 'Safety Filter Active'}`
            : isWait
            ? 'Setup Not Met - Stand Aside'
            : `${strength} Day Trade Order`}
        </p>
      </div>

      {/* Right: Box: "D - SCORE: 20/100 - WAITING SETUP" or "A - SCORE: 85/100 - STRONG SIGNAL" */}
      <div
        className={`p-3 rounded-xl border text-right shrink-0 max-w-[170px] ${badgeBg}`}
      >
        <div className={`font-mono text-sm font-black tracking-tight ${badgeTextColor}`}>
          {grade} - SCORE: {score}/100
        </div>
        <div className={`text-[10px] font-extrabold uppercase tracking-wider mt-0.5 ${badgeTextColor}`}>
          {scoreDescription}
        </div>
        <div className="text-[9px] text-gray-400 mt-1 leading-tight font-medium">
          {score >= 80 ? 'Full TP Target' : score >= 60 ? '0.01 Lot Conservative' : 'Patience Pays'}
        </div>
      </div>
    </div>
  );
};
