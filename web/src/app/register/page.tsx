'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { setError('Mot de passe : 8 caractères minimum.'); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: username.trim() } },
      });
      if (err) throw err;
      if (data.user) setUser(data.user);
      router.replace('/');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface-offset)',
    color: 'var(--color-text)',
    fontSize: 'var(--text-base)',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            near.io
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Créer un compte
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          noValidate
        >
          <label style={labelStyle} htmlFor="username">Nom d’utilisateur</label>
          <input
            id="username" type="text" autoComplete="username" required
            value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="votre_pseudo" style={inputStyle}
          />

          <label style={labelStyle} htmlFor="reg-email">Email</label>
          <input
            id="reg-email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com" style={inputStyle}
          />

          <label style={labelStyle} htmlFor="reg-password">Mot de passe</label>
          <input
            id="reg-password" type="password" autoComplete="new-password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum" style={inputStyle}
          />

          <label style={labelStyle} htmlFor="confirm-password">Confirmer le mot de passe</label>
          <input
            id="confirm-password" type="password" autoComplete="new-password" required
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••" style={inputStyle}
          />

          {error && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0 }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)' }}>Se connecter</Link>
        </p>
      </div>

      <style>{`
        input:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: var(--radius-md); }
        button:hover:not(:disabled) { background: var(--color-primary-hover) !important; }
      `}</style>
    </main>
  );
}
