/**
 * Modal de soumission d'un lieu par l'utilisateur.
 * Utilise uniquement des composants RN core — pas de dépendance native.
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import { SUBMITTABLE_CATEGORIES, PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { submitPlace } from '@/services/supabaseService';
import { useAppStore } from '@/store/appStore';
import { PlaceCategory } from '@/types/place';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SubmitPlaceModal({ visible, onClose }: Props) {
  const { userLocation } = useAppStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('grocery');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const reset = () => {
    setName(''); setCategory('grocery'); setAddress('');
    setHours(''); setNote(''); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setResult({ ok: false, message: 'Le nom est requis.' }); return; }
    if (!userLocation) { setResult({ ok: false, message: 'Position GPS indisponible.' }); return; }
    setLoading(true);
    const res = await submitPlace({
      name: name.trim(),
      category,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      short_address: address.trim() || undefined,
      opening_hours: hours.trim() || undefined,
      description: note.trim() || undefined,
    });
    setLoading(false);
    setResult(
      res.ok
        ? { ok: true, message: '✓ Soumis ! Visible après validation.' }
        : { ok: false, message: res.error ?? 'Erreur inconnue.' },
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Ajouter un lieu</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={s.body} keyboardShouldPersistTaps="handled">

            <Text style={s.label}>Nom *</Text>
            <TextInput
              style={s.input}
              placeholder="Ex : Épicerie Mohamed"
              placeholderTextColor={theme.textFaint}
              value={name}
              onChangeText={setName}
              maxLength={80}
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

            <Text style={s.label}>Adresse courte (optionnel)</Text>
            <TextInput
              style={s.input}
              placeholder="Ex : 12 rue de la Paix, Paris"
              placeholderTextColor={theme.textFaint}
              value={address}
              onChangeText={setAddress}
              maxLength={120}
            />

            <Text style={s.label}>Horaires (optionnel)</Text>
            <TextInput
              style={s.input}
              placeholder="Ex : Lun-Sam 8h-20h"
              placeholderTextColor={theme.textFaint}
              value={hours}
              onChangeText={setHours}
              maxLength={100}
            />

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
            />

            <Text style={s.hint}>
              📍 Coordonnées GPS actuelles utilisées automatiquement.
            </Text>

            {result && (
              <View style={[s.resultBox, result.ok ? s.resultOk : s.resultErr]}>
                <Text style={s.resultText}>{result.message}</Text>
              </View>
            )}

            <Pressable
              style={[s.submitBtn, loading && s.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={theme.bg} />
                : <Text style={s.submitLabel}>Envoyer pour validation</Text>
              }
            </Pressable>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontFamily: theme.fontMonoBold,
    fontSize: 16,
    color: theme.text,
  },
  closeBtn: { color: theme.textMuted, fontSize: 16, fontFamily: theme.fontMono },
  body: { paddingHorizontal: 20, paddingTop: 16 },
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
  inputMulti: { height: 72, textAlignVertical: 'top' },
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
    marginTop: 14,
    marginBottom: 8,
  },
  resultBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 4,
  },
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
  submitLabel: {
    fontFamily: theme.fontMonoBold,
    fontSize: 14,
    color: theme.bg,
    letterSpacing: 0.5,
  },
});
