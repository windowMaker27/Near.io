import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { signUp } from '@/features/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();

  async function handleRegister() {
    setError(null);

    if (!username.trim()) { setError('Le nom d\'utilisateur est requis.'); return; }
    if (username.trim().length < 3) { setError('Le nom d\'utilisateur doit faire au moins 3 caractères.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et _.'); return; }
    if (!email.trim()) { setError('L\'adresse email est requise.'); return; }
    if (password.length < 8) { setError('Mot de passe trop court (8 caractères minimum).'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true);
    try {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle();
      if (existingUsername) {
        setError('Ce nom d\'utilisateur est déjà utilisé.');
        return;
      }

      const profile = await signUp({ email: email.trim(), password, username: username.trim() });
      setProfile(profile);
      router.replace('/');
    } catch (e: any) {
      if (e.message?.toLowerCase().includes('already registered') ||
          e.message?.toLowerCase().includes('email') ||
          e.code === 'user_already_exists') {
        setError('Cette adresse email est déjà associée à un compte.');
      } else {
        setError(e.message ?? 'Erreur lors de la création du compte.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.title}>NEAR.IO</Text>
        <Text style={styles.subtitle}>CRÉER UN COMPTE</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          placeholderTextColor={theme.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor={theme.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={theme.textMuted}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.bg} />
            : <Text style={styles.btnText}>CRÉER LE COMPTE</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Déjà un compte ?  Se connecter</Text>
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
  error: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.colorDanger, lineHeight: 18 },
  btn: { backgroundColor: theme.accent, borderRadius: theme.radiusSm, paddingVertical: theme.sp4, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: theme.fontMonoBold, fontSize: theme.textMd, color: theme.bg, letterSpacing: theme.trackingXl },
  link: { fontFamily: theme.fontMono, fontSize: theme.textBase, color: theme.accent, textAlign: 'center', marginTop: theme.sp2 },
  linkMuted: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.textMuted, textAlign: 'center' },
});
