import { NextRequest, NextResponse } from 'next/server';
import { sql, type PublisherSkillsResponse } from '@/lib/db';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

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

    // Query skills for this publisher
    // Note: ORDER BY with parameterized WHERE clause causes issues in Neon serverless
    // Sorting in JavaScript as workaround
    const rawSkills = await sql`
      SELECT skill_name, skill_hash, signed_at, source_url
      FROM skills
      WHERE publisher_did = ${did}
    `;

    // Sort by signed_at DESC in JavaScript
    const skills = [...rawSkills].sort((a, b) =>
      new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime()
    );

    // For now, we don't have identity verification integrated
    // In the future, this could check against a verified publishers table
    const identityVerified = false;

    const response: PublisherSkillsResponse = {
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
    };

    return NextResponse.json(response, {
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
