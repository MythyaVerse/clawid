import { neon } from '@neondatabase/serverless';

// Create a singleton SQL client
const sql = neon(process.env.DATABASE_URL!);

export { sql };

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
