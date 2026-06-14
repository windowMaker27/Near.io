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
  container: { flex: 1, padding: 28, gap: theme.sp3 },
  back: { marginBottom: theme.sp2 },
  backText: { fontFamily: theme.fontMono, fontSize: theme.textBase, color: theme.textMuted },
  title: { fontFamily: theme.fontMonoBold, fontSize: theme.text2xl, color: theme.text, letterSpacing: theme.trackingTitle, marginBottom: theme.sp1 },
  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.accentBg,
    borderWidth: 1,
    borderColor: theme.accentBorder,
    paddingHorizontal: theme.sp2,
    paddingVertical: theme.sp1,
    borderRadius: theme.sp1,
    marginBottom: theme.sp2,
  },
  adminBadgeText: { fontFamily: theme.fontMonoBold, fontSize: theme.textXs, color: theme.accent, letterSpacing: theme.trackingXl },
  label: { fontFamily: theme.fontMonoBold, fontSize: theme.textSm, color: theme.textMuted, letterSpacing: theme.trackingXl, marginTop: theme.sp2 },
  input: {
    fontFamily: theme.fontMono,
    fontSize: theme.textMd,
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: theme.radiusSm,
    paddingHorizontal: theme.sp4,
    paddingVertical: theme.textMd,
    borderWidth: 1,
    borderColor: theme.border,
  },
  error: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.colorDanger },
  successText: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.colorSuccess },
  btn: { backgroundColor: theme.accent, borderRadius: theme.radiusSm, paddingVertical: theme.sp4, alignItems: 'center', marginTop: theme.sp2 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: theme.fontMonoBold, fontSize: theme.textMd, color: theme.bg, letterSpacing: theme.trackingXl },
  signOutBtn: {
    marginTop: theme.sp6,
    paddingVertical: theme.textMd,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.colorDanger + '44',
    alignItems: 'center',
  },
  signOutText: { fontFamily: theme.fontMonoBold, fontSize: theme.textBase, color: theme.colorDanger, letterSpacing: theme.trackingXl },
});
