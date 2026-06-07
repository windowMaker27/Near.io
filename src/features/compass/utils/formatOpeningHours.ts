/**
 * formatOpeningHours.ts
 *
 * Transforme les horaires en groupes jour / plage horaire affichables.
 *
 * Sources possibles :
 *  A) openingHoursText[] depuis Google Places API
 *     Format : "Monday: 8:00 AM – 8:00 PM" ou "Monday: Closed"
 *  B) osmOpeningHours string brute OSM ou saisie utilisateur
 *     Format OSM   : "Mo-Fr 08:00-20:00; Sa 09:00-18:00; Su off"
 *     Format FR    : "Lu-Je, Sa-Di 10h-00h ; Ve 15h-00h"
 */

export type HoursGroup = {
  label: string;
  hours: string;
};

const EN_DAY_FR: Record<string, string> = {
  Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi',
  Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
};

const OSM_DAY_FR: Record<string, string> = {
  Mo: 'Lundi', Tu: 'Mardi', We: 'Mercredi', Th: 'Jeudi',
  Fr: 'Vendredi', Sa: 'Samedi', Su: 'Dimanche', PH: 'Jours fériés',
};

/** Abréviations françaises → codes OSM */
const FR_ABBR_TO_OSM: Record<string, string> = {
  lu: 'Mo', ma: 'Tu', me: 'We', je: 'Th', ve: 'Fr', sa: 'Sa', di: 'Su',
  // formes longues au cas où
  lundi: 'Mo', mardi: 'Tu', mercredi: 'We', jeudi: 'Th',
  vendredi: 'Fr', samedi: 'Sa', dimanche: 'Su',
};

const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Normalise un token jour vers un code OSM (Mo, Tu…) */
function toOsmDay(token: string): string {
  const t = token.trim();
  // Déjà un code OSM valide
  if (DAY_ORDER.includes(t)) return t;
  // Abréviation française (insensible à la casse)
  return FR_ABBR_TO_OSM[t.toLowerCase()] ?? t;
}

// ---- Google Places ----

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

function parseGoogleLine(line: string): HoursGroup {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return { label: line, hours: '' };
  const dayEn = line.slice(0, colonIdx).trim();
  const rest = line.slice(colonIdx + 1).trim();
  const label = EN_DAY_FR[dayEn] ?? dayEn;
  const lower = rest.toLowerCase();
  if (lower === 'closed' || lower === 'fermé') return { label, hours: 'Fermé' };
  if (lower === 'open 24 hours' || lower === '24/7') return { label, hours: '24h/24' };
  const normalized = rest
    .replace(/\u2013|\u2014/g, '-')
    .split('-')
    .map((p) => convertAmPm(p.trim()))
    .join(' – ');
  return { label, hours: normalized };
}

function groupConsecutive(items: HoursGroup[]): HoursGroup[] {
  if (items.length === 0) return [];
  const FR_DAYS = Object.values(OSM_DAY_FR).slice(0, 7);
  const sorted = [...items].sort((a, b) => FR_DAYS.indexOf(a.label) - FR_DAYS.indexOf(b.label));
  const groups: HoursGroup[] = [];
  let start = sorted[0]; let end = sorted[0]; let cur = sorted[0].hours;
  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const consecutive = FR_DAYS.indexOf(item.label) === FR_DAYS.indexOf(end.label) + 1;
    if (consecutive && item.hours === cur) { end = item; }
    else { groups.push(buildGroup(start, end, cur)); start = item; end = item; cur = item.hours; }
  }
  groups.push(buildGroup(start, end, cur));
  return groups;
}

function buildGroup(start: HoursGroup, end: HoursGroup, hours: string): HoursGroup {
  if (start.label === end.label) return { label: start.label, hours };
  return { label: `${start.label} – ${end.label}`, hours };
}

// ---- OSM / saisie utilisateur ----

function expandDayRange(range: string): string[] {
  const trimmed = range.trim();
  if (trimmed.includes('-')) {
    const dashIdx = trimmed.lastIndexOf('-');
    const s = toOsmDay(trimmed.slice(0, dashIdx));
    const e = toOsmDay(trimmed.slice(dashIdx + 1));
    const si = DAY_ORDER.indexOf(s); const ei = DAY_ORDER.indexOf(e);
    if (si !== -1 && ei !== -1 && ei >= si) return DAY_ORDER.slice(si, ei + 1);
  }
  return [toOsmDay(trimmed)];
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

/** Normalise les heures : "10h-00h" → "10:00 – 00:00", "08:00-20:00" → "08:00 – 20:00" */
function normalizeOsmHours(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === 'off' || t === 'closed' || t === 'fermé') return 'Fermé';
  if (t === '24/7' || t === '00:00-24:00' || t === '00:00-00:00') return '24h/24';
  // Convertit "10h" / "10h30" → "10:00" / "10:30"
  const normalized = t
    .replace(/(\d{1,2})h(\d{2})/g, '$1:$2')
    .replace(/(\d{1,2})h(?!\d)/g, '$1:00');
  // Remplace "-" entre deux horaires par " – "
  return normalized.replace(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g, '$1 – $2').trim();
}

/**
 * Parse une règle OSM/FR : sépare la partie jours de la partie heures.
 * Ex: "Lu-Je, Sa-Di 10h-00h" ou "Mo-Fr 08:00-20:00"
 *
 * Stratégie : on cherche le premier token qui ressemble à une heure
 * pur découper jours vs horaires.
 */
function parseOsmRule(rule: string): HoursGroup {
  const trimmed = rule.trim();
  if (!trimmed) return { label: '', hours: '' };
  if (trimmed.toLowerCase() === '24/7') return { label: 'Tous les jours', hours: '24h/24' };

  // Trouve la position du premier séparateur heure (chiffre suivi de ":" ou "h")
  const timeStart = trimmed.search(/(^|\s)(\d{1,2}[h:])/);
  if (timeStart === -1) {
    // Pas d'heure trouvée : tout est jours ou valeur brute
    return { label: trimmed, hours: '' };
  }

  // Partie jours avant, partie heures après
  const daysPart = trimmed.slice(0, timeStart).trim().replace(/,$/, '');
  const hoursPart = trimmed.slice(timeStart).trim();

  // Décompose les jours (séparés par virgule ou espace)
  const dayCodes: string[] = [];
  for (const seg of daysPart.split(',').map((s) => s.trim()).filter(Boolean)) {
    dayCodes.push(...expandDayRange(seg));
  }

  return {
    label: dayListToLabel(dayCodes),
    hours: normalizeOsmHours(hoursPart),
  };
}

function parseOsmString(osm: string): HoursGroup[] {
  if (osm.trim().toLowerCase() === '24/7') return [{ label: 'Tous les jours', hours: '24h/24' }];
  // Séparateur : ";" (avec ou sans espace autour)
  return osm.split(/\s*;\s*/).map((r) => r.trim()).filter(Boolean).map(parseOsmRule);
}

// ---- Point d'entrée ----

export function formatOpeningHours(
  openingHoursText?: string[],
  osmOpeningHours?: string,
): HoursGroup[] | null {
  if (openingHoursText && openingHoursText.length > 0) {
    return groupConsecutive(openingHoursText.map(parseGoogleLine));
  }
  if (osmOpeningHours) {
    try { return parseOsmString(osmOpeningHours); }
    catch { return [{ label: osmOpeningHours, hours: '' }]; }
  }
  return null;
}
