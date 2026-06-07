/**
 * parseOpeningHours.ts
 *
 * Parser minimal de la syntaxe OSM opening_hours.
 * Exemples supportés :
 *   "Mo-Fr 08:00-20:00"
 *   "Mo-Sa 09h00-21h00, Su 10h-18h"
 *   "Lu-Ve 08h-20h"
 *   "24/7"
 *
 * Retourne 'open' | 'closed' | 'unknown'
 */
import { OpeningStatus } from '@/types/place';

const FR_TO_OSM: Record<string, string> = {
  Lu: 'Mo', Ma: 'Tu', Me: 'We', Je: 'Th', Ve: 'Fr', Sa: 'Sa', Di: 'Su',
};

const OSM_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Normalise un token de jour (FR ou OSM) en index 0-6 */
function dayIndex(token: string): number {
  const normalized = FR_TO_OSM[token] ?? token;
  return OSM_DAYS.indexOf(normalized);
}

/** Convertit "08h" | "08h30" | "08:30" | "8" → minutes depuis minuit */
function timeToMinutes(t: string): number | null {
  const cleaned = t.trim().replace('h', ':').replace('::', ':');
  const [hStr, mStr = '0'] = cleaned.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/** Retourne l'index OSM du jour courant (0=Mo, 6=Su) */
function todayIndex(): number {
  // getDay() : 0=Sun → adapter
  return (new Date().getDay() + 6) % 7;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Parse une règle unique du type :
 * "Mo-Fr 08:00-20:00" ou "Sa 10:00-18:00"
 * Retourne null si non applicable aujourd'hui.
 */
function parseRule(rule: string): OpeningStatus | null {
  const trimmed = rule.trim();
  if (!trimmed) return null;

  // Cas spécial 24/7
  if (trimmed === '24/7') return 'open';

  // Sépare "jours" de "heures" — dernier espace
  const spaceIdx = trimmed.lastIndexOf(' ');
  if (spaceIdx === -1) return null;

  const daysPart = trimmed.slice(0, spaceIdx).trim();
  const hoursPart = trimmed.slice(spaceIdx + 1).trim();

  // Parse plage horaire
  const dashIdx = hoursPart.indexOf('-');
  if (dashIdx === -1) return null;
  const openMin = timeToMinutes(hoursPart.slice(0, dashIdx));
  const closeMin = timeToMinutes(hoursPart.slice(dashIdx + 1));
  if (openMin === null || closeMin === null) return null;

  // Parse plage de jours
  const today = todayIndex();
  const dayRangeDash = daysPart.indexOf('-');
  let applies = false;

  if (dayRangeDash !== -1) {
    // "Mo-Fr" style
    const fromDay = dayIndex(daysPart.slice(0, dayRangeDash).trim());
    const toDay = dayIndex(daysPart.slice(dayRangeDash + 1).trim());
    applies = fromDay !== -1 && toDay !== -1 && today >= fromDay && today <= toDay;
  } else if (daysPart.includes(',')) {
    // "Mo,We,Fr"
    applies = daysPart.split(',').some((d) => dayIndex(d.trim()) === today);
  } else {
    applies = dayIndex(daysPart.trim()) === today;
  }

  if (!applies) return null;

  const now = nowMinutes();
  // Gère le cas minuit (closeMin = 0 → 24h00)
  const effectiveClose = closeMin === 0 ? 24 * 60 : closeMin;
  return now >= openMin && now < effectiveClose ? 'open' : 'closed';
}

export function parseOpeningHours(raw: string | undefined): OpeningStatus {
  if (!raw) return 'unknown';

  // Sépare par "; " ou ", "
  const rules = raw.split(/[;,]/).map((r) => r.trim()).filter(Boolean);

  for (const rule of rules) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }

  return 'unknown';
}
