import { NextRequest, NextResponse } from 'next/server';
import { sql, type PublisherSkillsResponse } from '@/lib/db';

/**
 * GET /api/v1/publisher/:did/skills
 *
 * Get all skills registered by a publisher.
 *
 * Response:
 * {
 *   "publisher": {
 *     "did": "did:key:z6Mk...",
 *     "identity_verified": true/false
 *   },
 *   "skills": [
 *     { "name": "...", "hash": "sha256:...", "signed_at": "...", "source_url": "..." }
 *   ],
 *   "total": 1
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    // Await params (required in Next.js 14+)
    const { did: rawDid } = await params;
    // URL decode the DID (colons are encoded as %3A)
    const did = decodeURIComponent(rawDid);

    // Validate DID format
    if (!did.startsWith('did:key:')) {
      return NextResponse.json(
        { error: 'Invalid DID format. Must be did:key:...' },
        { status: 400 }
      );
    }

    // Debug: first check all skills to verify connection
    const allSkills = await sql`SELECT id, publisher_did FROM skills LIMIT 5`;
    console.log('All skills in DB:', JSON.stringify(allSkills));
    console.log('Looking for DID:', did);
    console.log('DID length:', did.length);

    // Query skills for this publisher
    const skills = await sql`
      SELECT skill_name, skill_hash, signed_at, source_url
      FROM skills
      WHERE publisher_did = ${did}
      ORDER BY signed_at DESC
    `;

    // Debug: log query details
    console.log('Skills found:', skills.length);

    // For now, we don't have identity verification integrated
    // In the future, this could check against a verified publishers table
    const identityVerified = false;

    // Temporarily return debug info
    return NextResponse.json({
      debug: {
        queried_did: did,
        did_length: did.length,
        all_skills_in_db: allSkills,
        matching_skills: skills.length,
      },
      publisher: {
        did,
        identity_verified: identityVerified,
      },
      skills: skills.map(s => ({
        name: s.skill_name,
        hash: s.skill_hash,
        signed_at: s.signed_at,
        source_url: s.source_url || undefined,
      })),
      total: skills.length,
    });

  } catch (error: any) {
    console.error('Get publisher skills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publisher skills', details: error.message },
      { status: 500 }
    );
  }
}
