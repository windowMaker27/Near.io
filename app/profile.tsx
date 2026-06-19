import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { signOut, updateProfile } from '@/features/auth/authService';

export default function ProfileScreen() {
  const t = useTheme();
  const { profile, isLoading, setProfile, reset } = useAuthStore();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pendant le boot, Supabase restaure la session depuis MMKV de façon async.
  // On attend la fin du chargement avant de décider si l'utilisateur est connecté.
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={t.accent} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    router.replace('/(auth)/login');
    return null;
  }

  async function handleSave() {
    setError(null); setSuccess(false);
    if (!username.trim()) { setError('Username requis'); return; }
    setSaving(true);
    try {
      await updateProfile(profile!.id, { username: username.trim() });
      setProfile({ ...profile!, username: username.trim() });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Erreur de mise à jour');
    } finally {
      setSaving(false);
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

  const s = makeStyles(t);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={s.title}>PROFIL</Text>
        {profile.role === 'admin' && (
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>ADMIN</Text>
          </View>
        )}

        <Text style={s.label}>USERNAME</Text>
        <TextInput
          style={s.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={30}
          placeholderTextColor={t.textMuted}
        />

        {error && <Text style={s.error}>{error}</Text>}
        {success && <Text style={s.successText}>Profil mis à jour ✓</Text>}

        <TouchableOpacity style={[s.btn, saving && s.btnDisabled]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color={t.bg} />
            : <Text style={s.btnText}>ENREGISTRER</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>SE DÉCONNECTER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: ReturnType<typeof import('@/hooks/useTheme').useTheme>) {
  return StyleSheet.create({
    safe:           { flex: 1, backgroundColor: t.bg },
    container:      { flex: 1, padding: t.pagePad, gap: t.sp3 },
    back:           { marginBottom: t.sp2 },
    backText:       { fontFamily: t.fontMono, fontSize: t.textBase, color: t.textMuted },
    title:          { fontFamily: t.fontMonoBold, fontSize: t.text2xl, color: t.text, letterSpacing: t.trackingTitle, marginBottom: t.sp1 },
    adminBadge:     {
      alignSelf: 'flex-start',
      backgroundColor: t.accentBg,
      borderWidth: 1,
      borderColor: t.accentBorder,
      paddingHorizontal: t.sp2,
      paddingVertical: t.sp1,
      borderRadius: t.radiusSm,
      marginBottom: t.sp2,
    },
    adminBadgeText: { fontFamily: t.fontMonoBold, fontSize: t.textXs, color: t.accent, letterSpacing: t.trackingXl },
    label:          { fontFamily: t.fontMonoBold, fontSize: t.textSm, color: t.textMuted, letterSpacing: t.trackingXl, marginTop: t.sp2 },
    input: {
      fontFamily: t.fontMono,
      fontSize: t.textMd,
      color: t.text,
      backgroundColor: t.surface,
      borderRadius: t.radiusSm,
      paddingHorizontal: t.sp4,
      paddingVertical: t.textMd,
      borderWidth: 1,
      borderColor: t.border,
    },
    error:          { fontFamily: t.fontMono, fontSize: t.textXs + 2, color: t.colorDanger },
    successText:    { fontFamily: t.fontMono, fontSize: t.textXs + 2, color: t.colorSuccess },
    btn:            { backgroundColor: t.accent, borderRadius: t.radiusSm, paddingVertical: t.sp4, alignItems: 'center', marginTop: t.sp2 },
    btnDisabled:    { opacity: 0.5 },
    btnText:        { fontFamily: t.fontMonoBold, fontSize: t.textMd, color: t.bg, letterSpacing: t.trackingXl },
    signOutBtn: {
      marginTop: t.sp6,
      paddingVertical: t.textMd,
      borderRadius: t.radiusSm,
      borderWidth: 1,
      borderColor: t.colorDanger + '44',
      alignItems: 'center',
    },
    signOutText:    { fontFamily: t.fontMonoBold, fontSize: t.textBase, color: t.colorDanger, letterSpacing: t.trackingXl },
  });
}
