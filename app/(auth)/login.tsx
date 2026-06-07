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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const profile = await signIn({ email: email.trim(), password });
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

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text style={styles.linkMuted}>← Retour</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center', gap: 14 },
  title: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 26, color: theme.text, letterSpacing: 3 },
  subtitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: theme.textMuted, letterSpacing: 3, marginBottom: 12 },
  input: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: theme.text, backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.border },
  error: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#ff4444' },
  btn: { backgroundColor: theme.accent, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 14, color: theme.bg, letterSpacing: 2 },
  link: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: theme.accent, textAlign: 'center', marginTop: 8 },
  linkMuted: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: theme.textMuted, textAlign: 'center' },
});
