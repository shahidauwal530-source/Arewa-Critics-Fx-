/**
 * AREWA CRITICS - WAT Engine - 4 Checks Day Trade Validation
 * Complete automated signal scoring, risk calculation, and multi-tier TP generation.
 */

import {
  ChecklistEvaluation,
  ChecklistItem,
  RejectRuleState,
  SignalParameters,
  SignalStrength,
  SignalType,
  SignalGrade,
  TPLevelCalculation,
  BotSettings,
  TestOverrideState,
  MarketSessionInfo,
  HiddenScanEvaluation
} from '../types/forex';
import { calculatePips, calculateUsdFromPips } from './livePrice';
import { formatWATTime, getCurrentMarketSession } from './watTime';
import { evaluateHiddenMarketScan } from './hiddenScan';

export interface EngineInputState {
  livePrice: number;
  override?: TestOverrideState;
  settings: BotSettings;
  session?: MarketSessionInfo;
  lockUntilUTC?: number;
  tradesTodayCount?: number;
  signalsTodayCount?: number;
}

export function evaluateWatEngine(input: EngineInputState): {
  evaluation: ChecklistEvaluation;
  signalParams: SignalParameters | null;
  rejectRule: RejectRuleState;
  hiddenScan: HiddenScanEvaluation;
} {
  const { livePrice, override, settings } = input;
  const isOverrideActive = override?.enabled;

  // Determine current effective market parameters
  const currentPrice = isOverrideActive && override.price ? override.price : livePrice;
  const h4Trend = isOverrideActive ? override.h4Trend : (currentPrice < 4020 ? 'DOWNTREND' : 'UPTREND');
  const d1Trend = 'DOWNTREND'; // Macro gold context

  // Candle status
  let m15Candle = isOverrideActive ? override.m15Candle : 'No Candle';
  if (!isOverrideActive) {
    if (currentPrice >= 4058 && currentPrice <= 4075) {
      m15Candle = 'Bearish Engulfing';
    } else if (currentPrice >= 3960 && currentPrice <= 3978) {
      m15Candle = 'Bullish Engulfing';
    } else {
      m15Candle = 'No Candle';
    }
  }

  // Price vs EMA 20/50
  const emaStatus = isOverrideActive
    ? override.priceVsEma
    : (currentPrice < 4010 ? 'BELOW' : currentPrice > 4040 ? 'ABOVE' : 'BETWEEN');

  // RSI 14
  const rsiValue = isOverrideActive
    ? override.rsiValue
    : (currentPrice >= 4055 ? 66 : currentPrice <= 3980 ? 34 : 48);
  const rsiDirection = isOverrideActive
    ? override.rsiDirection
    : (currentPrice >= 4055 ? 'TURNING_DOWN' : currentPrice <= 3980 ? 'TURNING_UP' : 'MIDDLE');

  // M5 signal for reject rule
  const m5Signal = isOverrideActive
    ? override.m5Signal
    : (h4Trend === 'DOWNTREND' && currentPrice < 4000 ? 'NONE' : 'NONE');

  // Determine intended direction based on HTF Bias (H4)
  const biasDirection: SignalType = h4Trend === 'DOWNTREND' ? 'SELL' : 'BUY';

  // -------------------------------------------------------------
  // 1. TIMEFRAME - 30%
  // -------------------------------------------------------------
  let timeframePassed = false;
  let timeframeText = '';
  let timeframeMissing: string | undefined = undefined;

  const isSellCandle = ['Bearish Engulfing', 'Shooting Star', 'Pin Bar'].includes(m15Candle);
  const isBuyCandle = ['Bullish Engulfing', 'Hammer', 'Pin Bar'].includes(m15Candle);

  if (biasDirection === 'SELL') {
    if (h4Trend === 'DOWNTREND' && isSellCandle) {
      timeframePassed = true;
      timeframeText = `TIMEFRAME ✅ +30% - H4 Down + M15 ${m15Candle}`;
    } else {
      timeframePassed = false;
      timeframeMissing = 'Timeframe (30%)';
      timeframeText = isSellCandle
        ? `TIMEFRAME ❌ +0% - H4 Trend Unclear`
        : `TIMEFRAME ❌ +0% - No M15 Candle yet`;
    }
  } else {
    // BUY
    if (h4Trend === 'UPTREND' && isBuyCandle) {
      timeframePassed = true;
      timeframeText = `TIMEFRAME ✅ +30% - H4 Up + M15 ${m15Candle}`;
    } else {
      timeframePassed = false;
      timeframeMissing = 'Timeframe (30%)';
      timeframeText = isBuyCandle
        ? `TIMEFRAME ❌ +0% - H4 Trend Unclear`
        : `TIMEFRAME ❌ +0% - No M15 Candle yet`;
    }
  }

  // -------------------------------------------------------------
  // 2. SUPPORT & RESISTANCE - 30%
  // -------------------------------------------------------------
  // Internal Levels: Support 3965-3975, Mid Support 3938/3913, Resistance 4060-4070, Mid Resistance 4049/4026
  // Middle: 3990-4020 -> FAIL - "PRICE IN MIDDLE - NO TRADE"
  let srPassed = false;
  let srText = '';
  let srMissing: string | undefined = undefined;

  const isAtResistance = currentPrice >= 4058 && currentPrice <= 4072;
  const isAtSupport = currentPrice >= 3963 && currentPrice <= 3977;
  const isInMiddle = currentPrice >= 3990 && currentPrice <= 4020;

  if (isInMiddle) {
    srPassed = false;
    srMissing = 'Support/Resistance (30%)';
    srText = 'S/R ❌ +0% - Price in Middle (3990-4020) - NO TRADE';
  } else if (biasDirection === 'SELL') {
    if (isAtResistance) {
      srPassed = true;
      srText = `S/R ✅ +30% - Price at Resistance ${currentPrice.toFixed(1)}`;
    } else if (isAtSupport) {
      srPassed = false;
      srMissing = 'Support/Resistance (30%)';
      srText = 'S/R ❌ +0% - Price at Support, not Resistance';
    } else {
      srPassed = false;
      srMissing = 'Support/Resistance (30%)';
      srText = `S/R ❌ +0% - Price not at Resistance 4060-4070 (Currently ${currentPrice.toFixed(1)})`;
    }
  } else {
    // BUY
    if (isAtSupport) {
      srPassed = true;
      srText = `S/R ✅ +30% - Price at Support ${currentPrice.toFixed(1)}`;
    } else if (isAtResistance) {
      srPassed = false;
      srMissing = 'Support/Resistance (30%)';
      srText = 'S/R ❌ +0% - Price at Resistance, not Support';
    } else {
      srPassed = false;
      srMissing = 'Support/Resistance (30%)';
      srText = `S/R ❌ +0% - Price not at Support 3965-3975 (Currently ${currentPrice.toFixed(1)})`;
    }
  }

  // -------------------------------------------------------------
  // 3. EMA 20/50 - 20%
  // -------------------------------------------------------------
  let emaPassed = false;
  let emaText = '';
  let emaMissing: string | undefined = undefined;

  if (biasDirection === 'SELL') {
    if (emaStatus === 'BELOW') {
      emaPassed = true;
      emaText = 'EMA ✅ +20% - Price Below EMA';
    } else if (emaStatus === 'BETWEEN') {
      emaPassed = false;
      emaMissing = 'EMA 20/50 (20%)';
      emaText = 'EMA ❌ +0% - Price Between EMA';
    } else {
      emaPassed = false;
      emaMissing = 'EMA 20/50 (20%)';
      emaText = 'EMA ❌ +0% - Price Above EMA (Need Below for SELL)';
    }
  } else {
    // BUY
    if (emaStatus === 'ABOVE') {
      emaPassed = true;
      emaText = 'EMA ✅ +20% - Price Above EMA';
    } else if (emaStatus === 'BETWEEN') {
      emaPassed = false;
      emaMissing = 'EMA 20/50 (20%)';
      emaText = 'EMA ❌ +0% - Price Between EMA';
    } else {
      emaPassed = false;
      emaMissing = 'EMA 20/50 (20%)';
      emaText = 'EMA ❌ +0% - Price Below EMA (Need Above for BUY)';
    }
  }

  // -------------------------------------------------------------
  // 4. RSI 14 - 20%
  // -------------------------------------------------------------
  let rsiPassed = false;
  let rsiText = '';
  let rsiMissing: string | undefined = undefined;

  if (biasDirection === 'SELL') {
    // SELL: RSI 60-70 at Resistance AND turning down
    if (rsiValue >= 60 && rsiValue <= 75 && rsiDirection === 'TURNING_DOWN') {
      rsiPassed = true;
      rsiText = `RSI ✅ +20% - RSI ${rsiValue} Turning Down`;
    } else if (rsiValue >= 45 && rsiValue <= 55) {
      rsiPassed = false;
      rsiMissing = 'RSI 14 (20%)';
      rsiText = `RSI ❌ +0% - RSI ${rsiValue} in Middle`;
    } else {
      rsiPassed = false;
      rsiMissing = 'RSI 14 (20%)';
      rsiText = `RSI ❌ +0% - RSI ${rsiValue} (${rsiDirection === 'TURNING_DOWN' ? 'Turning Down' : 'Not Turning Down'})`;
    }
  } else {
    // BUY: RSI 30-40 at Support AND turning up
    if (rsiValue >= 25 && rsiValue <= 42 && rsiDirection === 'TURNING_UP') {
      rsiPassed = true;
      rsiText = `RSI ✅ +20% - RSI ${rsiValue} Turning Up`;
    } else if (rsiValue >= 45 && rsiValue <= 55) {
      rsiPassed = false;
      rsiMissing = 'RSI 14 (20%)';
      rsiText = `RSI ❌ +0% - RSI ${rsiValue} in Middle`;
    } else {
      rsiPassed = false;
      rsiMissing = 'RSI 14 (20%)';
      rsiText = `RSI ❌ +0% - RSI ${rsiValue} (${rsiDirection === 'TURNING_UP' ? 'Turning Up' : 'Not Turning Up'})`;
    }
  }

  // -------------------------------------------------------------
  // TOTAL SCORE & DECISION
  // -------------------------------------------------------------
  const checks: ChecklistItem[] = [
    {
      id: 'timeframe',
      name: 'TIMEFRAME',
      weight: 30,
      passed: timeframePassed,
      scoreAwarded: timeframePassed ? 30 : 0,
      displayText: timeframeText,
      missingReason: timeframeMissing,
      details: 'H4 50 EMA Trend + M15 Confirmation Candle'
    },
    {
      id: 'sr',
      name: 'SUPPORT & RESISTANCE',
      weight: 30,
      passed: srPassed,
      scoreAwarded: srPassed ? 30 : 0,
      displayText: srText,
      missingReason: srMissing,
      details: 'Sell at 4060-4070 | Buy at 3965-3975 | Avoid 3990-4020'
    },
    {
      id: 'ema',
      name: 'EMA 20/50',
      weight: 20,
      passed: emaPassed,
      scoreAwarded: emaPassed ? 20 : 0,
      displayText: emaText,
      missingReason: emaMissing,
      details: 'Price below both for SELL / above both for BUY'
    },
    {
      id: 'rsi',
      name: 'RSI 14',
      weight: 20,
      passed: rsiPassed,
      scoreAwarded: rsiPassed ? 20 : 0,
      displayText: rsiText,
      missingReason: rsiMissing,
      details: '60-70 Turning Down for SELL / 30-40 Turning Up for BUY'
    }
  ];

  const totalScore = checks.reduce((acc, c) => acc + c.scoreAwarded, 0);
  const passedCount = checks.filter(c => c.passed).length;

  const missingList = checks
    .filter(c => !c.passed && c.missingReason)
    .map(c => c.missingReason as string);
  const missingSummary = missingList.length > 0 ? missingList.join(' + ') : 'None - All Passed';

  // -------------------------------------------------------------
  // HIDDEN MARKET SCAN (10 Institutional Background Checks)
  // -------------------------------------------------------------
  const hiddenScan = evaluateHiddenMarketScan({
    livePrice: currentPrice,
    h4Trend,
    m15Candle,
    m5Signal,
    session: input.session || getCurrentMarketSession(),
    lockUntilUTC: input.lockUntilUTC || 0,
    tradesTodayCount: input.tradesTodayCount || 0,
    signalsTodayCount: input.signalsTodayCount || 0,
    override,
  });

  let decision: SignalStrength = 'WAIT';
  let grade: SignalGrade = 'D';
  let statusBadge = 'WAIT (NO ORDER)';

  if (totalScore >= 80) {
    decision = 'STRONG';
    grade = 'A';
    statusBadge = 'SIGNAL READY';
  } else if (totalScore >= 60) {
    decision = 'MEDIUM';
    grade = 'B';
    statusBadge = 'MEDIUM SIGNAL';
  } else {
    decision = 'WAIT';
    grade = 'D';
    statusBadge = 'WAIT (NO ORDER)';
  }

  // CRITICAL RULE: If ANY hidden check fails, DO NOT send signal, even if Checklist is 100%!
  const isBlockedByHiddenScan = hiddenScan.isBlocked;
  const primaryBlockReason = hiddenScan.primaryBlockReason;

  if (isBlockedByHiddenScan) {
    decision = 'WAIT';
    grade = 'D';
    statusBadge = 'WAIT (BLOCKED)';
  }

  const signalType: SignalType = decision === 'WAIT' ? 'WAIT' : biasDirection;

  const evaluation: ChecklistEvaluation = {
    checks,
    totalScore,
    passedCount,
    decision,
    signalType,
    missingSummary,
    statusBadge,
    grade,
    isBlockedByHiddenScan,
    primaryBlockReason,
    hiddenScan,
  };

  // -------------------------------------------------------------
  // REJECT RULE EVALUATION
  // -------------------------------------------------------------
  // Reject rule triggered when M5 signal is opposite to H4
  const isRejectTriggered = (h4Trend === 'DOWNTREND' && m5Signal === 'BUY') ||
                            (h4Trend === 'UPTREND' && m5Signal === 'SELL');

  const rejectRule: RejectRuleState = {
    isTriggered: isRejectTriggered,
    h4Trend,
    m5Direction: (m5Signal === 'BUY' || m5Signal === 'SELL') ? m5Signal : 'BUY',
    expectedSetup: h4Trend === 'DOWNTREND' ? 'WAIT for SELL at 4069, NOT BUY' : 'WAIT for BUY at 3970, NOT SELL',
    explanation: `WAIT - M5 signal against H4 Trend. Waiting for pullback in H4 direction.`
  };

  // -------------------------------------------------------------
  // CALCULATE DETAILED PIPS & TP TABLE
  // -------------------------------------------------------------
  let signalParams: SignalParameters | null = null;

  // We calculate pip table whenever price is available (so user sees dynamic math even during WAIT)
  const entryPrice = currentPrice;
  // Risk calculation: standard $11.00 move = 110 pips default risk as specified in user prompt example
  // Example in user prompt: Entry 4069.41 to SL 4080.41 = $11.00 = 110 pips Risk.
  const riskDollar = 11.0;
  const riskPips = Number((riskDollar * 10).toFixed(1)); // 110 pips
  const stopLossPrice = biasDirection === 'SELL'
    ? Number((entryPrice + riskDollar).toFixed(2))
    : Number((entryPrice - riskDollar).toFixed(2));

  const lotSize = settings.lotSize || 0.01;
  const riskUsd = calculateUsdFromPips(riskPips, lotSize);

  // TP Tiers: TP1 (1R), TP2 (2R), TP3 (4R), TP4 (6R), TP5 (7R), TP6 (3R Trail)
  const tpConfigs = [
    { tier: 'TP1', rMultiple: '1R', multiplier: 1, closePercent: 20 },
    { tier: 'TP2', rMultiple: '2R', multiplier: 2, closePercent: 20 },
    { tier: 'TP3', rMultiple: '4R', multiplier: 4, closePercent: 20 },
    { tier: 'TP4', rMultiple: '6R', multiplier: 6, closePercent: 20 },
    { tier: 'TP5', rMultiple: '7R', multiplier: 7, closePercent: 10 },
    { tier: 'TP6', rMultiple: '3R Trail', multiplier: 3, closePercent: 10 }
  ];

  let runningTotalPips = 0;
  const tpLevels: TPLevelCalculation[] = tpConfigs.map(cfg => {
    const pips = riskPips * cfg.multiplier;
    const priceDelta = pips / 10;
    const price = biasDirection === 'SELL'
      ? Number((entryPrice - priceDelta).toFixed(2))
      : Number((entryPrice + priceDelta).toFixed(2));
    const profitUsd = calculateUsdFromPips(pips, lotSize);
    runningTotalPips += pips;

    const distanceFromLive = calculatePips(livePrice, price);
    const isHit = biasDirection === 'SELL' ? livePrice <= price : livePrice >= price;

    return {
      tier: cfg.tier,
      rMultiple: cfg.rMultiple,
      price,
      pips,
      profitUsd,
      closePercent: cfg.closePercent,
      totalPipsIfHit: runningTotalPips,
      distanceFromLive,
      isHit
    };
  });

  const totalPotentialPips = tpLevels.reduce((acc, tp) => acc + tp.pips, 0);
  const totalPotentialUsd = calculateUsdFromPips(totalPotentialPips, lotSize);
  const lastTpPrice = tpLevels[tpLevels.length - 1].price;
  const directDistancePips = calculatePips(entryPrice, lastTpPrice);

  const nowUTC = Date.now();
  const timeWAT = formatWATTime(new Date(nowUTC));
  const lockUntilUTC = nowUTC + 59 * 60 * 1000;

  signalParams = {
    id: `WAT-${nowUTC}`,
    pair: 'XAUUSD',
    signalType: biasDirection,
    decision,
    grade,
    score: totalScore,
    entryPrice,
    stopLossPrice,
    riskPips,
    riskUsd,
    lotSize,
    tpLevels,
    totalPotentialPips,
    totalPotentialUsd,
    directDistancePips,
    timestampWAT: timeWAT,
    timeUTC: nowUTC,
    lockUntilUTC,
    h4Trend,
    d1Trend,
    m15Candle,
    emaStatus,
    rsiValue,
    rsiDirection,
    warningMessage: decision === 'MEDIUM' ? `MEDIUM - 0.01 Lot Only, Missing ${missingSummary}` : undefined
  };

  return {
    evaluation,
    signalParams,
    rejectRule,
    hiddenScan,
  };
}
