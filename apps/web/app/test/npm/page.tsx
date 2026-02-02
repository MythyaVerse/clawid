interface NpmUser {
  name: string;
  email: string;
}

async function testNpmConnection(): Promise<{
  connected: boolean;
  error: string | null;
  data: NpmUser | null;
}> {
  const token = process.env.NPM_TOKEN;

  if (!token) {
    return { connected: false, error: 'NPM_TOKEN not set', data: null };
  }

  try {
    // Test by fetching the whoami endpoint
    const res = await fetch('https://registry.npmjs.org/-/whoami', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { connected: false, error: `npm API error: ${res.status} - ${errorText}`, data: null };
    }

    const data = await res.json() as { username: string };
    return {
      connected: true,
      error: null,
      data: { name: data.username, email: '(not returned by API)' }
    };
  } catch (e) {
    return { connected: false, error: (e as Error).message, data: null };
  }
}

export default async function NpmTest() {
  const status = await testNpmConnection();

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>npm Registry Test</h1>
      <p style={{ color: '#666' }}>Tests the NPM_TOKEN for publishing @clawid/cli.</p>

      <div style={{
        padding: '20px',
        background: status.connected ? '#d4edda' : '#f8d7da',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <strong>Status:</strong> {status.connected ? '✅ Connected' : '❌ Failed'}

        {status.error && (
          <p style={{ margin: '10px 0 0 0', color: '#721c24' }}>
            <strong>Error:</strong> {status.error}
          </p>
        )}

        {status.data && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Authenticated as:</strong> {status.data.name}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>What this tests:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>npm token is valid</li>
          <li>Can authenticate with npm registry</li>
          <li>Required for publishing @clawid/cli package</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Next step:</h3>
        <p style={{ margin: 0 }}>
          Create the <code>@clawid</code> organization on npm:{' '}
          <a href="https://www.npmjs.com/org/create" target="_blank" rel="noopener">
            npmjs.com/org/create
          </a>
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/test">← Back to Tests</a>
      </div>
    </main>
  );
}
