export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Connexion</h1>
        {/* AuthForm injecté Phase 2 */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Phase 2 — AuthForm</p>
      </div>
    </main>
  );
}
