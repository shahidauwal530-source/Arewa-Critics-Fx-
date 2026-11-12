import React from 'react';

interface IndicatorsGridProps {
  h4Trend: 'UPTREND' | 'DOWNTREND' | 'UNCLEAR';
  emaStatus: 'BELOW' | 'ABOVE' | 'BETWEEN';
  rsiValue: number;
  rsiDirection: 'TURNING_DOWN' | 'TURNING_UP' | 'MIDDLE';
  m15Candle: string;
}

export const IndicatorsGrid: React.FC<IndicatorsGridProps> = ({
  h4Trend,
  emaStatus,
  rsiValue,
  rsiDirection,
  m15Candle,
}) => {
  // RSI status text
  const rsiStatusText =
    rsiValue >= 60
      ? `${rsiValue} - Overbought`
      : rsiValue <= 40
      ? `${rsiValue} - Oversold`
      : `${rsiValue} - Middle`;

  return (
    <div className="w-full grid grid-cols-2 gap-2.5">
      {/* 1. TREND H4 */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          TREND H4
        </span>
        <div className="mt-1">
          <span
            className={`font-black text-sm tracking-wide ${
              h4Trend === 'DOWNTREND' ? 'text-[#FF3333]' : 'text-[#00FF88]'
            }`}
          >
            {h4Trend}
          </span>
          <p className="text-[9px] text-gray-400 mt-0.5">H4 50 EMA Slope</p>
        </div>
      </div>

      {/* 2. EMA 20/50 */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          EMA 20/50
        </span>
        <div className="mt-1">
          <span
            className={`font-black text-sm tracking-wide ${
              emaStatus === 'BELOW'
                ? 'text-[#FF3333]'
                : emaStatus === 'ABOVE'
                ? 'text-[#00FF88]'
                : 'text-[#FFD700]'
            }`}
          >
            {emaStatus}
          </span>
          <p className="text-[9px] text-gray-400 mt-0.5">
            {emaStatus === 'BETWEEN' ? 'Chop Zone (No Trade)' : 'Clear Alignment'}
          </p>
        </div>
      </div>

      {/* 3. RSI 14 */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          RSI 14
        </span>
        <div className="mt-1">
          <span
            className={`font-black text-sm tracking-wide ${
              rsiValue >= 60
                ? 'text-[#FF3333]'
                : rsiValue <= 40
                ? 'text-[#00FF88]'
                : 'text-gray-300'
            }`}
          >
            {rsiStatusText}
          </span>
          <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
            {rsiDirection === 'TURNING_DOWN'
              ? 'Turning Down ↘'
              : rsiDirection === 'TURNING_UP'
              ? 'Turning Up ↗'
              : 'Flat / Ranging'}
          </p>
        </div>
      </div>

      {/* 4. M15 CANDLE */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          M15 CANDLE
        </span>
        <div className="mt-1">
          <span
            className={`font-black text-xs sm:text-sm tracking-tight truncate block ${
              m15Candle.includes('Bearish') || m15Candle.includes('Shooting')
                ? 'text-[#FF3333]'
                : m15Candle.includes('Bullish') || m15Candle.includes('Hammer')
                ? 'text-[#00FF88]'
                : 'text-gray-400'
            }`}
            title={m15Candle}
          >
            {m15Candle}
          </span>
          <p className="text-[9px] text-gray-400 mt-0.5">Confirmation Pattern</p>
        </div>
      </div>
    </div>
  );
};
