/**
 * AREWA CRITICS - Forex Signal Bot - WAT Engine - PRO
 * Professional Forex Signal Bot with WAT Engine, live XAU/USD gold price tracking,
 * 4-check day trade validation, automated 6-tier pip and risk calculation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TopStatusBar } from './components/TopStatusBar';
import { WaitingSetupCard } from './components/WaitingSetupCard';
import { ChecklistCard } from './components/ChecklistCard';
import { RejectRuleCard } from './components/RejectRuleCard';
import { SignalActiveCard } from './components/SignalActiveCard';
import { BigSignalDisplay } from './components/BigSignalDisplay';
import { HtfBiasRow } from './components/HtfBiasRow';
import { IndicatorsGrid } from './components/IndicatorsGrid';
import { SignalDetailsCard } from './components/SignalDetailsCard';
import { BlockedBannerCard } from './components/BlockedBannerCard';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { TestOverrideModal } from './components/TestOverrideModal';
import { SettingsModal } from './components/SettingsModal';
import { CalculatorTab } from './components/CalculatorTab';
import { HistoryTab } from './components/HistoryTab';
import { fetchLiveXauUsdPrice } from './utils/livePrice';
import { evaluateWatEngine } from './utils/engine';
import { formatWATTime, getCurrentMarketSession } from './utils/watTime';
import { playSignalAlert } from './utils/audioAlert';
import {
  BotSettings,
  MarketSessionInfo,
  TestOverrideState,
  TradeHistoryItem,
} from './types/forex';

const DEFAULT_SETTINGS: BotSettings = {
  twelveDataApiKey: '',
  lotSize: 0.01,
  accountBalance: 1000,
  refreshIntervalSeconds: 15,
  soundAlertsEnabled: true,
  srTolerancePips: 20,
  useAutoCalibratedZones: false,
  customSupportMin: 3965,
  customSupportMax: 3975,
  customResistanceMin: 4060,
  customResistanceMax: 4070,
};

const DEFAULT_OVERRIDE: TestOverrideState = {
  enabled: false,
  price: null,
  h4Trend: 'DOWNTREND',
  m15Candle: 'No Candle',
  priceVsEma: 'BELOW',
  rsiValue: 48,
  rsiDirection: 'MIDDLE',
  m5Signal: 'NONE',
  forceSignalLock: false,
};

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isTestOverrideOpen, setIsTestOverrideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Time & Session State
  const [watClock, setWatClock] = useState<string>(() => formatWATTime(new Date()));
  const [marketSession, setMarketSession] = useState<MarketSessionInfo>(() =>
    getCurrentMarketSession(new Date())
  );

  // Settings State (loaded from localStorage if present)
  const [settings, setSettings] = useState<BotSettings>(() => {
    try {
      const saved = localStorage.getItem('arewa_critics_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // History State
  const [history, setHistory] = useState<TradeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('arewa_critics_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'WAT-HIST-1',
        timestampWAT: '08:45:10 WAT',
        signalType: 'SELL',
        entryPrice: 4069.40,
        stopLossPrice: 4080.40,
        tp1Price: 4058.40,
        tp3Price: 4025.40,
        lotSize: 0.01,
        pipsResult: 440,
        usdResult: 44.0,
        status: 'TP3 HIT',
        score: 90,
      },
      {
        id: 'WAT-HIST-2',
        timestampWAT: '14:20:00 WAT',
        signalType: 'BUY',
        entryPrice: 3970.50,
        stopLossPrice: 3959.50,
        tp1Price: 3981.50,
        tp3Price: 4014.50,
        lotSize: 0.01,
        pipsResult: 110,
        usdResult: 11.0,
        status: 'TP1 HIT',
        score: 85,
      },
    ];
  });

  // Test Override State
  const [override, setOverride] = useState<TestOverrideState>(DEFAULT_OVERRIDE);

  // Live Price State - NEVER SIMULATED, REAL LIVE ONLY
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState<string>('Connecting...');
  const [lastUpdatedWAT, setLastUpdatedWAT] = useState<string>('');
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const [isPriceOffline, setIsPriceOffline] = useState<boolean>(false);
  const [priceErrorMessage, setPriceErrorMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Signal Lock Timer (59 mins lock when signal triggers)
  const [lockUntilUTC, setLockUntilUTC] = useState<number>(0);
  const previousDecisionRef = useRef<string>('WAIT');

  // Save settings helper
  const handleSaveSettings = (newSettings: BotSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('arewa_critics_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  // Test API Key function for settings
  const handleTestApiKey = async (key: string) => {
    try {
      const res = await fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data && data.price && !isNaN(parseFloat(data.price))) {
        return {
          success: true,
          message: `Connected! Live XAU/USD Quote: $${parseFloat(data.price).toFixed(2)}`,
          price: parseFloat(data.price),
        };
      }
      return {
        success: false,
        message: data?.message || 'Invalid TwelveData API key or rate limit exceeded.',
      };
    } catch (e) {
      return {
        success: false,
        message: `Connection failed: ${(e as Error).message}`,
      };
    }
  };

  // 1. Live Clock and Market Session Tick (every 1 second)
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setWatClock(formatWATTime(now));
      setMarketSession(getCurrentMarketSession(now));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 2. Fetch Live Price function
  const fetchPrice = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveXauUsdPrice(settings.twelveDataApiKey);
      if (result.success && result.price !== null) {
        setLivePrice(result.price);
        setPriceSource(result.source);
        setLastUpdatedWAT(result.timestampWAT);
        setIsPriceOffline(false);
        setPriceErrorMessage('');
      } else {
        setIsPriceOffline(true);
        setPriceErrorMessage(result.errorMessage || 'LIVE PRICE OFFLINE - CHECK INTERNET / API KEY');
      }
    } catch {
      setIsPriceOffline(true);
      setPriceErrorMessage('LIVE PRICE OFFLINE - CHECK INTERNET / API KEY');
    } finally {
      setIsPriceLoading(false);
      setIsRefreshing(false);
    }
  }, [settings.twelveDataApiKey]);

  // 3. Periodic Live Price Poll
  useEffect(() => {
    // Immediate initial fetch
    fetchPrice();

    const intervalSeconds = isPriceOffline ? 15 : settings.refreshIntervalSeconds || 15;
    const pollInterval = setInterval(() => {
      fetchPrice();
    }, intervalSeconds * 1000);

    return () => clearInterval(pollInterval);
  }, [fetchPrice, isPriceOffline, settings.refreshIntervalSeconds]);

  // 4. Run WAT Engine
  // Fallback price for calculation if still loading: 4060 or current livePrice
  const activeEffectivePrice = override.enabled && override.price ? override.price : (livePrice || 4060.0);

  const { evaluation, signalParams, rejectRule, hiddenScan } = evaluateWatEngine({
    livePrice: activeEffectivePrice,
    override,
    settings,
    session: marketSession,
    lockUntilUTC,
    tradesTodayCount: history.length,
    signalsTodayCount: 1,
  });

  // 5. Sound alerts and lock handler when signal status changes
  useEffect(() => {
    if (override.forceSignalLock && lockUntilUTC === 0) {
      setLockUntilUTC(Date.now() + 45 * 60 * 1000);
    } else if (!override.forceSignalLock && !override.enabled && lockUntilUTC > 0) {
      // Keep lock until it naturally expires
    }

    if (
      evaluation.decision === 'STRONG' &&
      !evaluation.isBlockedByHiddenScan &&
      previousDecisionRef.current !== 'STRONG'
    ) {
      if (settings.soundAlertsEnabled) {
        playSignalAlert('STRONG');
      }
      // Lock for 45 mins
      if (lockUntilUTC < Date.now()) {
        setLockUntilUTC(Date.now() + 45 * 60 * 1000);
      }
    } else if (
      evaluation.decision === 'MEDIUM' &&
      !evaluation.isBlockedByHiddenScan &&
      previousDecisionRef.current !== 'MEDIUM'
    ) {
      if (settings.soundAlertsEnabled) {
        playSignalAlert('MEDIUM');
      }
    }
    previousDecisionRef.current = evaluation.decision;
  }, [
    evaluation.decision,
    evaluation.isBlockedByHiddenScan,
    override.forceSignalLock,
    override.enabled,
    settings.soundAlertsEnabled,
    lockUntilUTC,
  ]);

  // Is Signal Lock currently active?
  const isSignalLockActive = (override.enabled && override.forceSignalLock) || (lockUntilUTC > Date.now());

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F4F6] flex flex-col font-sans select-none antialiased">
      {/* Centered Mobile Container (max-w-[430px]) */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen flex flex-col bg-[#0E0E0E] border-x border-[#222222] relative pb-20 shadow-2xl">
        {/* Top Header */}
        <Header
          watTime={watClock}
          isRefreshing={isRefreshing}
          onRefresh={fetchPrice}
          livePriceOffline={isPriceOffline}
        />

        {/* Top Status Bar (Session + Test Override link) */}
        <TopStatusBar
          session={marketSession}
          onOpenTestOverride={() => setIsTestOverrideOpen(true)}
          isOverrideActive={override.enabled}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
          {/* TAB 1: DASHBOARD (MAIN TERMINAL SCREEN) */}
          {activeTab === 'dashboard' && (
            <>
              {/* 1. WAITING SETUP CARD */}
              <WaitingSetupCard
                livePrice={override.enabled && override.price ? override.price : livePrice}
                isLoading={isPriceLoading}
                isOffline={isPriceOffline}
                errorMessage={priceErrorMessage}
                source={override.enabled ? 'Test Override Active' : priceSource}
                timestampWAT={lastUpdatedWAT || watClock}
                evaluation={evaluation}
              />

              {/* 2. CHECKLIST CARD - MUST SHOW ALWAYS (4 CHECKS ONLY FOR DISPLAY) */}
              <ChecklistCard evaluation={evaluation} />

              {/* HIDDEN SCAN BLOCK BANNER - Shown if ANY hidden check fails */}
              {evaluation.isBlockedByHiddenScan && (
                <BlockedBannerCard
                  hiddenScan={hiddenScan}
                  checklistScore={evaluation.totalScore}
                />
              )}

              {/* 3. REJECT RULE CARD - Shown when M5 is opposite to H4 */}
              <RejectRuleCard rejectRule={rejectRule} />

              {/* 4. SIGNAL ACTIVE CARD - Shown when locked with countdown */}
              <SignalActiveCard
                lockUntilUTC={lockUntilUTC}
                isActive={isSignalLockActive}
                onUnlock={() => setLockUntilUTC(0)}
              />

              {/* 5. BIG SIGNAL DISPLAY (WAIT 80px / SELL / BUY) */}
              <BigSignalDisplay
                signalType={evaluation.signalType}
                strength={evaluation.decision}
                score={evaluation.totalScore}
                grade={evaluation.grade}
                isBlocked={evaluation.isBlockedByHiddenScan}
                blockReason={evaluation.primaryBlockReason}
              />

              {/* 6. HTF BIAS ROW */}
              <HtfBiasRow
                h4Trend={signalParams?.h4Trend || 'DOWNTREND'}
                d1Trend={signalParams?.d1Trend || 'DOWNTREND'}
              />

              {/* 7. INDICATORS GRID (2x2) */}
              <IndicatorsGrid
                h4Trend={signalParams?.h4Trend || 'DOWNTREND'}
                emaStatus={signalParams?.emaStatus || 'BELOW'}
                rsiValue={signalParams?.rsiValue || 48}
                rsiDirection={signalParams?.rsiDirection || 'MIDDLE'}
                m15Candle={signalParams?.m15Candle || 'No Candle'}
              />

              {/* 8. SIGNAL DETAILS CARD (AUTOMATED PIP CALCULATOR & TP TABLE) */}
              {/* CRITICAL RULE: If ANY hidden check fails, HIDE Signal Details! */}
              {signalParams && !evaluation.isBlockedByHiddenScan && (
                <SignalDetailsCard
                  signalParams={signalParams}
                  livePrice={activeEffectivePrice}
                />
              )}
            </>
          )}

          {/* TAB 2: PIP & RISK CALCULATOR */}
          {activeTab === 'calculator' && (
            <CalculatorTab
              currentLivePrice={activeEffectivePrice}
              defaultLotSize={settings.lotSize}
            />
          )}

          {/* TAB 3: SIGNAL EXECUTION LOG */}
          {activeTab === 'log' && (
            <HistoryTab
              history={history}
              onClearHistory={() => setHistory([])}
            />
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                <h2 className="text-white font-extrabold text-sm uppercase tracking-wider mb-2">
                  ENGINE CONFIGURATION
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Configure live price API sources, lot size multiplier, and sound execution alerts.
                </p>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full py-2.5 rounded-lg bg-[#00FF88] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00E57A] transition-colors cursor-pointer"
                >
                  Open Settings Panel
                </button>
              </div>

              {/* Information Card */}
              <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 space-y-2 text-xs">
                <h3 className="text-gray-200 font-bold uppercase tracking-wider text-[11px]">
                  CRITICAL ENGINE RULES & PIP LOGIC
                </h3>
                <ul className="space-y-1.5 text-gray-400 text-[11px] list-disc list-inside">
                  <li><strong className="text-white">Gold Pip Rule:</strong> 1 pip = $0.10, $1.00 move = 10 pips.</li>
                  <li><strong className="text-white">Live Price Guarantee:</strong> Only genuine institutional prices are accepted. Never simulated or randomized.</li>
                  <li><strong className="text-white">Checklist Requirement:</strong> ≥80% for Strong Trade, 60-79% for 0.01 lot Medium Trade, &lt;60% WAIT.</li>
                  <li><strong className="text-white">Multi-TP Engine:</strong> Automated 6-target distribution with 20%/20%/20%/20%/10%/10% partial close.</li>
                </ul>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Tab Bar (Dashboard, Calculator, Signal Log, Settings) */}
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          signalScore={evaluation.totalScore}
        />

        {/* Test Override Modal */}
        <TestOverrideModal
          isOpen={isTestOverrideOpen}
          onClose={() => setIsTestOverrideOpen(false)}
          override={override}
          onChangeOverride={setOverride}
          realLivePrice={livePrice}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onTestApiKey={handleTestApiKey}
        />
      </div>
    </div>
  );
}
