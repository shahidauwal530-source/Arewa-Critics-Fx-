import React, { useState } from 'react';
import { Copy, Check, TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { SignalParameters } from '../types/forex';
import { calculatePips, formatPips } from '../utils/livePrice';

interface SignalDetailsCardProps {
  signalParams: SignalParameters;
  livePrice: number;
}

export const SignalDetailsCard: React.FC<SignalDetailsCardProps> = ({
  signalParams,
  livePrice,
}) => {
  const [copied, setCopied] = useState(false);

  const {
    pair,
    signalType,
    decision,
    grade,
    score,
    entryPrice,
    stopLossPrice,
    riskPips,
    riskUsd,
    lotSize,
    tpLevels,
    totalPotentialPips,
    totalPotentialUsd,
    directDistancePips,
    timestampWAT,
    warningMessage,
  } = signalParams;

  // Real-time dynamic distance calculations from current LIVE Price
  const distanceToEntryPips = calculatePips(livePrice, entryPrice);
  const tp1Price = tpLevels[0]?.price || entryPrice;
  const tp6Price = tpLevels[tpLevels.length - 1]?.price || entryPrice;

  // Distance to TP6
  const distanceToTp6Pips = calculatePips(livePrice, tp6Price);

  // TP1 remaining pips (directional)
  const isSell = signalType === 'SELL';
  let tp1RemainingPips = 0;
  if (isSell) {
    tp1RemainingPips = livePrice > tp1Price ? calculatePips(livePrice, tp1Price) : 0;
  } else {
    tp1RemainingPips = livePrice < tp1Price ? calculatePips(livePrice, tp1Price) : 0;
  }

  // Summary box metrics:
  // If TP1 only: TP1 pips
  const tp1OnlyPips = tpLevels[0]?.pips || 0;
  // If TP3 hit: Sum of TP1, TP2, TP3
  const tp3HitPips = tpLevels.slice(0, 3).reduce((acc, t) => acc + t.pips, 0);

  const copyToClipboard = () => {
    const formattedText = `🚨 AREWA CRITICS - FOREX SIGNAL PRO (WAT ENGINE)
PAIR: ${pair} (GOLD)
ACTION: ${signalType} NOW @ ${entryPrice.toFixed(2)}
SL: ${stopLossPrice.toFixed(2)} (${riskPips} pips / -$${riskUsd.toFixed(2)})
----------------------------------------
${tpLevels
  .map(
    (tp) =>
      `${tp.tier} (${tp.rMultiple}): ${tp.price.toFixed(2)} | +${tp.pips} pips | +$${tp.profitUsd.toFixed(2)} | Close ${tp.closePercent}%`
  )
  .join('\n')}
----------------------------------------
🎯 TOTAL POTENTIAL: +${totalPotentialPips} pips (+$${totalPotentialUsd.toFixed(2)})
📊 RISK/REWARD: 1:${(totalPotentialPips / riskPips).toFixed(1)}
📦 LOT SIZE: ${lotSize}
⏱️ TIME: ${timestampWAT}
STATUS: ${decision} (${grade} - ${score}/100)`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 shadow-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
        <div className="flex items-center gap-2">
          {signalType === 'SELL' ? (
            <TrendingDown className="w-4 h-4 text-[#FF3333]" />
          ) : (
            <TrendingUp className="w-4 h-4 text-[#00FF88]" />
          )}
          <h3 className="text-white font-extrabold text-xs tracking-wider uppercase">
            SIGNAL DETAILS & PIP TARGETS
          </h3>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#262626] hover:bg-[#333333] text-gray-200 hover:text-white text-[11px] font-bold border border-[#3A3A3A] transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#00FF88]" />
              <span className="text-[#00FF88]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy Signal</span>
            </>
          )}
        </button>
      </div>

      {/* Warning message if Medium signal */}
      {warningMessage && (
        <div className="bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-lg p-2 text-xs text-[#FFD700] font-semibold">
          ⚠️ {warningMessage}
        </div>
      )}

      {/* Entry & SL Quick Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            ENTRY PRICE
          </span>
          <span className="font-mono text-base font-black text-white tabular-nums">
            ${entryPrice.toFixed(2)}
          </span>
          <p className="text-[9px] text-[#00FF88] mt-0.5">Automated from Live Quote</p>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            STOP LOSS (SL)
          </span>
          <span className="font-mono text-base font-black text-[#FF3333] tabular-nums">
            ${stopLossPrice.toFixed(2)}
          </span>
          <p className="text-[9px] text-gray-400 font-mono mt-0.5">
            Risk: {riskPips} pips (-${riskUsd.toFixed(2)})
          </p>
        </div>
      </div>

      {/* REAL-TIME DISTANCE TRACKING WIDGET */}
      <div className="bg-[#111111] border border-[#262626] rounded-lg p-2.5 space-y-1 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-bold mb-1">
          <Activity className="w-3 h-3 text-[#00FF88] animate-pulse" />
          <span>REAL-TIME LIVE PRICE TRACKING</span>
        </div>
        <div className="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5">
          <span className="text-gray-400">Distance from LIVE Price to Entry:</span>
          <strong className="text-white tabular-nums">{distanceToEntryPips} pips</strong>
        </div>
        <div className="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5">
          <span className="text-gray-400">TP1 Remaining Distance:</span>
          <strong className="text-[#FFD700] tabular-nums">
            {tp1RemainingPips > 0 ? `${tp1RemainingPips} pips remaining` : 'Target In Range / Hit ✅'}
          </strong>
        </div>
        <div className="flex items-center justify-between text-[11px] py-0.5">
          <span className="text-gray-400">Distance from LIVE Price to TP6:</span>
          <strong className="text-[#00FF88] tabular-nums">{distanceToTp6Pips} pips</strong>
        </div>
      </div>

      {/* AUTOMATED MULTI-TP TABLE (RULE 3) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">
          <span>TARGET / MULTIPLE</span>
          <span>PIPS / PROFIT / CLOSE %</span>
        </div>

        <div className="space-y-1 text-xs">
          {tpLevels.map((tp) => (
            <div
              key={tp.tier}
              className={`p-2 rounded-lg border flex flex-col gap-1 transition-colors ${
                tp.isHit
                  ? 'bg-[#00FF88]/10 border-[#00FF88]/40'
                  : 'bg-[#141414] border-[#262626] hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-xs">
                    {tp.tier} {tp.rMultiple}:
                  </span>
                  <span className="text-[#00FF88] font-bold tabular-nums">
                    ${tp.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="font-bold text-gray-200 tabular-nums">
                    +{tp.pips} pips
                  </span>
                  <span className="text-[#00FF88] font-black tabular-nums">
                    +${tp.profitUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5 border-t border-white/5">
                <span className="bg-[#242424] px-1.5 py-0.5 rounded text-gray-300 font-medium">
                  Close {tp.closePercent}%
                </span>
                <span className="text-gray-400">
                  Total if hit: <strong className="text-white font-mono">+{tp.totalPipsIfHit} pips</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY BOX (RULE 3) */}
      <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-3 space-y-1.5 text-xs">
        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-[#222222] pb-1">
          ENGINE SUMMARY BOX (LOT: {lotSize})
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Risk:</span>
            <span className="font-mono text-[#FF3333] font-bold tabular-nums">
              {riskPips} pips (-${riskUsd.toFixed(2)})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">If TP1 only:</span>
            <span className="font-mono text-[#00FF88] font-bold tabular-nums">
              +{tp1OnlyPips} pips
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">If TP3 hit:</span>
            <span className="font-mono text-[#00FF88] font-bold tabular-nums">
              +{tp3HitPips} pips
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Entry to Last TP:</span>
            <span className="font-mono text-white font-bold tabular-nums">
              {directDistancePips} pips
            </span>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#262626] flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300 font-bold">If ALL TPs hit:</span>
          <span className="text-[#00FF88] font-black text-sm tabular-nums">
            +{totalPotentialPips} pips = +${totalPotentialUsd.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
