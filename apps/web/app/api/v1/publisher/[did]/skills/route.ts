import { NextRequest, NextResponse } from 'next/server';
import { sql, type PublisherSkillsResponse } from '@/lib/db';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/publisher/:did/skills
 *
 * Get all skills registered by a publisher.
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

    // Try different query methods for debugging
    const exactMatch = await sql`
      SELECT skill_name, skill_hash, signed_at, source_url
      FROM skills
      WHERE publisher_did = ${did}
    `;

    // For now, we don't have identity verification integrated
    const identityVerified = false;

    // Return with debug info
    return NextResponse.json({
      debug: {
        queried_did: did,
        did_length: did.length,
        all_skills_in_db: allSkills,
        exact_match_count: exactMatch.length,
      },
      publisher: {
        did,
        identity_verified: identityVerified,
      },
      skills: exactMatch.map(s => ({
        name: s.skill_name,
        hash: s.skill_hash,
        signed_at: s.signed_at,
        source_url: s.source_url || undefined,
      })),
      total: exactMatch.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Get publisher skills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publisher skills', details: error.message },
      { status: 500 }
    );
  }
}
