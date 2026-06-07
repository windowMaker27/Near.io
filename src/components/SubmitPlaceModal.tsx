/**
 * SubmitPlaceModal
 * - Picker horaires multi-jours : sélection groupée + override individuel
 * - Logique : cocher plusieurs jours → horaire commune appliquée à tous
 *   Cliquer un jour déjà coché → ouvre son panneau d'override
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import { SUBMITTABLE_CATEGORIES, PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { submitPlace, geocodeAddress } from '@/services/supabaseService';
import { PlaceCategory } from '@/types/place';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DayKey = 'Lu' | 'Ma' | 'Me' | 'Je' | 'Ve' | 'Sa' | 'Di';
const DAYS: DayKey[] = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const HOURS = Array.from({ length: 25 }, (_, i) =>
  i.toString().padStart(2, '0') + 'h'
);
const MINUTES = ['00', '15', '30', '45'];

type TimeValue = { hour: string; minute: string };

interface DaySchedule {
  open: boolean;
  from: TimeValue;
  to: TimeValue;
  /** true = horaire personnalisée, ignorée si !open */
  hasOverride: boolean;
}

type Schedule = Record<DayKey, DaySchedule>;

const DEFAULT_FROM: TimeValue = { hour: '08h', minute: '00' };
const DEFAULT_TO: TimeValue = { hour: '20h', minute: '00' };

const defaultSchedule = (): Schedule =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      { open: false, from: { ...DEFAULT_FROM }, to: { ...DEFAULT_TO }, hasOverride: false },
    ])
  ) as Schedule;

/** Formate le schedule en string OSM-like lisible */
function formatSchedule(schedule: Schedule): string {
  // Regroupe les jours par tranche horaire identique
  type Slot = { days: DayKey[]; from: string; to: string };
  const slots: Slot[] = [];

  for (const day of DAYS) {
    const s = schedule[day];
    if (!s.open) continue;
    const from = `${s.from.hour}${s.from.minute !== '00' ? s.from.minute : ''}`;
    const to = `${s.to.hour}${s.to.minute !== '00' ? s.to.minute : ''}`;
    const existing = slots.find((sl) => sl.from === from && sl.to === to);
    if (existing) existing.days.push(day);
    else slots.push({ days: [day], from, to });
  }

  return slots
    .map(({ days, from, to }) => {
      // Compresse jours consécutifs
      const parts: string[] = [];
      let start: DayKey | null = null;
      let prev: DayKey | null = null;
      const flush = () => {
        if (!start) return;
        parts.push(start === prev ? start : `${start}-${prev}`);
        start = null; prev = null;
      };
      for (const day of DAYS) {
        if (days.includes(day)) {
          if (!start) start = day;
          prev = day;
        } else {
          flush();
        }
      }
      flush();
      return `${parts.join(', ')} ${from}-${to}`;
    })
    .join(' ; ');
}

// ---------------------------------------------------------------------------
// WheelPicker
// ---------------------------------------------------------------------------

const ITEM_H = 36;

function WheelPicker({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const idx = items.indexOf(value);
  return (
    <View style={wp.container}>
      <View style={wp.selector} pointerEvents="none" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: Math.max(0, idx) * ITEM_H }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onChange(items[Math.max(0, Math.min(i, items.length - 1))]);
        }}
        style={{ height: ITEM_H * 3 }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {items.map((item) => (
          <View key={item} style={wp.item}>
            <Text style={[wp.label, item === value && wp.labelActive]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const wp = StyleSheet.create({
  container: { width: 56, height: ITEM_H * 3, overflow: 'hidden', position: 'relative' },
  selector: {
    position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.accent, zIndex: 1,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: theme.fontMono, fontSize: 13, color: theme.textMuted },
  labelActive: { color: theme.text, fontFamily: theme.fontMonoBold },
});

// ---------------------------------------------------------------------------
// TimeRow — une rangée ouverture→fermeture
// ---------------------------------------------------------------------------

function TimeRow({
  from,
  to,
  label,
  onChangeFrom,
  onChangeTo,
}: {
  from: TimeValue;
  to: TimeValue;
  label: string;
  onChangeFrom: (tv: TimeValue) => void;
  onChangeTo: (tv: TimeValue) => void;
}) {
  return (
    <View style={tr.container}>
      <Text style={tr.label}>{label}</Text>
      <View style={tr.wheels}>
        <WheelPicker
          items={HOURS}
          value={from.hour}
          onChange={(v) => onChangeFrom({ ...from, hour: v })}
        />
        <Text style={tr.colon}>:</Text>
        <WheelPicker
          items={MINUTES}
          value={from.minute}
          onChange={(v) => onChangeFrom({ ...from, minute: v })}
        />
        <Text style={tr.arrow}>→</Text>
        <WheelPicker
          items={HOURS}
          value={to.hour}
          onChange={(v) => onChangeTo({ ...to, hour: v })}
        />
        <Text style={tr.colon}>:</Text>
        <WheelPicker
          items={MINUTES}
          value={to.minute}
          onChange={(v) => onChangeTo({ ...to, minute: v })}
        />
      </View>
    </View>
  );
}

const tr = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: theme.bg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  label: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  wheels: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  colon: { color: theme.textMuted, fontFamily: theme.fontMonoBold, fontSize: 16 },
  arrow: { color: theme.textFaint, fontFamily: theme.fontMono, fontSize: 14, marginHorizontal: 4 },
});

// ---------------------------------------------------------------------------
// HoursEditor
// ---------------------------------------------------------------------------

function HoursEditor({
  schedule,
  onChange,
}: {
  schedule: Schedule;
  onChange: (s: Schedule) => void;
}) {
  /**
   * expandedDay : jour ouvert pour voir/éditer son override
   * sharedFrom/sharedTo : horaire commune appliquée à tous les jours sans override
   */
  const [expandedDay, setExpandedDay] = useState<DayKey | null>(null);
  const [sharedFrom, setSharedFrom] = useState<TimeValue>({ ...DEFAULT_FROM });
  const [sharedTo, setSharedTo] = useState<TimeValue>({ ...DEFAULT_TO });

  /** Met à jour l'horaire commune ET tous les jours ouverts sans override */
  const applyShared = (from: TimeValue, to: TimeValue) => {
    const next = { ...schedule };
    for (const day of DAYS) {
      if (next[day].open && !next[day].hasOverride) {
        next[day] = { ...next[day], from: { ...from }, to: { ...to } };
      }
    }
    onChange(next);
  };

  const handleToggleDay = (day: DayKey) => {
    const wasOpen = schedule[day].open;
    if (!wasOpen) {
      // Activer → applique l'horaire commune
      onChange({
        ...schedule,
        [day]: { ...schedule[day], open: true, from: { ...sharedFrom }, to: { ...sharedTo }, hasOverride: false },
      });
    } else {
      // Désactiver → ferme l'override panel si ouvert
      if (expandedDay === day) setExpandedDay(null);
      onChange({
        ...schedule,
        [day]: { ...schedule[day], open: false, hasOverride: false },
      });
    }
  };

  const handleLongPressDay = (day: DayKey) => {
    if (!schedule[day].open) return;
    // Long press sur un jour ouvert → active l'override
    onChange({
      ...schedule,
      [day]: { ...schedule[day], hasOverride: true },
    });
    setExpandedDay(day);
  };

  const handlePressOpenDay = (day: DayKey) => {
    if (!schedule[day].open) return;
    // Tap sur un jour déjà ouvert → toggle le panel d'override
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      onChange({ ...schedule, [day]: { ...schedule[day], hasOverride: true } });
      setExpandedDay(day);
    }
  };

  const anyOpen = DAYS.some((d) => schedule[d].open);

  return (
    <View style={he.root}>
      {/* Horaire commune */}
      <TimeRow
        from={sharedFrom}
        to={sharedTo}
        label="Horaire commune"
        onChangeFrom={(v) => { setSharedFrom(v); applyShared(v, sharedTo); }}
        onChangeTo={(v) => { setSharedTo(v); applyShared(sharedFrom, v); }}
      />

      {/* Rangée de jours */}
      <View style={he.dayRow}>
        {DAYS.map((day) => {
          const isOpen = schedule[day].open;
          const hasOverride = schedule[day].hasOverride;
          return (
            <Pressable
              key={day}
              style={[he.dayBtn, isOpen && he.dayBtnActive, hasOverride && he.dayBtnOverride]}
              onPress={() => isOpen ? handlePressOpenDay(day) : handleToggleDay(day)}
              onLongPress={() => handleLongPressDay(day)}
            >
              <Text style={[he.dayLabel, isOpen && he.dayLabelActive]}>{day}</Text>
              {hasOverride && <View style={he.overrideDot} />}
            </Pressable>
          );
        })}
      </View>

      <Text style={he.hint}>
        Appuyez pour activer/désactiver · Maintenir ou retaper pour horaire spéciale
      </Text>

      {/* Panel override d'un jour spécifique */}
      {expandedDay && schedule[expandedDay].open && (
        <TimeRow
          from={schedule[expandedDay].from}
          to={schedule[expandedDay].to}
          label={`${expandedDay} — horaire spéciale`}
          onChangeFrom={(v) =>
            onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], from: v, hasOverride: true } })
          }
          onChangeTo={(v) =>
            onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], to: v, hasOverride: true } })
          }
        />
      )}

      {/* Aperçu */}
      {anyOpen && (
        <Text style={he.preview}>{formatSchedule(schedule)}</Text>
      )}
    </View>
  );
}

const he = StyleSheet.create({
  root: { marginBottom: 4 },
  dayRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 },
  dayBtn: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
  },
  dayBtnActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
  dayBtnOverride: { borderColor: '#e8a838' },
  overrideDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#e8a838',
  },
  dayLabel: { fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted },
  dayLabelActive: { color: theme.text },
  hint: {
    fontFamily: theme.fontMono, fontSize: 10, color: theme.textFaint,
    marginTop: 6, lineHeight: 14,
  },
  preview: {
    marginTop: 10, fontFamily: theme.fontMono, fontSize: 11,
    color: theme.accent, lineHeight: 16,
  },
});

// ---------------------------------------------------------------------------
// Modal principal
// ---------------------------------------------------------------------------

type Props = { visible: boolean; onClose: () => void };

export function SubmitPlaceModal({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('grocery');
  const [address, setAddress] = useState('');
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const reset = () => {
    setName(''); setCategory('grocery'); setAddress('');
    setSchedule(defaultSchedule()); setNote(''); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setResult({ ok: false, message: 'Le nom est requis.' }); return; }
    if (!address.trim()) { setResult({ ok: false, message: "L'adresse postale est requise." }); return; }

    setGeocoding(true);
    const coords = await geocodeAddress(address.trim());
    setGeocoding(false);

    if (!coords) {
      setResult({ ok: false, message: 'Adresse introuvable. Vérifiez et réessayez (ex : 12 rue de Rivoli, Paris).' });
      return;
    }

    setLoading(true);
    const hoursStr = formatSchedule(schedule);
    const res = await submitPlace({
      name: name.trim(),
      category,
      latitude: coords.latitude,
      longitude: coords.longitude,
      short_address: address.trim(),
      opening_hours: hoursStr || undefined,
      description: note.trim() || undefined,
    });
    setLoading(false);
    setResult(
      res.ok
        ? { ok: true, message: '✓ Soumis ! Visible après validation admin.' }
        : { ok: false, message: res.error ?? 'Erreur inconnue.' },
    );
  };

  const busy = loading || geocoding;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <Pressable style={s.backdrop} onPress={handleClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Ajouter un lieu</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={s.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.bodyContent}
          >
            <Text style={s.label}>Nom *</Text>
            <TextInput
              style={s.input}
              placeholder="Ex : Épicerie Mohamed"
              placeholderTextColor={theme.textFaint}
              value={name}
              onChangeText={setName}
              maxLength={80}
              returnKeyType="next"
            />

            <Text style={s.label}>Type</Text>
            <View style={s.chips}>
              {SUBMITTABLE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[s.chip, category === cat && s.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[s.chipLabel, category === cat && s.chipLabelActive]}>
                    {PLACE_TYPE_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.label}>Adresse postale *</Text>
            <TextInput
              style={s.input}
              placeholder="Ex : 12 rue de la Paix, 75001 Paris"
              placeholderTextColor={theme.textFaint}
              value={address}
              onChangeText={setAddress}
              maxLength={150}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Text style={s.hint}>
              Coordonnées GPS calculées automatiquement via OpenStreetMap.
            </Text>

            <Text style={s.label}>Horaires (optionnel)</Text>
            <HoursEditor schedule={schedule} onChange={setSchedule} />

            <Text style={s.label}>Note (optionnel)</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              placeholder="Stand de rue, épicerie de nuit…"
              placeholderTextColor={theme.textFaint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />

            {result && (
              <View style={[s.resultBox, result.ok ? s.resultOk : s.resultErr]}>
                <Text style={s.resultText}>{result.message}</Text>
              </View>
            )}

            <Pressable
              style={[s.submitBtn, busy && s.submitDisabled]}
              onPress={handleSubmit}
              disabled={busy}
            >
              {busy ? (
                <View style={s.loadingRow}>
                  <ActivityIndicator color={theme.bg} size="small" />
                  <Text style={[s.submitLabel, { marginLeft: 8 }]}>
                    {geocoding ? 'Géocodage…' : 'Envoi…'}
                  </Text>
                </View>
              ) : (
                <Text style={s.submitLabel}>Envoyer pour validation</Text>
              )}
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderTopColor: theme.border,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  title: { fontFamily: theme.fontMonoBold, fontSize: 16, color: theme.text },
  closeBtn: { color: theme.textMuted, fontSize: 16, fontFamily: theme.fontMono },
  body: { flexShrink: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 16 },
  label: {
    fontFamily: theme.fontMono, fontSize: 11, color: theme.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    color: theme.text, fontFamily: theme.fontMono, fontSize: 14,
  },
  inputMulti: { height: 72 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
  chipLabel: { fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted },
  chipLabelActive: { color: theme.text },
  hint: {
    fontFamily: theme.fontMono, fontSize: 11, color: theme.textFaint,
    marginTop: 6, marginBottom: 4, lineHeight: 16,
  },
  resultBox: { padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 4 },
  resultOk: { backgroundColor: '#0D2B1A', borderWidth: 1, borderColor: '#1A5C30' },
  resultErr: { backgroundColor: '#2B0D0D', borderWidth: 1, borderColor: '#5C1A1A' },
  resultText: { fontFamily: theme.fontMono, fontSize: 13, color: theme.text },
  submitBtn: {
    backgroundColor: theme.accent, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center', marginTop: 16,
  },
  submitDisabled: { opacity: 0.5 },
  submitLabel: { fontFamily: theme.fontMonoBold, fontSize: 14, color: theme.bg, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
});
