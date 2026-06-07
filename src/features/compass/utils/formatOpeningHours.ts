/**
 * formatOpeningHours.ts
 *
 * Transforme les horaires en groupes jour / plage horaire affichables.
 *
 * Sources possibles :
 *  A) openingHoursText[] depuis Google Places API
 *     Format : "Monday: 8:00 AM – 8:00 PM" ou "Monday: Closed"
 *  B) osmOpeningHours string brute OSM
 *     Format : "Mo-Fr 08:00-20:00; Sa 09:00-18:00; Su off"
 */

export type HoursGroup = {
  label: string; // ex: "Lundi – Vendredi" ou "Samedi"
  hours: string; // ex: "08:00 – 20:00" ou "Fermé"
};

// --- Traduction jour anglais → français ---
const EN_DAY_FR: Record<string, string> = {
  Monday: 'Lundi',
  Tuesday: 'Mardi',
  Wednesday: 'Mercredi',
  Thursday: 'Jeudi',
  Friday: 'Vendredi',
  Saturday: 'Samedi',
  Sunday: 'Dimanche',
};

// --- Traduction code OSM → français ---
const OSM_DAY_FR: Record<string, string> = {
  Mo: 'Lundi', Tu: 'Mardi', We: 'Mercredi', Th: 'Jeudi',
  Fr: 'Vendredi', Sa: 'Samedi', Su: 'Dimanche', PH: 'Jours fériés',
};

const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Convertit "8:00 AM" / "8:00 PM" → "08:00" */
function convertAmPm(time: string): string {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return time.trim();
  let h = parseInt(m[1], 10);
  const min = m[2];
  const period = m[3].toUpperCase();
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${h.toString().padStart(2, '0')}:${min}`;
}

/** Parse une ligne Google : "Monday: 8:00 AM – 8:00 PM" */
function parseGoogleLine(line: string): HoursGroup {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return { label: line, hours: '' };

  const dayEn = line.slice(0, colonIdx).trim();
  const rest = line.slice(colonIdx + 1).trim();
  const label = EN_DAY_FR[dayEn] ?? dayEn;

  const lower = rest.toLowerCase();
  if (lower === 'closed' || lower === 'fermé') return { label, hours: 'Fermé' };
  if (lower === 'open 24 hours' || lower === '24/7') return { label, hours: '24h/24' };

  // Normalise tirets unicode puis convertit AM/PM → 24h
  const normalized = rest
    .replace(/\u2013|\u2014/g, '-')
    .split('-')
    .map((part) => convertAmPm(part.trim()))
    .join(' – ');

  return { label, hours: normalized };
}

/** Regroupe les jours consécutifs qui ont les mêmes horaires */
function groupConsecutive(items: HoursGroup[]): HoursGroup[] {
  if (items.length === 0) return [];

  const FR_DAYS = Object.values(OSM_DAY_FR).slice(0, 7); // Lundi…Dimanche
  const sorted = [...items].sort(
    (a, b) => FR_DAYS.indexOf(a.label) - FR_DAYS.indexOf(b.label),
  );

  const groups: HoursGroup[] = [];
  let start = sorted[0];
  let end = sorted[0];
  let currentHours = sorted[0].hours;

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const consecutive = FR_DAYS.indexOf(item.label) === FR_DAYS.indexOf(end.label) + 1;
    if (consecutive && item.hours === currentHours) {
      end = item;
    } else {
      groups.push(buildGroup(start, end, currentHours));
      start = item; end = item; currentHours = item.hours;
    }
  }
  groups.push(buildGroup(start, end, currentHours));
  return groups;
}

function buildGroup(start: HoursGroup, end: HoursGroup, hours: string): HoursGroup {
  if (start.label === end.label) return { label: start.label, hours };
  return { label: `${start.label} – ${end.label}`, hours };
}

// ---- Helpers OSM ----

function expandDayRange(range: string): string[] {
  if (range.includes('-')) {
    const [s, e] = range.split('-').map((d) => d.trim());
    const si = DAY_ORDER.indexOf(s); const ei = DAY_ORDER.indexOf(e);
    if (si !== -1 && ei !== -1 && ei >= si) return DAY_ORDER.slice(si, ei + 1);
  }
  return [range.trim()];
}

function dayListToLabel(days: string[]): string {
  if (days.length === 0) return '';
  if (days.length === 7) return 'Tous les jours';
  const indices = days.map((d) => DAY_ORDER.indexOf(d)).filter((i) => i !== -1).sort((a, b) => a - b);
  const isContinuous = indices.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1);
  if (isContinuous && indices.length > 2)
    return `${OSM_DAY_FR[DAY_ORDER[indices[0]]]} – ${OSM_DAY_FR[DAY_ORDER[indices[indices.length - 1]]]}`;
  return days.map((d) => OSM_DAY_FR[d] ?? d).join(', ');
}

function normalizeOsmHours(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === 'off' || t === 'closed') return 'Fermé';
  if (t === '24/7' || t === '00:00-24:00' || t === '00:00-00:00') return '24h/24';
  return t.replace(/,/g, '  ·  ').replace(/-/g, ' – ').trim();
}

function parseOsmString(osm: string): HoursGroup[] {
  if (osm.trim().toLowerCase() === '24/7') return [{ label: 'Tous les jours', hours: '24h/24' }];
  return osm.split(';').map((r) => r.trim()).filter(Boolean).map((rule) => {
    const match = rule.match(/^([A-Za-z,\-]+(?:\s*,\s*[A-Za-z\-]+)*)\s+(.+)$/);
    if (!match) return { label: rule, hours: '' };
    const dayCodes: string[] = [];
    for (const seg of match[1].split(',')) dayCodes.push(...expandDayRange(seg.trim()));
    return { label: dayListToLabel(dayCodes), hours: normalizeOsmHours(match[2]) };
  });
}

/**
 * Point d'entrée principal.
 */
export function formatOpeningHours(
  openingHoursText?: string[],
  osmOpeningHours?: string,
): HoursGroup[] | null {
  // Source A : Google weekdayDescriptions ("Monday: 8:00 AM – 8:00 PM")
  if (openingHoursText && openingHoursText.length > 0) {
    return groupConsecutive(openingHoursText.map(parseGoogleLine));
  }
  // Source B : OSM brut
  if (osmOpeningHours) {
    try { return parseOsmString(osmOpeningHours); }
    catch { return [{ label: osmOpeningHours, hours: '' }]; }
  }
  return null;
}
