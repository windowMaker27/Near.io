import { OpeningStatus } from '@/types/place';

export interface OpeningInfo {
  status: OpeningStatus;
  closingTime?: string;
}

const FR_TO_OSM: Record<string, string> = {
  Lu: 'Mo', Ma: 'Tu', Me: 'We', Je: 'Th', Ve: 'Fr', Sa: 'Sa', Di: 'Su',
};
const OSM_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function dayIndex(token: string): number {
  const normalized = FR_TO_OSM[token.trim()] ?? token.trim();
  return OSM_DAYS.indexOf(normalized);
}

function timeToMinutes(t: string): number | null {
  const s = t.trim();
  const hFmt = s.match(/^(\d{1,2})[hH](\d{0,2})$/);
  if (hFmt) {
    const h = parseInt(hFmt[1], 10);
    const m = hFmt[2] ? parseInt(hFmt[2], 10) : 0;
    if (h > 24 || m > 59) return null;
    return h * 60 + m;
  }
  const colonFmt = s.match(/^(\d{1,2}):(\d{2})$/);
  if (colonFmt) {
    const h = parseInt(colonFmt[1], 10);
    const m = parseInt(colonFmt[2], 10);
    if (h > 24 || m > 59) return null;
    return h * 60 + m;
  }
  const intFmt = s.match(/^(\d{1,2})$/);
  if (intFmt) {
    const h = parseInt(intFmt[1], 10);
    if (h > 24) return null;
    return h * 60;
  }
  return null;
}

function minutesToDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  // Toujours 2 chiffres pour l'heure (ex: 0h → "00h")
  const hh = h.toString().padStart(2, '0');
  return m === 0 ? `${hh}h` : `${hh}h${m.toString().padStart(2, '0')}`;
}

function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}
function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

const TIME_RANGE_RE =
  /([\d]{1,2}(?:[hH][\d]{0,2}|:[\d]{2})?)\s*-\s*([\d]{1,2}(?:[hH][\d]{0,2}|:[\d]{2})?)\s*$/;

interface RuleResult {
  status: OpeningStatus;
  closingTime?: string;
}

function parseRule(rule: string): RuleResult | null {
  const trimmed = rule.trim();
  if (!trimmed) return null;
  if (trimmed === '24/7') return { status: 'open' };

  const timeMatch = trimmed.match(TIME_RANGE_RE);
  if (!timeMatch) return null;

  const openMin = timeToMinutes(timeMatch[1]);
  const closeMin = timeToMinutes(timeMatch[2]);
  if (openMin === null || closeMin === null) return null;

  const daysPart = trimmed.slice(0, timeMatch.index).trim();
  if (!daysPart) return null;

  const today = todayIndex();
  let applies = false;

  const dayGroups = daysPart.split(',').map((g) => g.trim()).filter(Boolean);
  for (const group of dayGroups) {
    const dashIdx = group.indexOf('-');
    if (dashIdx !== -1) {
      const fromDay = dayIndex(group.slice(0, dashIdx));
      const toDay = dayIndex(group.slice(dashIdx + 1));
      if (fromDay !== -1 && toDay !== -1 && today >= fromDay && today <= toDay) {
        applies = true;
        break;
      }
    } else {
      if (dayIndex(group) === today) { applies = true; break; }
    }
  }

  if (!applies) return null;

  const now = nowMinutes();
  const effectiveClose = closeMin === 0 ? 24 * 60 : closeMin;
  return {
    status: now >= openMin && now < effectiveClose ? 'open' : 'closed',
    closingTime: minutesToDisplay(effectiveClose),
  };
}

export function parseOpeningHoursInfo(raw: string | undefined): OpeningInfo {
  if (!raw) return { status: 'unknown' };
  for (const rule of raw.split(';').map((r) => r.trim()).filter(Boolean)) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }
  for (const rule of raw.split(',').map((r) => r.trim()).filter(Boolean)) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }
  return { status: 'unknown' };
}

export function parseOpeningHours(raw: string | undefined): OpeningStatus {
  return parseOpeningHoursInfo(raw).status;
}
