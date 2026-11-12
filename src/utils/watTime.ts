/**
 * WAT (West Africa Time - GMT+1 / Nigeria) Time & Session Utilities
 */

import { MarketSessionInfo } from '../types/forex';

export function getWATDate(date: Date = new Date()): Date {
  // Convert current time to UTC, then add 1 hour for WAT (GMT+1)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 1);
}

export function formatWATTime(date: Date = new Date()): string {
  const watDate = getWATDate(date);
  const hours = String(watDate.getHours()).padStart(2, '0');
  const minutes = String(watDate.getMinutes()).padStart(2, '0');
  const seconds = String(watDate.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} WAT`;
}

export function formatWATDateTime(date: Date = new Date()): string {
  const watDate = getWATDate(date);
  const day = String(watDate.getDate()).padStart(2, '0');
  const month = watDate.toLocaleString('en-US', { month: 'short' });
  const year = watDate.getFullYear();
  const time = formatWATTime(date);
  return `${day} ${month} ${year}, ${time}`;
}

/**
 * Session determination based on Nigeria Time WAT:
 * - 2am-8am: ASIA SESSION - Range Market - Yellow
 * - 9am-12pm: LONDON SESSION - Breakout Market - Green
 * - 1pm-5pm: NY SESSION - Fast + News - Blue
 * - 6pm-1am: Market Closed / OFF HOURS - Red - Show "NOW: Market Closed"
 */
export function getCurrentMarketSession(date: Date = new Date()): MarketSessionInfo {
  const watDate = getWATDate(date);
  const hours = watDate.getHours();
  const dayOfWeek = watDate.getDay(); // 0 is Sunday, 6 is Saturday

  // Weekend check: Gold market closes Friday 10pm WAT to Sunday 11pm WAT
  const isWeekend = (dayOfWeek === 6) || (dayOfWeek === 0 && hours < 23) || (dayOfWeek === 5 && hours >= 22);

  if (isWeekend) {
    return {
      type: 'OFF_HOURS',
      name: 'WEEKEND CLOSED',
      subtext: 'Global Gold Market Closed',
      statusText: 'NOW: Market Closed',
      color: '#FF3333',
      isActive: false
    };
  }

  // 2am - 8am (02:00 - 07:59): ASIA SESSION
  if (hours >= 2 && hours < 8) {
    return {
      type: 'ASIA',
      name: 'ASIA SESSION',
      subtext: 'Range Market',
      statusText: 'NOW: ASIA SESSION (Range Market)',
      color: '#FFD700',
      isActive: true
    };
  }

  // 9am - 12pm (09:00 - 11:59): LONDON SESSION
  if (hours >= 9 && hours < 12) {
    return {
      type: 'LONDON',
      name: 'LONDON SESSION',
      subtext: 'Breakout Market',
      statusText: 'NOW: LONDON SESSION (Breakout Market)',
      color: '#00FF88',
      isActive: true
    };
  }

  // 1pm - 5pm (13:00 - 16:59): NY SESSION
  if (hours >= 13 && hours < 17) {
    return {
      type: 'NY',
      name: 'NY SESSION',
      subtext: 'Fast + News',
      statusText: 'NOW: NY SESSION (Fast + News)',
      color: '#00B4D8',
      isActive: true
    };
  }

  // 6pm - 1am (18:00 - 01:59) and transition hours (12:00-12:59, 17:00-17:59): Market Closed / OFF HOURS
  return {
    type: 'OFF_HOURS',
    name: 'OFF HOURS',
    subtext: 'Low Liquidity / Asian Open Preparation',
    statusText: 'NOW: Market Closed',
    color: '#FF3333',
    isActive: false
  };
}
