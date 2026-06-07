/**
 * SubmitPlaceModal
 * - KeyboardAvoidingView + ScrollView pour que le champ actif reste au-dessus du clavier
 * - Horaires structurés : rangée de jours (toggle) + picker heure début/fin par roulette
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

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0') + 'h'
);
const MINUTES = ['00', '15', '30', '45'];

type TimeValue = { hour: string; minute: string };

interface DaySchedule {
  open: boolean;
  from: TimeValue;
  to: TimeValue;
}

type Schedule = Record<DayKey, DaySchedule>;

const defaultSchedule = (): Schedule =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      { open: false, from: { hour: '08h', minute: '00' }, to: { hour: '20h', minute: '00' } },
    ])
  ) as Schedule;

/** Formate le schedule en string lisible pour Supabase */
function formatSchedule(schedule: Schedule): string {
  const parts: string[] = [];
  let rangeStart: DayKey | null = null;
  let prev: DayKey | null = null;
  let prevFrom = '';
  let prevTo = '';

  const flush = (last: DayKey) => {
    const label = rangeStart === last ? last : `${rangeStart}-${last}`;
    parts.push(`${label} ${prevFrom}-${prevTo}`);
  };

  for (const day of DAYS) {
    const s = schedule[day];
    if (!s.open) {
      if (rangeStart && prev) { flush(prev); rangeStart = null; }
      prev = null; prevFrom = ''; prevTo = '';
      continue;
    }
    const from = `${s.from.hour}${s.from.minute !== '00' ? s.from.minute : ''}`;
    const to = `${s.to.hour}${s.to.minute !== '00' ? s.to.minute : ''}`;
    if (rangeStart && from === prevFrom && to === prevTo) {
      prev = day;
    } else {
      if (rangeStart && prev) flush(prev);
      rangeStart = day; prev = day; prevFrom = from; prevTo = to;
    }
  }
  if (rangeStart && prev) flush(prev);
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Sous-composant : WheelPicker simple (ScrollView snapping)
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
      {/* ligne de sélection */}
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
  container: {
    width: 56,
    height: ITEM_H * 3,
    overflow: 'hidden',
    position: 'relative',
  },
  selector: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.accent,
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
  },
  labelActive: {
    color: theme.text,
    fontFamily: theme.fontMonoBold,
  },
});

// ---------------------------------------------------------------------------
// Sous-composant : éditeur d'horaires
// ---------------------------------------------------------------------------

function HoursEditor({
  schedule,
  onChange,
}: {
  schedule: Schedule;
  onChange: (s: Schedule) => void;
}) {
  const [expanded, setExpanded] = useState<DayKey | null>(null);

  const toggleDay = (day: DayKey) => {
    const next = { ...schedule, [day]: { ...schedule[day], open: !schedule[day].open } };
    onChange(next);
    if (!schedule[day].open) setExpanded(day);
    else if (expanded === day) setExpanded(null);
  };

  const setTime = (day: DayKey, edge: 'from' | 'to', part: 'hour' | 'minute', val: string) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        [edge]: { ...schedule[day][edge], [part]: val },
      },
    });
  };

  return (
    <View style={he.root}>
      {/* Rangée de jours */}
      <View style={he.dayRow}>
        {DAYS.map((day) => (
          <Pressable
            key={day}
            style={[he.dayBtn, schedule[day].open && he.dayBtnActive]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[he.dayLabel, schedule[day].open && he.dayLabelActive]}>{day}</Text>
          </Pressable>
        ))}
      </View>

      {/* Détail heure pour le jour expanded */}
      {expanded && schedule[expanded].open && (
        <View style={he.timeRow}>
          <Text style={he.timeLabel}>{expanded} — ouverture</Text>
          <View style={he.wheels}>
            <WheelPicker
              items={HOURS}
              value={schedule[expanded].from.hour}
              onChange={(v) => setTime(expanded, 'from', 'hour', v)}
            />
            <Text style={he.colon}>:</Text>
            <WheelPicker
              items={MINUTES}
              value={schedule[expanded].from.minute}
              onChange={(v) => setTime(expanded, 'from', 'minute', v)}
            />
            <Text style={he.arrow}>→</Text>
            <WheelPicker
              items={HOURS}
              value={schedule[expanded].to.hour}
              onChange={(v) => setTime(expanded, 'to', 'hour', v)}
            />
            <Text style={he.colon}>:</Text>
            <WheelPicker
              items={MINUTES}
              value={schedule[expanded].to.minute}
              onChange={(v) => setTime(expanded, 'to', 'minute', v)}
            />
          </View>
        </View>
      )}

      {/* Aperçu formaté */}
      {DAYS.some((d) => schedule[d].open) && (
        <Text style={he.preview}>{formatSchedule(schedule)}</Text>
      )}
    </View>
  );
}

const he = StyleSheet.create({
  root: { marginBottom: 4 },
  dayRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
  dayLabel: { fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted },
  dayLabelActive: { color: theme.text },
  timeRow: {
    marginTop: 12,
    backgroundColor: theme.bg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timeLabel: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  wheels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colon: { color: theme.textMuted, fontFamily: theme.fontMonoBold, fontSize: 16 },
  arrow: { color: theme.textFaint, fontFamily: theme.fontMono, fontSize: 14, marginHorizontal: 4 },
  preview: {
    marginTop: 10,
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.accent,
    lineHeight: 16,
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
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Ajouter un lieu</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Corps scrollable */}
          <ScrollView
            style={s.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.bodyContent}
          >
            {/* NOM */}
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

            {/* TYPE */}
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

            {/* ADRESSE */}
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

            {/* HORAIRES */}
            <Text style={s.label}>Horaires (optionnel)</Text>
            <HoursEditor schedule={schedule} onChange={setSchedule} />

            {/* NOTE */}
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

            {/* RÉSULTAT */}
            {result && (
              <View style={[s.resultBox, result.ok ? s.resultOk : s.resultErr]}>
                <Text style={s.resultText}>{result.message}</Text>
              </View>
            )}

            {/* CTA */}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: { fontFamily: theme.fontMonoBold, fontSize: 16, color: theme.text },
  closeBtn: { color: theme.textMuted, fontSize: 16, fontFamily: theme.fontMono },
  body: { flexShrink: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 16 },
  label: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: theme.text,
    fontFamily: theme.fontMono,
    fontSize: 14,
  },
  inputMulti: { height: 72 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
  chipLabel: { fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted },
  chipLabelActive: { color: theme.text },
  hint: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textFaint,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 16,
  },
  resultBox: { padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 4 },
  resultOk: { backgroundColor: '#0D2B1A', borderWidth: 1, borderColor: '#1A5C30' },
  resultErr: { backgroundColor: '#2B0D0D', borderWidth: 1, borderColor: '#5C1A1A' },
  resultText: { fontFamily: theme.fontMono, fontSize: 13, color: theme.text },
  submitBtn: {
    backgroundColor: theme.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.5 },
  submitLabel: { fontFamily: theme.fontMonoBold, fontSize: 14, color: theme.bg, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
});
