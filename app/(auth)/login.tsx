import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { signIn } from '@/features/auth/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const t = useTheme();
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
    <SafeAreaView style={[s.safe, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={[s.title, { color: t.text, fontFamily: t.fontMonoBold }]}>NEAR.IO</Text>
        <Text style={[s.subtitle, { color: t.textMuted, fontFamily: t.fontMono }]}>CONNEXION</Text>

        <TextInput
          style={[s.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border, fontFamily: t.fontMono }]}
          placeholder="Email ou nom d'utilisateur"
          placeholderTextColor={t.textMuted}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoComplete="username"
        />
        <TextInput
          style={[s.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border, fontFamily: t.fontMono }]}
          placeholder="Mot de passe"
          placeholderTextColor={t.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={[s.error, { color: t.colorDanger, fontFamily: t.fontMono }]}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, { backgroundColor: t.accent }, loading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={t.bg} />
            : <Text style={[s.btnText, { color: t.bg, fontFamily: t.fontMonoBold }]}>SE CONNECTER</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={[s.link, { color: t.accent, fontFamily: t.fontMono }]}>Pas de compte ?  Créer un compte</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text style={[s.linkMuted, { color: t.textMuted, fontFamily: t.fontMono }]}>← Retour</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 28, justifyContent: 'center', gap: 14 },
  title: { fontSize: 28, letterSpacing: 6 },
  subtitle: { fontSize: 11, letterSpacing: 4, marginBottom: 12 },
  input: { fontSize: 14, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  error: { fontSize: 12 },
  btn: { borderRadius: 6, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 14, letterSpacing: 3 },
  link: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  linkMuted: { fontSize: 11, textAlign: 'center' },
});
