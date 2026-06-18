import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/features/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const t = useTheme();
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
    <SafeAreaView style={[s.safe, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={[s.title, { color: t.text, fontFamily: t.fontMonoBold }]}>NEAR.IO</Text>
        <Text style={[s.subtitle, { color: t.textMuted, fontFamily: t.fontMono }]}>CRÉER UN COMPTE</Text>

        {[{ ph: "Nom d'utilisateur", val: username, set: setUsername, cap: 'none' as const, corr: false },
          { ph: 'Email', val: email, set: setEmail, cap: 'none' as const, kb: 'email-address' as const },
          { ph: 'Mot de passe', val: password, set: setPassword, secure: true },
          { ph: 'Confirmer le mot de passe', val: confirm, set: setConfirm, secure: true },
        ].map(({ ph, val, set, cap, kb, secure, corr }) => (
          <TextInput
            key={ph}
            style={[s.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border, fontFamily: t.fontMono }]}
            placeholder={ph}
            placeholderTextColor={t.textMuted}
            value={val}
            onChangeText={set}
            autoCapitalize={cap ?? 'sentences'}
            autoCorrect={corr ?? true}
            keyboardType={kb}
            secureTextEntry={secure}
          />
        ))}

        {error && <Text style={[s.error, { color: t.colorDanger, fontFamily: t.fontMono }]}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, { backgroundColor: t.accent }, loading && s.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={t.bg} />
            : <Text style={[s.btnText, { color: t.bg, fontFamily: t.fontMonoBold }]}>CRÉER LE COMPTE</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={[s.link, { color: t.accent, fontFamily: t.fontMono }]}>Déjà un compte ?  Se connecter</Text>
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
  error: { fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: 6, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 14, letterSpacing: 3 },
  link: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  linkMuted: { fontSize: 11, textAlign: 'center' },
});
