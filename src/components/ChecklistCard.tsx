import React from 'react';
import { ChecklistEvaluation } from '../types/forex';

interface ChecklistCardProps {
  evaluation: ChecklistEvaluation;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ evaluation }) => {
  const { checks, totalScore, passedCount, decision, missingSummary } = evaluation;

  // Decision color: 80-100% Green, 60-79% Yellow, <60% Red
  const scoreColor =
    totalScore >= 80 ? '#00FF88' : totalScore >= 60 ? '#FFD700' : '#FF3333';

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 shadow-sm space-y-3">
      {/* Title & Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
            <span>CHECKLIST: 4 CHECKS - DAY TRADE</span>
            {evaluation.isBlockedByHiddenScan && (
              <span className="text-[#FF3333] text-[10px] font-black bg-[#FF3333]/20 px-1.5 py-0.5 rounded border border-[#FF3333]/50">
                BLOCKED
              </span>
            )}
          </h2>
          <p className="text-[10px] text-gray-400">
            Rules engine required: ≥80% for Strong, 60-79% Medium
          </p>
        </div>
        <div className="text-right">
          <span
            className="font-mono text-base font-black tabular-nums"
            style={{ color: evaluation.isBlockedByHiddenScan ? '#FF3333' : scoreColor }}
          >
            {totalScore}%
          </span>
        </div>
      </div>

      {/* Prominent Block Notice if 100% or high score but blocked by hidden scan */}
      {evaluation.isBlockedByHiddenScan && (
        <div className="bg-[#2A1111] border border-[#FF3333]/60 rounded-lg p-2.5 space-y-1">
          <div className="text-[#FF3333] font-black text-xs uppercase flex items-center gap-1">
            <span>🚫</span>
            <span>BLOCKED: {evaluation.primaryBlockReason}</span>
          </div>
          <p className="text-[10px] text-gray-300">
            {totalScore === 100
              ? 'Checklist is 100% - but background institutional safety filter blocked entry.'
              : 'Background filter blocked execution to safeguard capital.'}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${totalScore}%`,
            backgroundColor: scoreColor,
          }}
        />
      </div>

      {/* List 4 checks with ✅ / ❌ and % for each */}
      <div className="space-y-2 pt-1">
        {checks.map((check, idx) => {
          return (
            <div
              key={check.id}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                check.passed
                  ? 'bg-[#00FF88]/5 border-[#00FF88]/30 text-gray-200'
                  : 'bg-[#FF3333]/5 border-[#FF3333]/25 text-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0">
                    {check.passed ? '✅' : '❌'}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-[11px] text-white tracking-wide">
                      {idx + 1}. {check.name} ({check.weight}%)
                    </span>
                    <p className="text-[10px] text-gray-400 leading-tight truncate">
                      {check.details}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                    check.passed ? 'text-[#00FF88]' : 'text-[#FF3333]'
                  }`}
                >
                  {check.passed ? `+${check.weight}%` : '+0%'}
                </span>
              </div>

              {/* Exact display sentence required by specification */}
              <div className="mt-1 pt-1 border-t border-white/5 text-[10.5px] font-medium text-gray-200">
                {check.displayText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary: PASSED: 2/4 = 50% - WAIT + MISSING: S/R (30%) + RSI (20%) */}
      <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5 space-y-1 text-xs">
        <div className="flex items-center justify-between font-mono font-bold">
          <span className="text-gray-300">
            PASSED: {passedCount}/4 = {totalScore}%
          </span>
          <span
            className="uppercase tracking-wider px-2 py-0.5 rounded text-[10px] font-extrabold"
            style={{
              backgroundColor: evaluation.isBlockedByHiddenScan ? '#FF333320' : `${scoreColor}20`,
              color: evaluation.isBlockedByHiddenScan ? '#FF3333' : scoreColor,
              border: `1px solid ${evaluation.isBlockedByHiddenScan ? '#FF333350' : `${scoreColor}50`}`,
            }}
          >
            {evaluation.isBlockedByHiddenScan ? 'BLOCKED' : decision}
          </span>
        </div>

        {totalScore < 100 && (
          <p className="text-[10.5px] text-gray-400">
            <strong className="text-gray-300">MISSING:</strong>{' '}
            <span className="text-[#FFD700]">{missingSummary}</span>
            {decision === 'WAIT' && ' — Wait for these before entry.'}
          </p>
        )}
      </div>
    </div>
  );
};
