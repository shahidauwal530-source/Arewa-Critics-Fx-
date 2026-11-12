/**
 * AREWA CRITICS - Forex Signal Bot - WAT Engine - PRO
 * Core Domain Types
 */

export type MarketSessionType = 'ASIA' | 'LONDON' | 'NY' | 'OFF_HOURS';

export interface MarketSessionInfo {
  type: MarketSessionType;
  name: string;
  subtext: string;
  statusText: string;
  color: string; // hex
  isActive: boolean;
}

export type SignalType = 'WAIT' | 'SELL' | 'BUY';
export type SignalGrade = 'A' | 'B' | 'D';
export type SignalStrength = 'STRONG' | 'MEDIUM' | 'WAIT';

export interface ChecklistItem {
  id: 'timeframe' | 'sr' | 'ema' | 'rsi';
  name: string;
  weight: number; // percentage (30, 30, 20, 20)
  passed: boolean;
  scoreAwarded: number;
  displayText: string;
  missingReason?: string;
  details: string;
}

export interface ChecklistEvaluation {
  checks: ChecklistItem[];
  totalScore: number; // 0 - 100
  passedCount: number; // 0 - 4
  decision: SignalStrength;
  signalType: SignalType;
  missingSummary: string;
  statusBadge: string;
  grade: SignalGrade;
  isBlockedByHiddenScan: boolean;
  primaryBlockReason: string | null;
  hiddenScan?: HiddenScanEvaluation;
}

export interface TPLevelCalculation {
  tier: string; // TP1, TP2, TP3, TP4, TP5, TP6
  rMultiple: string; // 1R, 2R, 4R, 6R, 7R, 3R Trail
  price: number;
  pips: number;
  profitUsd: number;
  closePercent: number; // e.g., 20%
  totalPipsIfHit: number;
  distanceFromLive: number;
  isHit?: boolean;
}

export interface SignalParameters {
  id: string;
  pair: 'XAUUSD';
  signalType: SignalType;
  decision: SignalStrength;
  grade: SignalGrade;
  score: number;
  entryPrice: number;
  stopLossPrice: number;
  riskPips: number;
  riskUsd: number;
  lotSize: number;
  tpLevels: TPLevelCalculation[];
  totalPotentialPips: number;
  totalPotentialUsd: number;
  directDistancePips: number; // Entry to TP6
  timestampWAT: string;
  timeUTC: number;
  lockUntilUTC: number;
  h4Trend: 'UPTREND' | 'DOWNTREND' | 'UNCLEAR';
  d1Trend: 'UPTREND' | 'DOWNTREND';
  m15Candle: string;
  emaStatus: 'BELOW' | 'ABOVE' | 'BETWEEN';
  rsiValue: number;
  rsiDirection: 'TURNING_DOWN' | 'TURNING_UP' | 'MIDDLE';
  warningMessage?: string;
}

export interface RejectRuleState {
  isTriggered: boolean;
  h4Trend: 'UPTREND' | 'DOWNTREND';
  m5Direction: 'BUY' | 'SELL';
  expectedSetup: string;
  explanation: string;
}

export interface LivePriceData {
  price: number;
  source: string;
  timestampWAT: string;
  timestampUTC: number;
  isLoading: boolean;
  isOffline: boolean;
  errorMessage?: string;
  change24h?: number;
}

export interface BotSettings {
  twelveDataApiKey: string;
  lotSize: number; // default 0.01
  accountBalance: number; // for calculator
  refreshIntervalSeconds: number; // 10 - 30
  soundAlertsEnabled: boolean;
  srTolerancePips: number; // tolerance around zones
  useAutoCalibratedZones: boolean; // if true, adapts to current market wave
  customSupportMin: number;
  customSupportMax: number;
  customResistanceMin: number;
  customResistanceMax: number;
}

export interface HiddenCheckItem {
  id:
    | 'structure'
    | 'liquidity'
    | 'volume'
    | 'spread'
    | 'volatility'
    | 'session'
    | 'news'
    | 'mtf'
    | 'daily_limit'
    | 'signal_lock';
  name: string;
  passed: boolean;
  blockReason: string;
  metric: string;
  isCriticalBlocker: boolean;
}

export interface HiddenScanEvaluation {
  isBlocked: boolean;
  primaryBlockReason: string | null;
  blockedChecks: HiddenCheckItem[];
  allChecks: HiddenCheckItem[];
  passedCount: number;
  totalCount: number;
  spreadPips: number;
  newsUpcoming: { event: string; minutesAway: number; isImpactHigh: boolean } | null;
  volatility15mPips: number;
  volumeStatus: 'INCREASING' | 'AVERAGE' | 'LOW';
  marketStructure: 'BOS_CONFIRMED' | 'CHOCH_CONFIRMED' | 'RANGING' | 'UNCLEAR';
  liquiditySwept: boolean;
  tradesTodayCount: number;
  signalsTodayCount: number;
}

export interface TestOverrideState {
  enabled: boolean;
  price: number | null;
  h4Trend: 'DOWNTREND' | 'UPTREND';
  m15Candle: string;
  priceVsEma: 'BELOW' | 'ABOVE' | 'BETWEEN';
  rsiValue: number;
  rsiDirection: 'TURNING_DOWN' | 'TURNING_UP' | 'MIDDLE';
  m5Signal: 'SELL' | 'BUY' | 'NONE';
  forceSignalLock: boolean;
  presetName?: string;
  // Hidden checks overrides
  spreadPips?: number;
  newsMinutesAway?: number | null;
  newsEventName?: string;
  volumeStatus?: 'INCREASING' | 'AVERAGE' | 'LOW';
  marketStructure?: 'BOS_CONFIRMED' | 'CHOCH_CONFIRMED' | 'RANGING';
  liquiditySwept?: boolean;
  volatility15mPips?: number;
  dailyTradesCount?: number;
  forceAllHiddenPass?: boolean;
}

export interface TradeHistoryItem {
  id: string;
  timestampWAT: string;
  signalType: SignalType;
  entryPrice: number;
  stopLossPrice: number;
  tp1Price: number;
  tp3Price: number;
  lotSize: number;
  pipsResult: number;
  usdResult: number;
  status: 'TP1 HIT' | 'TP3 HIT' | 'FULL TP HIT' | 'SL HIT' | 'ACTIVE';
  score: number;
}

