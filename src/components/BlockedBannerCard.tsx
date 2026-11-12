import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { HiddenScanEvaluation } from '../types/forex';

interface BlockedBannerCardProps {
  hiddenScan: HiddenScanEvaluation;
  checklistScore: number;
}

export const BlockedBannerCard: React.FC<BlockedBannerCardProps> = ({
  hiddenScan,
  checklistScore,
}) => {
  const [showAllChecks, setShowAllChecks] = useState(false);

  if (!hiddenScan.isBlocked) {
    return null;
  }

  const primaryReason = hiddenScan.primaryBlockReason || 'HIDDEN FILTER RESTRICTION';

  return (
    <div className="w-full bg-[#181111] border-2 border-[#FF3333] rounded-xl p-3.5 shadow-xl shadow-red-950/30 space-y-3 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#3A1E1E] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF3333]/20 border border-[#FF3333]/60 flex items-center justify-center text-[#FF3333] shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[#FF3333] font-black text-xs uppercase tracking-wider">
              CHECKLIST: {checklistScore}% - BUT BLOCKED
            </h3>
            <p className="text-[10px] text-gray-400">
              Hidden background market scan intercepted execution
            </p>
          </div>
        </div>

        <div className="bg-[#FF3333] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
          ORDER LOCKED
        </div>
      </div>

      {/* Prominent Block Reason Box */}
      <div className="bg-[#261010] border border-[#FF3333]/40 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#FF3333] font-black text-xs sm:text-sm tracking-wide uppercase">
          <span className="text-base">🚫</span>
          <span>BLOCKED: {primaryReason}</span>
        </div>
        <p className="text-[10px] text-gray-300 mt-1 font-medium">
          Signal Details and Entry orders are strictly hidden to protect capital.
        </p>
      </div>

      {/* Blocked Filters Count & Inspector Trigger */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
          <span className="text-[#FF3333] font-bold">
            {hiddenScan.blockedChecks.length} of {hiddenScan.totalCount}
          </span>
          <span>hidden scan filters failed</span>
        </div>

        <button
          onClick={() => setShowAllChecks(!showAllChecks)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#FFD700] hover:text-white transition-colors cursor-pointer"
        >
          <span>{showAllChecks ? 'Hide Details' : 'Inspect 10 Filters'}</span>
          {showAllChecks ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Inspector for all 10 Background Checks */}
      {showAllChecks && (
        <div className="pt-2 border-t border-[#3A1E1E] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <span className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
            BACKGROUND SCAN RADAR (10 HIDDEN FILTERS)
          </span>

          <div className="space-y-1 text-xs font-mono">
            {hiddenScan.allChecks.map((chk, i) => (
              <div
                key={chk.id}
                className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-[11px] ${
                  chk.passed
                    ? 'bg-[#121212] border-[#2A2A2A] text-gray-300'
                    : 'bg-[#261010] border-[#FF3333]/50 text-red-200'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {chk.passed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[#00FF88] shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-[#FF3333] shrink-0" />
                  )}
                  <span className="truncate">
                    {i + 1}. {chk.name}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-bold ${
                      chk.passed ? 'text-[#00FF88]' : 'text-[#FF3333]'
                    }`}
                  >
                    {chk.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
