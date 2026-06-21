'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });
      if (err) throw err;
      if (data.user) setUser(data.user);
      router.replace('/');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>near.</h1>
        <p style={styles.subtitle}>Connexion</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="vous@exemple.com"
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
          />

          {error && <p style={styles.error} role="alert">{error}</p>}

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.links}>
          <Link href="/forgot-password" style={styles.link}>Mot de passe oublié ?</Link>
          <Link href="/register" style={styles.link}>Créer un compte</Link>
        </div>
      </div>

      <style>{formStyles}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
  },
  card: {
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
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' },
  label: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' },
  input: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface-offset)',
    color: 'var(--color-text)',
    fontSize: 'var(--text-base)',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  error: { fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0 },
  btn: {
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
    transition: 'background var(--transition-interactive)',
  },
  links: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  },
  link: { fontSize: 'var(--text-xs)', color: 'var(--color-primary)' },
};

const formStyles = `
  input:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  button:hover:not(:disabled) { background: var(--color-primary-hover) !important; }
`;
