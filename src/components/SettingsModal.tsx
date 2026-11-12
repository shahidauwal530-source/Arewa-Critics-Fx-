import React, { useState } from 'react';
import { X, Settings, Key, Sliders, Volume2, VolumeX, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { BotSettings } from '../types/forex';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotSettings;
  onSaveSettings: (next: BotSettings) => void;
  onTestApiKey: (key: string) => Promise<{ success: boolean; message: string; price?: number }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestApiKey,
}) => {
  const [apiKey, setApiKey] = useState(settings.twelveDataApiKey);
  const [lotSize, setLotSize] = useState(settings.lotSize);
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshIntervalSeconds);
  const [soundAlerts, setSoundAlerts] = useState(settings.soundAlertsEnabled);
  const [testResult, setTestResult] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ loading: false, success: false, message: 'Please enter a TwelveData API key first.' });
      return;
    }
    setTestResult({ loading: true });
    const res = await onTestApiKey(apiKey.trim());
    setTestResult({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      twelveDataApiKey: apiKey.trim(),
      lotSize: Math.max(0.01, lotSize),
      refreshIntervalSeconds: refreshInterval,
      soundAlertsEnabled: soundAlerts,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#141414] border border-[#2E2E2E] rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-[#262626] flex items-center justify-between bg-[#191919]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#00FF88]" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              ENGINE SETTINGS & API KEYS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#222222] hover:bg-[#333333] text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* TwelveData API Key Input */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-bold text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FFD700]" />
                TwelveData API Key (Priority Source #1):
              </label>
              <a
                href="https://twelvedata.com/pricing"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#00FF88] hover:underline flex items-center gap-0.5"
              >
                Get Free Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                placeholder="Enter TwelveData API Key..."
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-[#111111] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#00FF88]"
              />
              <button
                onClick={handleTestKey}
                disabled={testResult.loading}
                className="bg-[#242424] hover:bg-[#333333] text-gray-200 font-bold px-3 py-1.5 rounded-lg border border-[#3A3A3A] transition-colors cursor-pointer disabled:opacity-50"
              >
                {testResult.loading ? 'Testing...' : 'Test'}
              </button>
            </div>

            {testResult.message && (
              <div
                className={`p-2 rounded-lg text-[10.5px] font-mono flex items-center gap-1.5 ${
                  testResult.success
                    ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40'
                    : 'bg-[#FF3333]/15 text-[#FF3333] border border-[#FF3333]/40'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <p className="text-[10px] text-gray-400 leading-tight">
              When present, TwelveData is prioritized. When blank or exhausted, the engine seamlessly cascades to GoldPrice.org, Metals.live, and Institutional Live Spot Gold Feed.
            </p>
          </div>

          {/* Lot Size Setting */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-bold block text-xs">
                  Default Trading Lot Size:
                </span>
                <span className="text-[10px] text-gray-400">
                  Standard pip value: 0.01 Lot = $0.10/pip | 0.10 Lot = $1.00/pip
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.0"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.01)}
                  className="w-16 bg-[#111111] border border-[#333333] rounded-lg px-2 py-1 text-center font-mono font-black text-white text-xs focus:outline-none focus:border-[#00FF88]"
                />
                <span className="text-[10px] text-gray-400 font-mono">Lot</span>
              </div>
            </div>
          </div>

          {/* Auto Refresh Interval */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-bold">
                Live Price Fetch Interval:
              </span>
              <span className="font-mono text-[#00FF88] font-bold">
                Every {refreshInterval} seconds
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="w-full accent-[#00FF88]"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
              <span>10s (High-Frequency)</span>
              <span>20s (Standard)</span>
              <span>30s (Conservative)</span>
            </div>
          </div>

          {/* Sound Alerts */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundAlerts ? (
                <Volume2 className="w-4 h-4 text-[#00FF88]" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
              <div>
                <span className="text-gray-300 font-bold block text-xs">
                  Sound Execution Alerts
                </span>
                <span className="text-[10px] text-gray-400">
                  Audio chime on Strong Signals (80%+) & Medium warnings
                </span>
              </div>
            </div>

            <button
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundAlerts ? 'bg-[#00FF88]' : 'bg-[#333333]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                  soundAlerts ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Internal Levels Reference (Rule 2) */}
          <div className="bg-[#161616] border border-[#282828] rounded-xl p-3 space-y-1.5 text-[11px]">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
              INTERNAL ENGINE S/R LEVELS (LOGIC ONLY)
            </span>
            <div className="font-mono text-gray-300 space-y-0.5 text-[10.5px]">
              <div>• Resistance: <strong className="text-[#FF3333]">4060 - 4070</strong> (Mid: 4049 / 4026)</div>
              <div>• Support: <strong className="text-[#00FF88]">3965 - 3975</strong> (Mid: 3938 / 3913)</div>
              <div>• Middle Zone (No Trade): <strong className="text-[#FFD700]">3990 - 4020</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#262626] bg-[#191919] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#333333] text-gray-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#00FF88] hover:bg-[#00E57A] text-black text-xs font-black cursor-pointer transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
