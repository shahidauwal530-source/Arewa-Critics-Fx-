import React, { useState } from 'react';
import { Calculator, DollarSign, Shield, ArrowRight } from 'lucide-react';
import { calculatePips, calculateUsdFromPips } from '../utils/livePrice';

interface CalculatorTabProps {
  currentLivePrice: number;
  defaultLotSize: number;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  currentLivePrice,
  defaultLotSize,
}) => {
  const [balance, setBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(currentLivePrice);
  const [slPrice, setSlPrice] = useState<number>(Number((currentLivePrice + 11.0).toFixed(2))); // Default $11 SL
  const [lotSize, setLotSize] = useState<number>(defaultLotSize);

  // Sync entry when user clicks "Use Current Live Price"
  const handleUseLivePrice = () => {
    setEntryPrice(currentLivePrice);
    setSlPrice(Number((currentLivePrice + 11.0).toFixed(2)));
  };

  const riskDollarAmount = (balance * riskPercent) / 100;
  const riskPips = calculatePips(entryPrice, slPrice);

  // Recommended Lot Size = (Risk $ Amount) / (Risk Pips * $10 standard lot value)
  const calculatedLotSize = riskPips > 0
    ? Math.max(0.01, Number((riskDollarAmount / (riskPips * 10)).toFixed(2)))
    : 0.01;

  // Potential profit calculations based on selected lot size
  const tp1Pips = riskPips * 1;
  const tp2Pips = riskPips * 2;
  const tp3Pips = riskPips * 4;
  const tp6Pips = riskPips * 23; // Total combined

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00FF88]" />
          <div>
            <h2 className="text-white font-extrabold text-xs uppercase tracking-wider">
              XAUUSD RISK & PIP CALCULATOR
            </h2>
            <p className="text-[10px] text-gray-400">
              1 pip = $0.10 | $1.00 move = 10 pips
            </p>
          </div>
        </div>

        <button
          onClick={handleUseLivePrice}
          className="text-[10px] bg-[#222222] hover:bg-[#333333] border border-[#333333] text-gray-200 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
        >
          Use Live Price (${currentLivePrice.toFixed(2)})
        </button>
      </div>

      {/* Account Balance & Risk Input */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 font-semibold text-[11px] block mb-1">
              Account Balance ($):
            </label>
            <input
              type="number"
              min="10"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#121212] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#00FF88]"
            />
          </div>

          <div>
            <label className="text-gray-400 font-semibold text-[11px] block mb-1">
              Risk Tolerance (%):
            </label>
            <div className="flex gap-1.5">
              {[1.0, 1.5, 2.0].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`flex-1 py-1 rounded font-bold font-mono text-[10px] border ${
                    riskPercent === pct
                      ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                      : 'bg-[#121212] border-[#333333] text-gray-400'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entry & Stop Loss */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
          <div>
            <label className="text-gray-400 font-semibold text-[11px] block mb-1">
              Entry Price ($):
            </label>
            <input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#121212] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#00FF88]"
            />
          </div>

          <div>
            <label className="text-gray-400 font-semibold text-[11px] block mb-1">
              Stop Loss Price ($):
            </label>
            <input
              type="number"
              step="0.01"
              value={slPrice}
              onChange={(e) => setSlPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#121212] border border-[#333333] rounded-lg px-2.5 py-1.5 text-[#FF3333] font-mono font-bold focus:outline-none focus:border-[#FF3333]"
            />
          </div>
        </div>

        {/* Selected Lot Size Input */}
        <div className="pt-1 border-t border-white/5 flex items-center justify-between">
          <label className="text-gray-400 font-semibold text-[11px]">
            Target Trade Lot Size:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="10.0"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.01)}
              className="w-20 bg-[#121212] border border-[#333333] rounded-lg px-2 py-1 text-center font-mono font-black text-white text-xs focus:outline-none focus:border-[#00FF88]"
            />
            <span className="text-[10px] text-gray-400 font-mono">Lot</span>
          </div>
        </div>
      </div>

      {/* Calculated Results Card */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3.5 space-y-2.5 text-xs">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
          RISK & LOT RECOMMENDATION
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5">
            <span className="text-[10px] text-gray-400 block">Total Risk Amount</span>
            <span className="text-sm font-black text-[#FF3333] tabular-nums">
              -${riskDollarAmount.toFixed(2)}
            </span>
            <span className="text-[9px] text-gray-400 block">({riskPercent}% balance)</span>
          </div>

          <div className="bg-[#121212] border border-[#262626] rounded-lg p-2.5">
            <span className="text-[10px] text-gray-400 block">Calculated Stop Distance</span>
            <span className="text-sm font-black text-white tabular-nums">
              {riskPips} pips
            </span>
            <span className="text-[9px] text-gray-400 block">(${Math.abs(entryPrice - slPrice).toFixed(2)})</span>
          </div>
        </div>

        {/* Recommended Lot Size banner */}
        <div className="bg-[#00FF88]/10 border border-[#00FF88]/40 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-300 font-semibold uppercase block">
              Recommended Strict Lot Size:
            </span>
            <span className="font-mono text-base font-black text-[#00FF88] tabular-nums">
              {calculatedLotSize} Lot
            </span>
          </div>
          <span className="text-[10px] text-gray-300 font-mono">
            {calculatedLotSize <= 0.01 ? 'Safe Minimum (0.01)' : 'Strict Risk Bound'}
          </span>
        </div>

        {/* Multi-Target Return Grid */}
        <div className="bg-[#121212] border border-[#262626] rounded-lg p-3 space-y-1.5 font-mono text-xs">
          <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">
            RETURN TABLE FOR {lotSize} LOT:
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-gray-400">TP1 (1R - {tp1Pips} pips):</span>
            <strong className="text-[#00FF88] tabular-nums">
              +${calculateUsdFromPips(tp1Pips, lotSize).toFixed(2)}
            </strong>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-gray-400">TP2 (2R - {tp2Pips} pips):</span>
            <strong className="text-[#00FF88] tabular-nums">
              +${calculateUsdFromPips(tp2Pips, lotSize).toFixed(2)}
            </strong>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-gray-400">TP3 (4R - {tp3Pips} pips):</span>
            <strong className="text-[#00FF88] tabular-nums">
              +${calculateUsdFromPips(tp3Pips, lotSize).toFixed(2)}
            </strong>
          </div>
          <div className="flex justify-between py-0.5 pt-1 text-white font-bold">
            <span className="text-gray-300">All Targets Hit (23R):</span>
            <strong className="text-[#00FF88] tabular-nums">
              +${calculateUsdFromPips(tp6Pips, lotSize).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
