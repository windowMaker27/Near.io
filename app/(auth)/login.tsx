import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { signIn } from '@/features/auth/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const profile = await signIn({ identifier: identifier.trim(), password });
      setProfile(profile);
      router.replace('/');
    } catch (e: any) {
      setError(e.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.title}>NEAR.IO</Text>
        <Text style={styles.subtitle}>CONNEXION</Text>

        <TextInput
          style={styles.input}
          placeholder="Email ou nom d'utilisateur"
          placeholderTextColor={theme.textMuted}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoComplete="username"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor={theme.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.bg} />
            : <Text style={styles.btnText}>SE CONNECTER</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Pas de compte ?  Créer un compte</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: theme.sp2 }}>
          <Text style={styles.linkMuted}>← Retour</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center', gap: theme.sp3 + 2 },
  title: { fontFamily: theme.fontMonoBold, fontSize: theme.text3xl, color: theme.text, letterSpacing: theme.trackingTitle },
  subtitle: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.textMuted, letterSpacing: theme.trackingTitle, marginBottom: theme.sp3 },
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
  btn: { backgroundColor: theme.accent, borderRadius: theme.radiusSm, paddingVertical: theme.sp4, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: theme.fontMonoBold, fontSize: theme.textMd, color: theme.bg, letterSpacing: theme.trackingXl },
  link: { fontFamily: theme.fontMono, fontSize: theme.textBase, color: theme.accent, textAlign: 'center', marginTop: theme.sp2 },
  linkMuted: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.textMuted, textAlign: 'center' },
});
