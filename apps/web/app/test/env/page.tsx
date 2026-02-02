export default function EnvTest() {
  const envVars = [
    { name: 'NODE_ENV', value: process.env.NODE_ENV, required: true },
    { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL, required: true },
    { name: 'GITHUB_TOKEN', value: process.env.GITHUB_TOKEN ? '✓ Set (hidden)' : undefined, required: true },
    { name: 'NPM_TOKEN', value: process.env.NPM_TOKEN ? '✓ Set (hidden)' : undefined, required: true },
    { name: 'VERCEL_TOKEN', value: process.env.VERCEL_TOKEN ? '✓ Set (hidden)' : undefined, required: false },
  ];

  const allRequiredSet = envVars
    .filter(v => v.required)
    .every(v => v.value);

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Environment Variables Test</h1>

      <div style={{
        padding: '20px',
        background: allRequiredSet ? '#d4edda' : '#f8d7da',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {allRequiredSet ? '✅ All required vars set' : '❌ Missing required vars'}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Variable</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Value</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Required</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {envVars.map((env) => (
            <tr key={env.name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{env.name}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace', color: '#666' }}>
                {env.value || '(not set)'}
              </td>
              <td style={{ padding: '8px' }}>{env.required ? 'Yes' : 'No'}</td>
              <td style={{ padding: '8px' }}>
                {env.value ? '✅' : env.required ? '❌' : '⚪'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <a href="/test">← Back to Tests</a>
      </div>
    </main>
  );
}
