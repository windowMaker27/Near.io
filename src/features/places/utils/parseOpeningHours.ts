/**
 * parseOpeningHours.ts
 *
 * Parse deux formats :
 *   - OSM  : "Mo-Fr 08:00-20:00" / "Mo,Sa 09:00-21:00" / "24/7"
 *   - Near : "Lu-Ve 08h-20h" / "Lu-Ve 08h-20h ; Sa 10h-18h"
 *
 * Le problème précédent : "Lu-Ve 08h-20h" → lastIndexOf(' ') = 5 (OK),
 * mais daysPart = "Lu-Ve" contient un '-', et hoursPart = "08h-20h" aussi.
 * Solution : on détecte la partie horaire par regex plutôt que par position.
 */
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

/** "08h" | "08h30" | "08:30" | "8" | "08h00" → minutes depuis minuit */
function timeToMinutes(t: string): number | null {
  // Remplace 'h' par ':' puis nettoyage
  const cleaned = t.trim().replace(/[hH]/, ':').replace(/:{2,}/, ':');
  const [hStr, mStr = '0'] = cleaned.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m) || h > 24 || m > 59) return null;
  return h * 60 + m;
}

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

/**
 * Regex qui capture la partie horaire en fin de règle.
 * Exemples matchés : "08:00-20:00" "08h-20h" "08h30-20h00" "8-20"
 * Groupe 1 = heure ouverture, groupe 2 = heure fermeture
 */
const TIME_RANGE_RE = /([\d]{1,2}[hH:]?[\d]{0,2})\s*-\s*([\d]{1,2}[hH:]?[\d]{0,2})\s*$/;

interface RuleResult {
  status: OpeningStatus;
  closingTime?: string;
}

function parseRule(rule: string): RuleResult | null {
  const trimmed = rule.trim();
  if (!trimmed) return null;

  if (trimmed === '24/7') return { status: 'open' };

  // Extrait la plage horaire avec la regex
  const timeMatch = trimmed.match(TIME_RANGE_RE);
  if (!timeMatch) return null;

  const openMin = timeToMinutes(timeMatch[1]);
  const closeMin = timeToMinutes(timeMatch[2]);
  if (openMin === null || closeMin === null) return null;

  // Tout ce qui précède la plage horaire = partie jours
  const daysPart = trimmed.slice(0, timeMatch.index).trim();
  if (!daysPart) return null;

  // Vérifie si la règle s'applique aujourd'hui
  const today = todayIndex();
  let applies = false;

  // Plusieurs groupes séparés par virgule : "Lu, Ve" ou "Mo, Sa"
  const dayGroups = daysPart.split(',').map((g) => g.trim()).filter(Boolean);

  for (const group of dayGroups) {
    const dashIdx = group.indexOf('-');
    if (dashIdx !== -1) {
      // Plage "Lu-Ve" ou "Mo-Fr"
      const fromDay = dayIndex(group.slice(0, dashIdx));
      const toDay = dayIndex(group.slice(dashIdx + 1));
      if (fromDay !== -1 && toDay !== -1 && today >= fromDay && today <= toDay) {
        applies = true;
        break;
      }
    } else {
      // Jour unique "Sa" ou "Mo"
      if (dayIndex(group) === today) {
        applies = true;
        break;
      }
    }
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

  // Sépare par ';' ou ','
  // Note : on split sur ',' SEULEMENT si ce n'est pas une virgule dans une liste de jours.
  // Pour simplifier : on split d'abord sur ';', puis sur ',' si aucune règle trouvée.
  const bySemicolon = raw.split(';').map((r) => r.trim()).filter(Boolean);

  for (const rule of bySemicolon) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }

  // Fallback : split sur ','
  const byComma = raw.split(',').map((r) => r.trim()).filter(Boolean);
  for (const rule of byComma) {
    const result = parseRule(rule);
    if (result !== null) return result;
  }

  return { status: 'unknown' };
}

/** Rétrocompatibilité */
export function parseOpeningHours(raw: string | undefined): OpeningStatus {
  return parseOpeningHoursInfo(raw).status;
}
