import React from 'react';
import { X, Sliders, RotateCcw, ShieldAlert, Lock, CheckCircle2, AlertOctagon, TrendingDown, Volume2, DollarSign, Newspaper } from 'lucide-react';
import { TestOverrideState } from '../types/forex';

interface TestOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  override: TestOverrideState;
  onChangeOverride: (next: TestOverrideState) => void;
  realLivePrice: number | null;
}

export const TestOverrideModal: React.FC<TestOverrideModalProps> = ({
  isOpen,
  onClose,
  override,
  onChangeOverride,
  realLivePrice,
}) => {
  if (!isOpen) return null;

  const handleApplyPreset = (preset: string) => {
    switch (preset) {
      case 'SELL_100_CLEAN':
        onChangeOverride({
          enabled: true,
          price: 4069.41,
          h4Trend: 'DOWNTREND',
          m15Candle: 'Bearish Engulfing',
          priceVsEma: 'BELOW',
          rsiValue: 66,
          rsiDirection: 'TURNING_DOWN',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: true,
          spreadPips: 1.6,
          newsMinutesAway: null,
          volumeStatus: 'INCREASING',
          marketStructure: 'BOS_CONFIRMED',
          liquiditySwept: true,
          dailyTradesCount: 0,
          presetName: '100% SELL (Clean Pass - Unlocked)'
        });
        break;

      case 'BUY_100_CLEAN':
        onChangeOverride({
          enabled: true,
          price: 3970.20,
          h4Trend: 'UPTREND',
          m15Candle: 'Hammer',
          priceVsEma: 'ABOVE',
          rsiValue: 34,
          rsiDirection: 'TURNING_UP',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: true,
          spreadPips: 1.8,
          newsMinutesAway: null,
          volumeStatus: 'INCREASING',
          marketStructure: 'BOS_CONFIRMED',
          liquiditySwept: true,
          dailyTradesCount: 0,
          presetName: '100% BUY (Clean Pass - Unlocked)'
        });
        break;

      case 'BLOCK_NEWS':
        onChangeOverride({
          enabled: true,
          price: 4069.41,
          h4Trend: 'DOWNTREND',
          m15Candle: 'Bearish Engulfing',
          priceVsEma: 'BELOW',
          rsiValue: 66,
          rsiDirection: 'TURNING_DOWN',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: false,
          newsMinutesAway: 12,
          newsEventName: 'FOMC Interest Rate Decision',
          spreadPips: 1.8,
          volumeStatus: 'INCREASING',
          marketStructure: 'BOS_CONFIRMED',
          liquiditySwept: true,
          presetName: 'Checklist 100% - BLOCKED: WAIT FOR NEWS (12m)'
        });
        break;

      case 'BLOCK_SPREAD':
        onChangeOverride({
          enabled: true,
          price: 4069.41,
          h4Trend: 'DOWNTREND',
          m15Candle: 'Bearish Engulfing',
          priceVsEma: 'BELOW',
          rsiValue: 66,
          rsiDirection: 'TURNING_DOWN',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: false,
          spreadPips: 4.6, // Spread > 3.0 pips blocks!
          newsMinutesAway: null,
          volumeStatus: 'INCREASING',
          marketStructure: 'BOS_CONFIRMED',
          liquiditySwept: true,
          presetName: 'Checklist 100% - BLOCKED: SPREAD TOO HIGH'
        });
        break;

      case 'BLOCK_VOLUME':
        onChangeOverride({
          enabled: true,
          price: 4069.41,
          h4Trend: 'DOWNTREND',
          m15Candle: 'Bearish Engulfing',
          priceVsEma: 'BELOW',
          rsiValue: 66,
          rsiDirection: 'TURNING_DOWN',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: false,
          volumeStatus: 'LOW',
          spreadPips: 1.8,
          newsMinutesAway: null,
          presetName: 'Checklist 100% - BLOCKED: VOLUME LOW'
        });
        break;

      case 'BLOCK_DAILY':
        onChangeOverride({
          enabled: true,
          price: 4069.41,
          h4Trend: 'DOWNTREND',
          m15Candle: 'Bearish Engulfing',
          priceVsEma: 'BELOW',
          rsiValue: 66,
          rsiDirection: 'TURNING_DOWN',
          m5Signal: 'NONE',
          forceSignalLock: false,
          forceAllHiddenPass: false,
          dailyTradesCount: 2, // Max 2 trades/day hit
          presetName: 'Checklist 100% - BLOCKED: DAILY LIMIT'
        });
        break;

      case 'REJECT_M5':
        onChangeOverride({
          enabled: true,
          price: 4025.00,
          h4Trend: 'DOWNTREND',
          m15Candle: 'No Candle',
          priceVsEma: 'BELOW',
          rsiValue: 48,
          rsiDirection: 'MIDDLE',
          m5Signal: 'BUY', // Counter-trend M5 trigger
          forceSignalLock: false,
          presetName: 'Reject Rule: M5 Opposite to H4'
        });
        break;

      case 'MIDDLE_WAIT':
        onChangeOverride({
          enabled: true,
          price: 4005.00,
          h4Trend: 'DOWNTREND',
          m15Candle: 'No Candle',
          priceVsEma: 'BETWEEN',
          rsiValue: 49,
          rsiDirection: 'MIDDLE',
          m5Signal: 'NONE',
          forceSignalLock: false,
          presetName: 'Price in Middle (3990-4020) WAIT'
        });
        break;

      case 'LOCK_45':
        onChangeOverride({
          ...override,
          enabled: true,
          forceSignalLock: true,
          presetName: 'Signal Lock Active (45m)'
        });
        break;
    }
  };

  const handleResetToReal = () => {
    onChangeOverride({
      enabled: false,
      price: null,
      h4Trend: 'DOWNTREND',
      m15Candle: 'No Candle',
      priceVsEma: 'BELOW',
      rsiValue: 50,
      rsiDirection: 'MIDDLE',
      m5Signal: 'NONE',
      forceSignalLock: false,
      forceAllHiddenPass: false,
      spreadPips: undefined,
      newsMinutesAway: null,
      volumeStatus: undefined,
      marketStructure: undefined,
      liquiditySwept: undefined,
      dailyTradesCount: undefined,
      presetName: undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2E2E2E] rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Top Header */}
        <div className="p-3.5 border-b border-[#262626] flex items-center justify-between bg-[#191919]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FFD700]" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              ENGINE TEST OVERRIDE & SAFETY RADAR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#222222] hover:bg-[#333333] text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Status Alert */}
          <div
            className={`p-2.5 rounded-lg border ${
              override.enabled
                ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700]'
                : 'bg-[#00FF88]/10 border-[#00FF88]/40 text-[#00FF88]'
            } flex items-center justify-between font-mono`}
          >
            <span className="truncate max-w-[280px]">
              {override.enabled
                ? `Active: ${override.presetName || 'Custom Manual Override'}`
                : `Live Internet Mode (${realLivePrice ? `$${realLivePrice.toFixed(2)}` : 'Connecting...'})`}
            </span>
            {override.enabled && (
              <button
                onClick={handleResetToReal}
                className="text-xs bg-[#FFD700] text-black font-extrabold px-2 py-0.5 rounded hover:bg-[#FFE34D] transition-colors cursor-pointer shrink-0"
              >
                Disable
              </button>
            )}
          </div>

          {/* Quick Presets Section */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
              1-CLICK TEST SCENARIO PRESETS
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleApplyPreset('SELL_100_CLEAN')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#00FF88] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#00FF88] font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF88]" />
                  1. 100% SELL (Clean Pass)
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  Checklist 100% + All 10 Hidden Pass (Details Unlocked)
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('BUY_100_CLEAN')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#00FF88] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#00FF88] font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF88]" />
                  2. 100% BUY (Clean Pass)
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  Support 3970 + Hammer + All Hidden Pass
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('BLOCK_SPREAD')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FF3333] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FF3333] font-bold text-[11px] flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-[#FF3333]" />
                  3. BLOCKED: Spread &gt; 3 pips
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  Checklist 100% but Spread 4.6 pips (Details Hidden)
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('BLOCK_NEWS')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FF3333] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FF3333] font-bold text-[11px] flex items-center gap-1">
                  <Newspaper className="w-3.5 h-3.5 text-[#FF3333]" />
                  4. BLOCKED: Major News
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  FOMC in 12 mins (Wait for News)
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('BLOCK_VOLUME')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FF3333] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FFD700] font-bold text-[11px] flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#FFD700]" />
                  5. BLOCKED: Low Volume
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  Volume Anemic / Structure Ranging
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('BLOCK_DAILY')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FF3333] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FF3333] font-bold text-[11px] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF3333]" />
                  6. BLOCKED: Daily Limit
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  2/2 trades executed today
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('REJECT_M5')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FFD700] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FFD700] font-bold text-[11px]">
                  7. Reject Rule Trigger
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  M5 Buy opposite to H4 Downtrend
                </div>
              </button>

              <button
                onClick={() => handleApplyPreset('LOCK_45')}
                className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#FFD700] text-left transition-colors cursor-pointer"
              >
                <div className="text-[#FFD700] font-bold text-[11px] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#FFD700]" />
                  8. Signal Lock Cooldown
                </div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">
                  Active lock countdown active
                </div>
              </button>
            </div>
          </div>

          {/* Quick Master Switch: Force All Hidden Checks to Pass */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-white font-bold block text-xs">
                Force All 10 Hidden Checks to PASS:
              </span>
              <span className="text-[10px] text-gray-400">
                Instantly unlocks signal details when checklist reaches 80%+
              </span>
            </div>
            <button
              onClick={() =>
                onChangeOverride({
                  ...override,
                  enabled: true,
                  forceAllHiddenPass: !override.forceAllHiddenPass,
                  presetName: !override.forceAllHiddenPass ? 'All Hidden Checks Forced PASS' : undefined,
                })
              }
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                override.forceAllHiddenPass
                  ? 'bg-[#00FF88] text-black border-[#00FF88]'
                  : 'bg-[#222] text-gray-300 border-[#444]'
              }`}
            >
              {override.forceAllHiddenPass ? 'FORCE PASS ON ✅' : 'Standard Evaluation'}
            </button>
          </div>

          {/* Fine Tuning: Hidden Market Scan Filters */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 space-y-3">
            <span className="text-[10px] font-extrabold text-[#FFD700] uppercase tracking-wider block border-b border-[#242424] pb-1">
              HIDDEN MARKET SCAN FINE-TUNING
            </span>

            {/* Spread Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 font-semibold mb-1">
                <span>Broker Gold Spread:</span>
                <span className={`font-mono font-bold ${(override.spreadPips ?? 1.8) >= 3.0 ? 'text-[#FF3333]' : 'text-[#00FF88]'}`}>
                  {(override.spreadPips ?? 1.8).toFixed(1)} pips {(override.spreadPips ?? 1.8) >= 3.0 ? '(BLOCKS >3.0)' : '(SAFE)'}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="5.0"
                step="0.2"
                value={override.spreadPips ?? 1.8}
                onChange={(e) =>
                  onChangeOverride({
                    ...override,
                    enabled: true,
                    spreadPips: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-[#FFD700]"
              />
            </div>

            {/* High Impact News */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 font-semibold mb-1">
                <span>US High-Impact News Buffer:</span>
                <span className={`font-mono font-bold ${override.newsMinutesAway !== null && override.newsMinutesAway !== undefined && override.newsMinutesAway <= 30 ? 'text-[#FF3333]' : 'text-[#00FF88]'}`}>
                  {override.newsMinutesAway !== null && override.newsMinutesAway !== undefined
                    ? `${override.newsMinutesAway} mins away (BLOCKS)`
                    : 'Clear (No News)'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, newsMinutesAway: null })}
                  className={`flex-1 py-1 rounded text-[11px] font-bold border ${
                    !override.newsMinutesAway
                      ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  No News
                </button>
                <button
                  onClick={() =>
                    onChangeOverride({
                      ...override,
                      enabled: true,
                      newsMinutesAway: 15,
                      newsEventName: 'US CPI Data',
                    })
                  }
                  className={`flex-1 py-1 rounded text-[11px] font-bold border ${
                    override.newsMinutesAway === 15
                      ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  CPI in 15m (Block)
                </button>
                <button
                  onClick={() =>
                    onChangeOverride({
                      ...override,
                      enabled: true,
                      newsMinutesAway: 8,
                      newsEventName: 'FOMC Decision',
                    })
                  }
                  className={`flex-1 py-1 rounded text-[11px] font-bold border ${
                    override.newsMinutesAway === 8
                      ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  FOMC in 8m (Block)
                </button>
              </div>
            </div>

            {/* Volume Status */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                Institutional Volume:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, volumeStatus: 'INCREASING' })}
                  className={`py-1 rounded font-bold text-xs border ${
                    override.volumeStatus === 'INCREASING' || !override.volumeStatus
                      ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  Increasing (Pass)
                </button>
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, volumeStatus: 'LOW' })}
                  className={`py-1 rounded font-bold text-xs border ${
                    override.volumeStatus === 'LOW'
                      ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  Low / Anemic (Block)
                </button>
              </div>
            </div>

            {/* Market Structure (BOS / CHoCH) */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                Market Structure:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, marketStructure: 'BOS_CONFIRMED' })}
                  className={`py-1 rounded font-bold text-xs border ${
                    override.marketStructure === 'BOS_CONFIRMED' || !override.marketStructure
                      ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  BOS / CHoCH Confirmed
                </button>
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, marketStructure: 'RANGING' })}
                  className={`py-1 rounded font-bold text-xs border ${
                    override.marketStructure === 'RANGING'
                      ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  Ranging / Unclear (Block)
                </button>
              </div>
            </div>

            {/* Daily Trade Limit */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                Trades Executed Today (Max 2):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => onChangeOverride({ ...override, enabled: true, dailyTradesCount: cnt })}
                    className={`py-1 rounded font-bold text-xs border ${
                      (override.dailyTradesCount ?? 0) === cnt
                        ? cnt === 2
                          ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                          : 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                        : 'bg-[#111] border-[#333] text-gray-400'
                    }`}
                  >
                    {cnt} {cnt === 2 ? '(Limit Reached)' : 'trades'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Variables Fine Tuning (Price, Candle, EMA, RSI) */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 space-y-3">
            <span className="text-[10px] font-extrabold text-gray-300 uppercase tracking-wider block border-b border-[#242424] pb-1">
              4-CHECK DAY TRADE VARIABLES
            </span>

            {/* Price Override */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                Custom Gold Price ($):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={override.price ?? ''}
                  placeholder={realLivePrice ? String(realLivePrice) : '4069.41'}
                  onChange={(e) =>
                    onChangeOverride({
                      ...override,
                      enabled: true,
                      price: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="flex-1 bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#FFD700]"
                />
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, price: 4069.41 })}
                  className="bg-[#262626] hover:bg-[#333333] px-2 py-1 rounded text-[11px] text-gray-300 font-mono"
                >
                  4069.41
                </button>
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, price: 3970.20 })}
                  className="bg-[#262626] hover:bg-[#333333] px-2 py-1 rounded text-[11px] text-gray-300 font-mono"
                >
                  3970.20
                </button>
              </div>
            </div>

            {/* H4 Trend */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                H4 Trend:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, h4Trend: 'DOWNTREND' })}
                  className={`py-1.5 rounded-lg font-bold text-xs border ${
                    override.h4Trend === 'DOWNTREND'
                      ? 'bg-[#FF3333]/20 border-[#FF3333] text-[#FF3333]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  DOWNTREND (Sell Only)
                </button>
                <button
                  onClick={() => onChangeOverride({ ...override, enabled: true, h4Trend: 'UPTREND' })}
                  className={`py-1.5 rounded-lg font-bold text-xs border ${
                    override.h4Trend === 'UPTREND'
                      ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                      : 'bg-[#111] border-[#333] text-gray-400'
                  }`}
                >
                  UPTREND (Buy Only)
                </button>
              </div>
            </div>

            {/* M15 Candle */}
            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                M15 Candle Pattern:
              </label>
              <select
                value={override.m15Candle}
                onChange={(e) => onChangeOverride({ ...override, enabled: true, m15Candle: e.target.value })}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#FFD700]"
              >
                <option value="Bearish Engulfing">Bearish Engulfing (for SELL)</option>
                <option value="Shooting Star">Shooting Star (for SELL)</option>
                <option value="Pin Bar">Pin Bar (at S/R)</option>
                <option value="Bullish Engulfing">Bullish Engulfing (for BUY)</option>
                <option value="Hammer">Hammer (for BUY)</option>
                <option value="No Candle">No Candle (Fail Check)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[#262626] bg-[#191919] flex items-center justify-between">
          <button
            onClick={handleResetToReal}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Live Market
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#FFD700] hover:bg-[#FFE34D] text-black font-extrabold text-xs transition-colors cursor-pointer"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
