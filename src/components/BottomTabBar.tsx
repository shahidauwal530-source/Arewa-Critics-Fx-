import React from 'react';
import { LayoutDashboard, Calculator, History, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'calculator' | 'log' | 'settings';

interface BottomTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  signalScore: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  signalScore,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Terminal',
      icon: LayoutDashboard,
      badge: signalScore >= 80 ? 'HOT' : null,
    },
    {
      id: 'calculator' as TabType,
      label: 'Calculator',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'log' as TabType,
      label: 'Signal Log',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] safe-area-bottom">
      <div className="max-w-[430px] mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer ${
                isActive ? 'text-[#00FF88]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 bg-[#00FF88] text-black text-[8px] font-black px-1 rounded-full leading-none py-0.5">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-black text-[#00FF88]' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00FF88]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
