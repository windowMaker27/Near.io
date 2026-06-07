/**
 * formatOpeningHours.ts
 *
 * Transforme les horaires bruts OSM ou openingHoursText[] en groupes
 * de jours partageant les mêmes horaires.
 *
 * Entrée possible :
 *   - string[] déjà parsée, ex: ["Lundi : 08:00 - 20:00", ...]
 *   - string brute OSM, ex: "Mo-Fr 08:00-20:00; Sa 09:00-18:00; Su off"
 *
 * Sortie : HoursGroup[]
 */

export type HoursGroup = {
  label: string;  // ex: "Lundi – Vendredi" ou "Samedi"
  hours: string;  // ex: "08:00 – 20:00" ou "Fermé"
};

const OSM_DAY_FR: Record<string, string> = {
  Mo: 'Lundi',
  Tu: 'Mardi',
  We: 'Mercredi',
  Th: 'Jeudi',
  Fr: 'Vendredi',
  Sa: 'Samedi',
  Su: 'Dimanche',
  PH: 'Jours fériés',
};

const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Expand "Mo-Fr" → ["Mo","Tu","We","Th","Fr"] */
function expandDayRange(range: string): string[] {
  if (range.includes('-')) {
    const [start, end] = range.split('-').map((d) => d.trim());
    const s = DAY_ORDER.indexOf(start);
    const e = DAY_ORDER.indexOf(end);
    if (s !== -1 && e !== -1 && e >= s) return DAY_ORDER.slice(s, e + 1);
  }
  return [range.trim()];
}

/** Formate une liste de codes OSM en label lisible */
function dayListToLabel(days: string[]): string {
  if (days.length === 0) return '';
  if (days.length === 7) return 'Tous les jours';

  // Tente de compresser en plage continue
  const indices = days.map((d) => DAY_ORDER.indexOf(d)).filter((i) => i !== -1).sort((a, b) => a - b);
  const isContinuous = indices.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1);

  if (isContinuous && indices.length > 2) {
    return `${OSM_DAY_FR[DAY_ORDER[indices[0]]]} – ${OSM_DAY_FR[DAY_ORDER[indices[indices.length - 1]]]}`;
  }

  return days.map((d) => OSM_DAY_FR[d] ?? d).join(', ');
}

/** Normalise un bloc d'heures OSM, ex: "08:00-20:00" → "08:00 – 20:00" */
function normalizeHours(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === 'off' || t === 'closed') return 'Fermé';
  if (t === '24/7' || t === '00:00-24:00' || t === '00:00-00:00') return '24h/24';
  // "08:00-20:00" ou "08:00-12:00,14:00-19:00"
  return t
    .replace(/,/g, '  ·  ')
    .replace(/-/g, ' – ')
    .trim();
}

/**
 * Parse une string brute OSM.
 * Règles simplifiées : chaque règle est séparée par ";"
 * Format d'une règle : "<jours> <heures>" ou "24/7"
 */
function parseOsmString(osm: string): HoursGroup[] {
  if (osm.trim().toLowerCase() === '24/7') {
    return [{ label: 'Tous les jours', hours: '24h/24' }];
  }

  const rules = osm.split(';').map((r) => r.trim()).filter(Boolean);
  const groups: HoursGroup[] = [];

  for (const rule of rules) {
    // Sépare la partie jours de la partie heures
    // ex: "Mo-Fr 08:00-20:00"  |  "Sa,Su 10:00-18:00"  |  "PH off"
    const match = rule.match(/^([A-Za-z,\-]+(?:\s*,\s*[A-Za-z\-]+)*)\s+(.+)$/);
    if (!match) {
      groups.push({ label: rule, hours: '' });
      continue;
    }

    const daysPart = match[1];
    const hoursPart = match[2];

    // Expand tous les codes de jours
    const dayCodes: string[] = [];
    for (const segment of daysPart.split(',')) {
      dayCodes.push(...expandDayRange(segment.trim()));
    }

    groups.push({
      label: dayListToLabel(dayCodes),
      hours: normalizeHours(hoursPart),
    });
  }

  return groups;
}

/**
 * Point d'entrée principal.
 * Préfère openingHoursText[] (déjà localisé) si dispo,
 * sinon tente de parser osmOpeningHours.
 */
export function formatOpeningHours(
  openingHoursText?: string[],
  osmOpeningHours?: string,
): HoursGroup[] | null {
  // openingHoursText : lignes déjà en français, on les retourne telles quelles
  // en séparant sur " : " si possible pour conserver le format groupé
  if (openingHoursText && openingHoursText.length > 0) {
    return openingHoursText.map((line) => {
      const sep = line.indexOf(' : ');
      if (sep !== -1) {
        return { label: line.slice(0, sep), hours: line.slice(sep + 3) };
      }
      return { label: line, hours: '' };
    });
  }

  if (osmOpeningHours) {
    try {
      return parseOsmString(osmOpeningHours);
    } catch {
      // Fallback : afficher brut
      return [{ label: osmOpeningHours, hours: '' }];
    }
  }

  return null;
}
