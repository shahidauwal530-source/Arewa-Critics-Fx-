import React from 'react';

interface HtfBiasRowProps {
  h4Trend: 'UPTREND' | 'DOWNTREND' | 'UNCLEAR';
  d1Trend: 'UPTREND' | 'DOWNTREND';
}

export const HtfBiasRow: React.FC<HtfBiasRowProps> = ({ h4Trend, d1Trend }) => {
  const isSellOnly = h4Trend === 'DOWNTREND';

  return (
    <div className="w-full bg-[#161616] border border-[#282828] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-extrabold uppercase text-[11px] tracking-wider">
          HTF BIAS:
        </span>

        {/* Pill: SELL ONLY red if H4 Down, BUY ONLY green if H4 Up */}
        {isSellOnly ? (
          <span className="bg-[#FF3333]/20 border border-[#FF3333]/60 text-[#FF3333] font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            SELL ONLY
          </span>
        ) : (
          <span className="bg-[#00FF88]/20 border border-[#00FF88]/60 text-[#00FF88] font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            BUY ONLY
          </span>
        )}
      </div>

      {/* Text: (H4 DOWNTREND - D1 DOWNTREND) */}
      <div className="text-[10px] text-gray-400 font-mono font-semibold truncate">
        ({h4Trend} - {d1Trend})
      </div>
    </div>
  );
};
