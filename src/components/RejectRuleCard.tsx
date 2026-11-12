import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RejectRuleState } from '../types/forex';

interface RejectRuleCardProps {
  rejectRule: RejectRuleState;
}

export const RejectRuleCard: React.FC<RejectRuleCardProps> = ({ rejectRule }) => {
  if (!rejectRule.isTriggered) {
    return null;
  }

  const isDowntrend = rejectRule.h4Trend === 'DOWNTREND';

  return (
    <div className="w-full bg-[#1A1A1A] border-2 border-[#FF3333] rounded-xl p-3.5 shadow-lg shadow-red-950/20 space-y-2.5 animate-in fade-in duration-300">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#FFD700] shrink-0" />
          <h3 className="text-[#FFD700] font-extrabold text-xs tracking-wider uppercase">
            REJECT RULE: M5 OPPOSITE TO H4 TREND
          </h3>
        </div>

        {/* Right small box: H4 DOWNTREND (SELL ONLY) red */}
        <div className="bg-[#FF3333]/20 border border-[#FF3333] px-2 py-0.5 rounded text-[10px] font-black text-[#FF3333] shrink-0 uppercase tracking-tight">
          {isDowntrend ? 'H4 DOWNTREND (SELL ONLY)' : 'H4 UPTREND (BUY ONLY)'}
        </div>
      </div>

      {/* Big white text */}
      <div className="bg-[#121212] border border-[#333333] rounded-lg p-3 text-center">
        <p className="text-white font-extrabold text-sm sm:text-base tracking-wide">
          {rejectRule.expectedSetup}
        </p>
      </div>

      {/* Small text explanation */}
      <p className="text-xs text-gray-300 font-medium leading-relaxed">
        {rejectRule.explanation}
      </p>
    </div>
  );
};
