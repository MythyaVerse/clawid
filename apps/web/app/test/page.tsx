import Link from 'next/link';

export default function TestIndex() {
  const tests = [
    { name: 'Environment Variables', path: '/test/env', description: 'Check all env vars are set' },
    { name: 'GitHub API', path: '/test/github', description: 'Test GitHub token for gist verification' },
    { name: 'npm Registry', path: '/test/npm', description: 'Test npm token for publishing' },
    { name: 'Neon Database', path: '/test/neon', description: 'Test PostgreSQL database connection' },
  ];

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Connectivity Tests</h1>
      <p style={{ color: '#666' }}>
        Verify all external services are properly configured.
      </p>

      <div style={{ marginTop: '20px' }}>
        {tests.map((test) => (
          <Link
            key={test.path}
            href={test.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
            }}>
              <h3 style={{ margin: '0 0 4px 0' }}>{test.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{test.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </main>
  );
}
