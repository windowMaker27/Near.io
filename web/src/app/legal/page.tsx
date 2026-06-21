import { AppHeader } from '@/components/AppHeader';

export default function LegalPage() {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <AppHeader title="Mentions légales" showBack />

      <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Éditeur</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Near.io est une application développée à titre personnel. Pour toute question, contactez-nous à l\'adresse : <a href="mailto:contact@near.io" style={{ color: 'var(--color-primary)' }}>contact@near.io</a>
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Hébergement</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            L\'application est hébergée sur Vercel (Vercel Inc., 340 Pine Street, San Francisco, CA 94104, États-Unis).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Données personnelles</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Les données collectées (email, localisation) sont utilisées uniquement pour le fonctionnement du service. Aucune donnée n\'est vendue à des tiers. Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Propriété intellectuelle</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            L\'ensemble du contenu de l\'application (code, design, textes) est la propriété exclusive de ses auteurs et est protégé par le droit d\'auteur.
          </p>
        </section>
      </div>
    </main>
  );
}
