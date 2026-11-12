import React from 'react';
import { ChecklistEvaluation } from '../types/forex';
import { calculatePips } from '../utils/livePrice';

interface WaitingSetupCardProps {
  livePrice: number | null;
  isLoading: boolean;
  isOffline: boolean;
  errorMessage?: string;
  source: string;
  timestampWAT: string;
  evaluation: ChecklistEvaluation;
}

export const WaitingSetupCard: React.FC<WaitingSetupCardProps> = ({
  livePrice,
  isLoading,
  isOffline,
  errorMessage,
  source,
  timestampWAT,
  evaluation,
}) => {
  const isSignalReady = evaluation.totalScore >= 80;
  const isMedium = evaluation.totalScore >= 60 && evaluation.totalScore < 80;

  // Both Entry and Live Price must show the real live price as instructed:
  // "Entry [LIVE Price] | Live Price [LIVE Price] | Distance [X] pips - FRESH ✅" - BOTH MUST BE SAME LIVE PRICE FROM API.
  const priceDisplay = livePrice !== null ? livePrice.toFixed(2) : null;
  const distancePips = 0; // Distance from Live Price to Entry is 0 pips when fresh at live entry

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 shadow-sm space-y-2.5">
      {/* Top row: Left "WAITING SETUP" yellow bold, middle "15M ENGINE" grey, Right red pill "WAIT (NO ORDER)" or green pill "SIGNAL READY" */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#FFD700] font-extrabold tracking-wider text-xs uppercase">
            WAITING SETUP
          </span>
          <span className="text-gray-400 font-semibold text-[11px]">
            15M ENGINE
          </span>
        </div>

        {/* Right pill */}
        <div>
          {evaluation.isBlockedByHiddenScan ? (
            <span className="bg-[#FF3333]/25 border border-[#FF3333] text-[#FF3333] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span>🚫</span> BLOCKED
            </span>
          ) : isSignalReady ? (
            <span className="bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              SIGNAL READY
            </span>
          ) : isMedium ? (
            <span className="bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              MEDIUM SIGNAL
            </span>
          ) : (
            <span className="bg-[#FF3333]/20 border border-[#FF3333]/50 text-[#FF3333] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              WAIT (NO ORDER)
            </span>
          )}
        </div>
      </div>

      {/* Middle row: Live price display */}
      <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5 text-center">
        {isOffline ? (
          <div className="py-1">
            <p className="text-[#FF3333] font-bold text-xs uppercase tracking-wide">
              {errorMessage || 'LIVE PRICE OFFLINE - CHECK INTERNET / API KEY'}
            </p>
            <p className="text-gray-400 text-[10px] mt-0.5">
              Retrying live connection every 15s...
            </p>
          </div>
        ) : isLoading && !priceDisplay ? (
          <div className="py-1 space-y-0.5">
            <p className="text-[#FFD700] font-bold text-xs tracking-wider animate-pulse">
              CONNECTING TO LIVE PRICE...
            </p>
            <p className="text-gray-400 text-[10px]">
              WAITING FOR LIVE DATA
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-xs">
            <span className="text-gray-300">
              Entry <strong className="text-white text-sm tabular-nums">${priceDisplay}</strong>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">
              Live Price <strong className="text-[#00FF88] text-sm tabular-nums">${priceDisplay}</strong>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">
              Distance <strong className="text-[#FFD700] tabular-nums">{distancePips} pips</strong>
            </span>
            <span className="text-[#00FF88] text-[10px] font-bold">
              - FRESH ✅
            </span>
          </div>
        )}
      </div>

      {/* Bottom: STATUS: WAIT + LIVE ● Last Updated: 09:12:30 WAT - Source: TwelveData */}
      <div className="flex items-center justify-between text-[11px] pt-0.5">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-gray-400">STATUS:</span>
          <span
            className={
              evaluation.isBlockedByHiddenScan
                ? 'text-[#FF3333]'
                : isSignalReady
                ? 'text-[#00FF88]'
                : isMedium
                ? 'text-[#FFD700]'
                : 'text-[#FF3333]'
            }
          >
            {evaluation.isBlockedByHiddenScan
              ? 'WAIT (BLOCKED)'
              : isSignalReady
              ? 'SIGNAL READY'
              : isMedium
              ? 'MEDIUM'
              : 'WAIT'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] inline-block" />
          <span>
            LIVE ● Last Updated: <strong className="text-gray-200 font-mono">{timestampWAT}</strong>
          </span>
          <span>-</span>
          <span className="text-gray-300 truncate max-w-[110px]" title={source}>
            {source}
          </span>
        </div>
      </div>
    </div>
  );
};
