import { Pool } from '@neondatabase/serverless';

// Create a pool-based SQL client (WebSocket connection, more reliable than HTTP)
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Wrapper function to match the template literal API
async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // Build query from template literal
  let query = '';
  const params: any[] = [];

  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;
    }
  }

  const result = await pool.query(query, params);
  return result;
}

export { sql, pool };

// Types for the skills table
export interface Skill {
  id: number;
  publisher_did: string;
  skill_name: string;
  skill_hash: string;
  signed_at: Date;
  source_url: string | null;
  signature: string;
  created_at: Date;
}

export interface RegisterSkillInput {
  publisher_did: string;
  skill_name: string;
  skill_hash: string;
  source_url?: string;
  signature: string;
  signed_at?: string;
}

export interface PublisherSkillsResponse {
  publisher: {
    did: string;
    identity_verified: boolean;
  };
  skills: {
    name: string;
    hash: string;
    signed_at: string;
    source_url?: string;
  }[];
  total: number;
}
