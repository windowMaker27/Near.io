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
import { useTheme } from '@/hooks/useTheme';
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

function formatSchedule(schedule: Schedule): string {
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
        } else { flush(); }
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

function WheelPicker({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  const t = useTheme();
  const idx = items.indexOf(value);
  return (
    <View style={{ width: 56, height: ITEM_H * 3, overflow: 'hidden', position: 'relative' }}>
      <View style={{
        position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.accent, zIndex: 1,
      }} pointerEvents="none" />
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
          <View key={item} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{
              fontFamily: item === value ? t.fontMonoBold : t.fontMono,
              fontSize: 13,
              color: item === value ? t.text : t.textMuted,
            }}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// TimeRow
// ---------------------------------------------------------------------------

function TimeRow({ from, to, label, onChangeFrom, onChangeTo }: {
  from: TimeValue; to: TimeValue; label: string;
  onChangeFrom: (tv: TimeValue) => void; onChangeTo: (tv: TimeValue) => void;
}) {
  const t = useTheme();
  return (
    <View style={{
      marginTop: 10, backgroundColor: t.bg,
      borderRadius: 10, padding: 12, borderWidth: 1, borderColor: t.border,
    }}>
      <Text style={{
        fontFamily: t.fontMono, fontSize: 11, color: t.textMuted,
        marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8,
      }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <WheelPicker items={HOURS} value={from.hour} onChange={(v) => onChangeFrom({ ...from, hour: v })} />
        <Text style={{ color: t.textMuted, fontFamily: t.fontMonoBold, fontSize: 16 }}>:</Text>
        <WheelPicker items={MINUTES} value={from.minute} onChange={(v) => onChangeFrom({ ...from, minute: v })} />
        <Text style={{ color: t.textFaint, fontFamily: t.fontMono, fontSize: 14, marginHorizontal: 4 }}>→</Text>
        <WheelPicker items={HOURS} value={to.hour} onChange={(v) => onChangeTo({ ...to, hour: v })} />
        <Text style={{ color: t.textMuted, fontFamily: t.fontMonoBold, fontSize: 16 }}>:</Text>
        <WheelPicker items={MINUTES} value={to.minute} onChange={(v) => onChangeTo({ ...to, minute: v })} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// HoursEditor
// ---------------------------------------------------------------------------

function HoursEditor({ schedule, onChange }: { schedule: Schedule; onChange: (s: Schedule) => void }) {
  const t = useTheme();
  const [expandedDay, setExpandedDay] = useState<DayKey | null>(null);
  const [sharedFrom, setSharedFrom] = useState<TimeValue>({ ...DEFAULT_FROM });
  const [sharedTo, setSharedTo] = useState<TimeValue>({ ...DEFAULT_TO });

  const applyShared = (from: TimeValue, to: TimeValue) => {
    const next = { ...schedule };
    for (const day of DAYS) {
      if (next[day].open && !next[day].hasOverride)
        next[day] = { ...next[day], from: { ...from }, to: { ...to } };
    }
    onChange(next);
  };

  const handleToggleDay = (day: DayKey) => {
    const wasOpen = schedule[day].open;
    if (!wasOpen) {
      onChange({ ...schedule, [day]: { ...schedule[day], open: true, from: { ...sharedFrom }, to: { ...sharedTo }, hasOverride: false } });
    } else {
      if (expandedDay === day) setExpandedDay(null);
      onChange({ ...schedule, [day]: { ...schedule[day], open: false, hasOverride: false } });
    }
  };

  const handlePressOpenDay = (day: DayKey) => {
    if (!schedule[day].open) return;
    if (expandedDay === day) { setExpandedDay(null); }
    else { onChange({ ...schedule, [day]: { ...schedule[day], hasOverride: true } }); setExpandedDay(day); }
  };

  const anyOpen = DAYS.some((d) => schedule[d].open);

  return (
    <View style={{ marginBottom: 4 }}>
      <TimeRow
        from={sharedFrom} to={sharedTo} label="Horaire commune"
        onChangeFrom={(v) => { setSharedFrom(v); applyShared(v, sharedTo); }}
        onChangeTo={(v) => { setSharedTo(v); applyShared(sharedFrom, v); }}
      />
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {DAYS.map((day) => {
          const isOpen = schedule[day].open;
          const hasOverride = schedule[day].hasOverride;
          return (
            <Pressable
              key={day}
              style={[{
                borderWidth: 1, borderColor: t.border, borderRadius: 8,
                width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
              },
              isOpen && { borderColor: t.accent, backgroundColor: t.accentDim },
              hasOverride && { borderColor: '#e8a838' },
              ]}
              onPress={() => isOpen ? handlePressOpenDay(day) : handleToggleDay(day)}
              onLongPress={() => {
                if (!schedule[day].open) return;
                onChange({ ...schedule, [day]: { ...schedule[day], hasOverride: true } });
                setExpandedDay(day);
              }}
            >
              <Text style={{ fontFamily: isOpen ? t.fontMonoBold : t.fontMono, fontSize: 12, color: isOpen ? t.text : t.textMuted }}>{day}</Text>
              {hasOverride && (
                <View style={{ position: 'absolute', bottom: 3, right: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: '#e8a838' }} />
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textFaint, marginTop: 6, lineHeight: 14 }}>
        Appuyez pour activer/désactiver · Maintenir ou retaper pour horaire spéciale
      </Text>
      {expandedDay && schedule[expandedDay].open && (
        <TimeRow
          from={schedule[expandedDay].from} to={schedule[expandedDay].to}
          label={`${expandedDay} — horaire spéciale`}
          onChangeFrom={(v) => onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], from: v, hasOverride: true } })}
          onChangeTo={(v) => onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], to: v, hasOverride: true } })}
        />
      )}
      {anyOpen && (
        <Text style={{ marginTop: 10, fontFamily: t.fontMono, fontSize: 11, color: t.accent, lineHeight: 16 }}>
          {formatSchedule(schedule)}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Modal principal
// ---------------------------------------------------------------------------

type Props = { visible: boolean; onClose: () => void };

export function SubmitPlaceModal({ visible, onClose }: Props) {
  const t = useTheme();
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
      name: name.trim(), category,
      latitude: coords.latitude, longitude: coords.longitude,
      short_address: address.trim(),
      opening_hours: hoursStr || undefined,
      description: note.trim() || undefined,
    });
    setLoading(false);
    setResult(
      res.ok
        ? { ok: true, message: '\u2713 Soumis\u00a0! Visible après validation admin.' }
        : { ok: false, message: res.error ?? 'Erreur inconnue.' },
    );
  };

  const busy = loading || geocoding;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose}
          // @ts-ignore
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' }}
        />
        <View style={{
          backgroundColor: t.surface,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          borderTopWidth: 1, borderTopColor: t.border,
          maxHeight: '92%',
        }}>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            padding: 20, borderBottomWidth: 1, borderBottomColor: t.border,
          }}>
            <Text style={{ fontFamily: t.fontMonoBold, fontSize: 16, color: t.text }}>Ajouter un lieu</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={{ color: t.textMuted, fontSize: 16, fontFamily: t.fontMono }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
          >
            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }}>Nom *</Text>
            <TextInput
              style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: t.text, fontFamily: t.fontMono, fontSize: 14 }}
              placeholder="Ex : Épicerie Mohamed"
              placeholderTextColor={t.textFaint}
              value={name} onChangeText={setName} maxLength={80} returnKeyType="next"
            />

            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              {SUBMITTABLE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[{
                    borderWidth: 1, borderColor: t.border, borderRadius: 20,
                    paddingHorizontal: 12, paddingVertical: 6,
                  }, category === cat && { borderColor: t.accent, backgroundColor: t.accentDim }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={{ fontFamily: t.fontMono, fontSize: 12, color: category === cat ? t.text : t.textMuted }}>
                    {PLACE_TYPE_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }}>Adresse postale *</Text>
            <TextInput
              style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: t.text, fontFamily: t.fontMono, fontSize: 14 }}
              placeholder="Ex : 12 rue de la Paix, 75001 Paris"
              placeholderTextColor={t.textFaint}
              value={address} onChangeText={setAddress} maxLength={150}
              autoCapitalize="words" returnKeyType="done"
            />
            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textFaint, marginTop: 6, marginBottom: 4, lineHeight: 16 }}>
              Coordonnées GPS calculées automatiquement via OpenStreetMap.
            </Text>

            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }}>Horaires (optionnel)</Text>
            <HoursEditor schedule={schedule} onChange={setSchedule} />

            <Text style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }}>Note (optionnel)</Text>
            <TextInput
              style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: t.text, fontFamily: t.fontMono, fontSize: 14, height: 72 }}
              placeholder="Stand de rue, épicerie de nuit…"
              placeholderTextColor={t.textFaint}
              value={note} onChangeText={setNote}
              multiline numberOfLines={3} maxLength={200} textAlignVertical="top"
            />

            {result && (
              <View style={[
                { padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 4, borderWidth: 1 },
                result.ok
                  ? { backgroundColor: t.bg, borderColor: t.accent + '66' }
                  : { backgroundColor: t.bg, borderColor: t.colorDanger + '66' },
              ]}>
                <Text style={{ fontFamily: t.fontMono, fontSize: 13, color: result.ok ? t.accent : t.colorDanger }}>
                  {result.message}
                </Text>
              </View>
            )}

            <Pressable
              style={[{
                backgroundColor: t.accent, paddingVertical: 15,
                borderRadius: 12, alignItems: 'center', marginTop: 16,
              }, busy && { opacity: 0.5 }]}
              onPress={handleSubmit} disabled={busy}
            >
              {busy ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color={t.bg} size="small" />
                  <Text style={{ fontFamily: t.fontMonoBold, fontSize: 14, color: t.bg, letterSpacing: 0.5, marginLeft: 8 }}>
                    {geocoding ? 'Géocodage…' : 'Envoi…'}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontFamily: t.fontMonoBold, fontSize: 14, color: t.bg, letterSpacing: 0.5 }}>
                  Envoyer pour validation
                </Text>
              )}
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
