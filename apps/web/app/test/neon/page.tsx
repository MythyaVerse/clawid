import { neon } from '@neondatabase/serverless';

interface TestResult {
  connected: boolean;
  version?: string;
  database?: string;
  tables?: number;
  error?: string;
}

async function testNeonConnection(): Promise<TestResult> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      connected: false,
      error: 'DATABASE_URL environment variable not set',
    };
  }

  try {
    const sql = neon(databaseUrl);

    // Test connection and get version
    const versionResult = await sql`SELECT version()`;
    const version = versionResult[0]?.version;

    // Get database name
    const dbResult = await sql`SELECT current_database()`;
    const database = dbResult[0]?.current_database;

    // Count tables
    const tablesResult = await sql`
      SELECT count(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const tables = parseInt(tablesResult[0]?.count || '0');

    return {
      connected: true,
      version: version?.split(',')[0] || 'Unknown',
      database,
      tables,
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export default async function NeonTest() {
  const result = await testNeonConnection();

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Neon Database Test</h1>

      <div
        style={{
          padding: '20px',
          background: result.connected ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <strong>Status:</strong>{' '}
        {result.connected ? '✅ Connected' : '❌ Not Connected'}
      </div>

      {result.connected ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Database</td>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                {result.database}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>PostgreSQL Version</td>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                {result.version}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Public Tables</td>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                {result.tables} {result.tables === 0 && '(empty - ready for schema)'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Project ID</td>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                wild-fire-23032082
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div
          style={{
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
          }}
        >
          <strong>Error:</strong> {result.error}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <a href="/test" style={{ color: '#667eea' }}>
          ← Back to Tests
        </a>
      </div>
    </main>
  );
}
