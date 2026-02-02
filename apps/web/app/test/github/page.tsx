interface GitHubUser {
  login: string;
  name: string;
  public_repos: number;
}

async function testGitHubConnection(): Promise<{
  connected: boolean;
  error: string | null;
  data: GitHubUser | null;
}> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { connected: false, error: 'GITHUB_TOKEN not set', data: null };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { connected: false, error: `GitHub API error: ${res.status} - ${errorText}`, data: null };
    }

    const data = await res.json() as GitHubUser;
    return { connected: true, error: null, data };
  } catch (e) {
    return { connected: false, error: (e as Error).message, data: null };
  }
}

export default async function GitHubTest() {
  const status = await testGitHubConnection();

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>GitHub API Test</h1>
      <p style={{ color: '#666' }}>Tests the GITHUB_TOKEN for gist verification.</p>

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
            <p><strong>Authenticated as:</strong> @{status.data.login}</p>
            {status.data.name && <p><strong>Name:</strong> {status.data.name}</p>}
            <p><strong>Public repos:</strong> {status.data.public_repos}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>What this tests:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>GitHub token is valid</li>
          <li>Can authenticate with GitHub API</li>
          <li>Required for verifying publisher gists</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/test">← Back to Tests</a>
      </div>
    </main>
  );
}
