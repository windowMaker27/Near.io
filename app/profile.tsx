import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { signOut, updateProfile } from '@/features/auth/authService';
import { useRemoveAds } from '@/hooks/useRemoveAds';

export default function ProfileScreen() {
  const t = useTheme();
  const { profile, isLoading, setProfile, reset } = useAuthStore();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { adsRemoved, loading: adsLoading, purchase, restore } = useRemoveAds();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, profile]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={t.accent} />
      </SafeAreaView>
    );
  }

  if (!profile) return null;

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
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
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

        {/* ---- SUPPRIMER LES PUBS ---- */}
        <View style={s.adSection}>
          <View style={s.adSectionHeader}>
            <Text style={s.adSectionTitle}>PUBLICITÉS</Text>
            {adsRemoved && (
              <View style={s.adRemovedBadge}>
                <Text style={s.adRemovedBadgeText}>SUPPRIMÉES ✓</Text>
              </View>
            )}
          </View>
          {!adsRemoved ? (
            <>
              <Text style={s.adDesc}>
                Supprimez toutes les publicités pour 0,99 € — achat unique, aucun abonnement.
              </Text>
              <TouchableOpacity
                style={[s.adBtn, adsLoading && s.btnDisabled]}
                onPress={purchase}
                disabled={adsLoading}
              >
                {adsLoading
                  ? <ActivityIndicator color={t.bg} />
                  : <Text style={s.adBtnText}>SUPPRIMER LES PUBS — 0,99 €</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.restoreBtn} onPress={restore} disabled={adsLoading}>
                <Text style={s.restoreText}>Restaurer un achat précédent</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={s.adDesc}>Merci pour votre soutien ! L’application est sans pub.</Text>
          )}
        </View>

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
      alignSelf: 'flex-start', backgroundColor: t.accentBg, borderWidth: 1,
      borderColor: t.accentBorder, paddingHorizontal: t.sp2, paddingVertical: t.sp1,
      borderRadius: t.radiusSm, marginBottom: t.sp2,
    },
    adminBadgeText: { fontFamily: t.fontMonoBold, fontSize: t.textXs, color: t.accent, letterSpacing: t.trackingXl },
    label:          { fontFamily: t.fontMonoBold, fontSize: t.textSm, color: t.textMuted, letterSpacing: t.trackingXl, marginTop: t.sp2 },
    input: {
      fontFamily: t.fontMono, fontSize: t.textMd, color: t.text, backgroundColor: t.surface,
      borderRadius: t.radiusSm, paddingHorizontal: t.sp4, paddingVertical: t.textMd,
      borderWidth: 1, borderColor: t.border,
    },
    error:          { fontFamily: t.fontMono, fontSize: t.textXs + 2, color: t.colorDanger },
    successText:    { fontFamily: t.fontMono, fontSize: t.textXs + 2, color: t.colorSuccess },
    btn:            { backgroundColor: t.accent, borderRadius: t.radiusSm, paddingVertical: t.sp4, alignItems: 'center', marginTop: t.sp2 },
    btnDisabled:    { opacity: 0.5 },
    btnText:        { fontFamily: t.fontMonoBold, fontSize: t.textMd, color: t.bg, letterSpacing: t.trackingXl },
    // Ads section
    adSection:      { marginTop: t.sp4, gap: t.sp3, borderTopWidth: 1, borderTopColor: t.border, paddingTop: t.sp4 },
    adSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: t.sp2 },
    adSectionTitle: { fontFamily: t.fontMonoBold, fontSize: t.textSm, color: t.textMuted, letterSpacing: t.trackingXl },
    adRemovedBadge: { backgroundColor: t.accentBg, borderWidth: 1, borderColor: t.accentBorder, borderRadius: t.radiusSm, paddingHorizontal: t.sp2, paddingVertical: 2 },
    adRemovedBadgeText: { fontFamily: t.fontMonoBold, fontSize: t.textXs, color: t.accent, letterSpacing: 1 },
    adDesc:         { fontFamily: t.fontMono, fontSize: t.textSm, color: t.textMuted, lineHeight: 20 },
    adBtn:          { backgroundColor: t.accent, borderRadius: t.radiusSm, paddingVertical: t.sp4, alignItems: 'center' },
    adBtnText:      { fontFamily: t.fontMonoBold, fontSize: t.textSm, color: t.bg, letterSpacing: t.trackingXl },
    restoreBtn:     { alignItems: 'center', paddingVertical: t.sp2 },
    restoreText:    { fontFamily: t.fontMono, fontSize: t.textSm, color: t.textMuted, textDecorationLine: 'underline' },
    signOutBtn: {
      marginTop: t.sp6, paddingVertical: t.textMd, borderRadius: t.radiusSm,
      borderWidth: 1, borderColor: t.colorDanger + '44', alignItems: 'center',
    },
    signOutText: { fontFamily: t.fontMonoBold, fontSize: t.textBase, color: t.colorDanger, letterSpacing: t.trackingXl },
  });
}
