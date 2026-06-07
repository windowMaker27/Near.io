/**
 * parseOpeningHours.ts
 *
 * Parse la syntaxe OSM opening_hours ET le format Near.io ("Lu-Ve 08h-20h ; Sa 10h-18h").
 * Retourne : status ('open'|'closed'|'unknown') + closingTime (heure de fermeture du jour, ex: "20h")
 */
import { OpeningStatus } from '@/types/place';

export interface OpeningInfo {
  status: OpeningStatus;
  /** Heure de fermeture du jour courant, ex: "20h" ou "20h30" — undefined si inconnue */
  closingTime?: string;
}

const FR_TO_OSM: Record<string, string> = {
  Lu: 'Mo', Ma: 'Tu', Me: 'We', Je: 'Th', Ve: 'Fr', Sa: 'Sa', Di: 'Su',
};

const OSM_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function dayIndex(token: string): number {
  const normalized = FR_TO_OSM[token] ?? token;
  return OSM_DAYS.indexOf(normalized);
}

function timeToMinutes(t: string): number | null {
  // Supporte : "08h" "08h30" "08:30" "8" "08h00" "20h"
  const cleaned = t.trim().replace(/h/i, ':');
  const [hStr, mStr = '0'] = cleaned.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/** Formate des minutes depuis minuit en "20h" ou "20h30" */
function minutesToDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
}

function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

interface RuleResult {
  status: OpeningStatus;
  closingTime?: string;
}

function parseRule(rule: string): RuleResult | null {
  const trimmed = rule.trim();
  if (!trimmed) return null;

  if (trimmed === '24/7') return { status: 'open', closingTime: undefined };

  const spaceIdx = trimmed.lastIndexOf(' ');
  if (spaceIdx === -1) return null;

  const daysPart = trimmed.slice(0, spaceIdx).trim();
  const hoursPart = trimmed.slice(spaceIdx + 1).trim();

  // Trouve le séparateur entre heure ouverture et fermeture
  // Le "-" peut aussi apparaître dans les heures ("08h-20h") — on cherche le 2e token
  const dashIdx = hoursPart.lastIndexOf('-');
  if (dashIdx === -1) return null;

  const openMin = timeToMinutes(hoursPart.slice(0, dashIdx));
  const closeMin = timeToMinutes(hoursPart.slice(dashIdx + 1));
  if (openMin === null || closeMin === null) return null;

  const today = todayIndex();
  const dayRangeDash = daysPart.indexOf('-');
  let applies = false;

  if (dayRangeDash !== -1) {
    const fromDay = dayIndex(daysPart.slice(0, dayRangeDash).trim());
    const toDay = dayIndex(daysPart.slice(dayRangeDash + 1).trim());
    applies = fromDay !== -1 && toDay !== -1 && today >= fromDay && today <= toDay;
  } else if (daysPart.includes(',')) {
    applies = daysPart.split(',').some((d) => dayIndex(d.trim()) === today);
  } else {
    applies = dayIndex(daysPart.trim()) === today;
  }

  if (!applies) return null;

  const now = nowMinutes();
  const effectiveClose = closeMin === 0 ? 24 * 60 : closeMin;
  const closingTime = minutesToDisplay(effectiveClose);

  return {
    status: now >= openMin && now < effectiveClose ? 'open' : 'closed',
    closingTime,
  };
}

export function parseOpeningHoursInfo(raw: string | undefined): OpeningInfo {
  if (!raw) return { status: 'unknown' };

  const rules = raw.split(/[;,]/).map((r) => r.trim()).filter(Boolean);

  for (const rule of rules) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }

  return { status: 'unknown' };
}

/** Rétrocompatibilité — retourne juste le statut */
export function parseOpeningHours(raw: string | undefined): OpeningStatus {
  return parseOpeningHoursInfo(raw).status;
}
