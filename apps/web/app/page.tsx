export default function Home() {
  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ClawID</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        Cryptographic verification for AI agent skills.
      </p>

      <div style={{
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Coming Soon</h2>
        <p>Sign up for the waitlist to be notified when we launch.</p>
        {/* TODO: Add waitlist form */}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Developer Links</h3>
        <ul>
          <li><a href="/test">Connectivity Tests</a></li>
        </ul>
      </div>
    </main>
  );
}
