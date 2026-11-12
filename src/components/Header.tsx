import React from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  watTime: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  livePriceOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  watTime,
  isRefreshing,
  onRefresh,
  livePriceOffline,
}) => {
  return (
    <header className="w-full bg-[#111111] border-b border-[#2A2A2A] px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Left: AC logo in green circle + Title & Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#00FF88]/15 border border-[#00FF88] flex items-center justify-center shrink-0">
            <span className="text-[#00FF88] font-black text-xs tracking-tighter">AC</span>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-bold text-sm tracking-wide uppercase truncate">
                AREWA CRITICS
              </h1>
              <span className="bg-[#00FF88]/20 text-[#00FF88] text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border border-[#00FF88]/40 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              Forex Signal Bot - WAT Engine
            </p>
          </div>
        </div>

        {/* Right: Live Clock WAT + Refresh button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  livePriceOffline ? 'bg-[#FF3333]' : 'bg-[#00FF88] animate-live-dot'
                }`}
              />
              <span className="font-mono text-[11px] font-semibold text-gray-200 tabular-nums">
                {watTime || '00:00:00 WAT'}
              </span>
            </div>
            <span className="text-[9px] text-gray-400 font-mono tracking-tight">
              GMT+1 (Nigeria)
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Price"
            aria-label="Refresh Live Price"
            className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:border-gray-500 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FF88]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
