import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { usePlaceLogs } from './usePlaceLogs';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { PlaceLog } from '@/types/user';

const MAX_CHARS = 150;

function formatLogDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}//${pad(d.getHours())}:${pad(d.getMinutes())}]`;
}

function LogItem({ log }: { log: PlaceLog }) {
  const t = useTheme();
  return (
    <View style={s.logRow}>
      <Text style={[s.logText, { color: t.text, fontFamily: t.fontMono }]}>
        <Text style={{ color: t.textMuted }}>{formatLogDate(log.createdAt)}</Text>
        <Text style={{ color: t.accent }}>@{log.username}</Text>
        <Text style={{ color: t.textMuted }}>&gt; </Text>
        <Text>{log.content}</Text>
      </Text>
    </View>
  );
}

type Props = {
  placeId: string;
  onCloseParent?: () => void;
};

export function PlaceLogsSection({ placeId, onCloseParent }: Props) {
  const t = useTheme();
  const { logs, isLoading, isPosting, addLog } = usePlaceLogs(placeId);
  const { session } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [postError, setPostError] = useState<string | null>(null);

  async function handleSubmit() {
    setPostError(null);
    try {
      await addLog(draft);
      setDraft('');
      setModalVisible(false);
    } catch (e: any) {
      setPostError(e.message ?? 'Erreur');
    }
  }

  function handleAddPress() {
    if (!session) {
      onCloseParent?.();
      router.push('/(auth)/register');
      return;
    }
    setModalVisible(true);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={[s.title, { color: t.textMuted, fontFamily: t.fontMonoBold }]}>LOGS</Text>
        <TouchableOpacity onPress={handleAddPress} hitSlop={10} accessibilityLabel="Ajouter un log">
          <Text style={[s.addBtnText, { color: t.accent, fontFamily: t.fontMono }]}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={t.accent} style={{ marginVertical: 12 }} />
      ) : logs.length === 0 ? (
        <Text style={[s.empty, { color: t.textMuted, fontFamily: t.fontMono }]}>
          Aucun log — soyez le premier à signaler quelque chose.
        </Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LogItem log={item} />}
          scrollEnabled={false}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={[s.modalBox, { backgroundColor: t.surface }]}>
            <Text style={[s.modalTitle, { color: t.text, fontFamily: t.fontMonoBold }]}>Nouveau log</Text>
            <TextInput
              style={[s.input, { color: t.text, backgroundColor: t.bg, borderColor: t.border, fontFamily: t.fontMono }]}
              placeholder="Que voulez-vous signaler ?"
              placeholderTextColor={t.textMuted}
              value={draft}
              onChangeText={(v) => setDraft(v.slice(0, MAX_CHARS))}
              multiline
              maxLength={MAX_CHARS}
              autoFocus
            />
            <Text style={[s.charCount, { color: t.textMuted, fontFamily: t.fontMono }]}>{draft.length}/{MAX_CHARS}</Text>
            {postError && <Text style={s.errorText}>{postError}</Text>}
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={s.cancelBtn}>
                <Text style={[s.cancelBtnText, { color: t.textMuted, fontFamily: t.fontMonoMedium }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[s.submitBtn, { backgroundColor: t.accent }, (!draft.trim() || isPosting) && s.submitBtnDisabled]}
                disabled={!draft.trim() || isPosting}
              >
                {isPosting
                  ? <ActivityIndicator color={t.bg} size="small" />
                  : <Text style={[s.submitBtnText, { color: t.bg, fontFamily: t.fontMonoBold }]}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 11, letterSpacing: 2 },
  addBtnText: { fontSize: 26, lineHeight: 28 },
  empty: { fontSize: 12, fontStyle: 'italic' },
  logRow: { marginBottom: 6 },
  logText: { fontSize: 12, lineHeight: 18 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 13, marginBottom: 14, letterSpacing: 1 },
  input: { fontSize: 13, borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top', borderWidth: 1 },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  errorText: { fontSize: 12, color: '#ff4444', marginTop: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelBtnText: { fontSize: 13 },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 90, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 13 },
});
