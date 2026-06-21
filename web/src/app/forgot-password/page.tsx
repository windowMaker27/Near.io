'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de l’envoi');
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
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Mot de passe oublié
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            On t’envoie un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-6)',
              backgroundColor: 'var(--color-success-highlight)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-success)', margin: '0 0 var(--space-2)' }}>
              Email envoyé !
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            noValidate
          >
            <label
              style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}
              htmlFor="reset-email"
            >
              Email
            </label>
            <input
              id="reset-email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com" style={inputStyle}
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
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <Link
          href="/login"
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          ← Retour à la connexion
        </Link>
      </div>

      <style>{`input:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }`}</style>
    </main>
  );
}
