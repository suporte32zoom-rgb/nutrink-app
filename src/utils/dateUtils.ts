/**
 * Brasilia Time (America/Sao_Paulo) date and time utilities
 * Ensures all dates and times across the NutrinK platform reflect Brazil official time.
 */

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Returns current Date in Brasilia timezone
 */
export function getBrasiliaDate(): Date {
  const now = new Date();
  // Get string representation in Brasilia timezone
  const brazilDateStr = now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE });
  return new Date(brazilDateStr);
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Brasilia timezone
 */
export function getBrasiliaTodayISODate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // en-CA produces YYYY-MM-DD
}

/**
 * Returns current time formatted as HH:mm in Brasilia timezone
 */
export function getBrasiliaTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Returns current hour integer (0-23) in Brasilia timezone
 */
export function getBrasiliaCurrentHour(): number {
  const now = new Date();
  const hourStr = now.toLocaleTimeString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    hour12: false
  });
  return parseInt(hourStr, 10);
}

/**
 * Returns greeting in Portuguese based on Brasilia time:
 * Bom dia (05:00 - 11:59)
 * Boa tarde (12:00 - 17:59)
 * Boa noite (18:00 - 04:59)
 */
export function getGreetingByTime(): string {
  const hour = getBrasiliaCurrentHour();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

/**
 * Formats full date in pt-BR using Brasilia timezone
 * e.g. "Terça-feira, 18 de agosto de 2026"
 */
export function formatBrasiliaFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats short date in pt-BR (DD/MM/YYYY) using Brasilia timezone
 */
export function formatBrasiliaShortDate(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
