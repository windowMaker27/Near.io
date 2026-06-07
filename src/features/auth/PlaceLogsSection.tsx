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
import { theme } from '@/constants/theme';
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
  return (
    <View style={styles.logRow}>
      <Text style={styles.logText}>
        <Text style={styles.logMeta}>{formatLogDate(log.createdAt)}</Text>
        <Text style={styles.logAt}>@{log.username}</Text>
        <Text style={styles.logSep}>&gt; </Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LOGS</Text>
        <TouchableOpacity
          onPress={handleAddPress}
          hitSlop={10}
          accessibilityLabel="Ajouter un log"
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={{ marginVertical: 12 }} />
      ) : logs.length === 0 ? (
        <Text style={styles.empty}>Aucun log — soyez le premier à signaler quelque chose.</Text>
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
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouveau log</Text>
            <TextInput
              style={styles.input}
              placeholder="Que voulez-vous signaler ?"
              placeholderTextColor={theme.textMuted}
              value={draft}
              onChangeText={(t) => setDraft(t.slice(0, MAX_CHARS))}
              multiline
              maxLength={MAX_CHARS}
              autoFocus
            />
            <Text style={styles.charCount}>{draft.length}/{MAX_CHARS}</Text>
            {postError && <Text style={styles.errorText}>{postError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, (!draft.trim() || isPosting) && styles.submitBtnDisabled]}
                disabled={!draft.trim() || isPosting}
              >
                {isPosting
                  ? <ActivityIndicator color={theme.bg} size="small" />
                  : <Text style={styles.submitBtnText}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: theme.textMuted, letterSpacing: 2 },
  addBtnText: {
    fontSize: 26,
    lineHeight: 28,
    color: theme.accent,
    fontFamily: 'JetBrainsMono_400Regular',
  },
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: theme.textMuted, fontStyle: 'italic' },
  logRow: { marginBottom: 6 },
  logText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: theme.text, lineHeight: 18 },
  logMeta: { color: theme.textMuted },
  logAt: { color: theme.accent },
  logSep: { color: theme.textMuted },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { backgroundColor: theme.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 36 },
  modalTitle: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, color: theme.text, marginBottom: 14, letterSpacing: 1 },
  input: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: theme.text, backgroundColor: theme.bg, borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.border },
  charCount: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: theme.textMuted, textAlign: 'right', marginTop: 4 },
  errorText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#ff4444', marginTop: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelBtnText: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13, color: theme.textMuted },
  submitBtn: { backgroundColor: theme.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 90, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, color: theme.bg },
});
