import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { signOut, updateProfile } from '@/features/auth/authService';

export default function ProfileScreen() {
  const { profile, setProfile, reset } = useAuthStore();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    router.replace('/(auth)/login');
    return null;
  }

  async function handleSave() {
    setError(null); setSuccess(false);
    if (!username.trim()) { setError('Username requis'); return; }
    setLoading(true);
    try {
      await updateProfile(profile!.id, { username: username.trim() });
      setProfile({ ...profile!, username: username.trim() });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter', style: 'destructive',
        onPress: async () => {
          await signOut();
          reset();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>PROFIL</Text>
        {profile.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        )}

        <Text style={styles.label}>USERNAME</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={30}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {success && <Text style={styles.successText}>Profil mis à jour ✓</Text>}

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.bg} /> : <Text style={styles.btnText}>ENREGISTRER</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>SE DÉCONNECTER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, padding: 28, gap: 12 },
  back: { marginBottom: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: theme.textMuted },
  title: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 22, color: theme.text, letterSpacing: 3, marginBottom: 4 },
  adminBadge: { alignSelf: 'flex-start', backgroundColor: `${theme.accent}22`, borderWidth: 1, borderColor: `${theme.accent}66`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  adminBadgeText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 10, color: theme.accent, letterSpacing: 2 },
  label: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: theme.textMuted, letterSpacing: 2, marginTop: 8 },
  input: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: theme.text, backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.border },
  error: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#ff4444' },
  successText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#5aaa5a' },
  btn: { backgroundColor: theme.accent, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 14, color: theme.bg, letterSpacing: 2 },
  signOutBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ff444444', alignItems: 'center' },
  signOutText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, color: '#ff4444', letterSpacing: 2 },
});
