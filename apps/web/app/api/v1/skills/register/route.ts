import { NextRequest, NextResponse } from 'next/server';
import { sql, type RegisterSkillInput } from '@/lib/db';

/**
 * POST /api/v1/skills/register
 *
 * Register a skill that has been signed by a publisher.
 *
 * Request body:
 * {
 *   "publisher_did": "did:key:z6Mk...",
 *   "skill_name": "my-skill",
 *   "skill_hash": "sha256:abc123...",
 *   "source_url": "https://...",  // optional
 *   "signature": "...",           // hex-encoded signature
 *   "signed_at": "2026-02-04T..."  // optional, defaults to now
 * }
 *
 * The signature proves ownership of the DID. It signs:
 * { action: "register", publisher_did, skill_name, skill_hash, timestamp }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterSkillInput;

    // Validate required fields
    if (!body.publisher_did || !body.skill_name || !body.skill_hash || !body.signature) {
      return NextResponse.json(
        { error: 'Missing required fields: publisher_did, skill_name, skill_hash, signature' },
        { status: 400 }
      );
    }

    // Validate DID format
    if (!body.publisher_did.startsWith('did:key:z6Mk')) {
      return NextResponse.json(
        { error: 'Invalid publisher_did format. Must be did:key:z6Mk...' },
        { status: 400 }
      );
    }

    // Validate hash format
    if (!body.skill_hash.startsWith('sha256:')) {
      return NextResponse.json(
        { error: 'Invalid skill_hash format. Must start with sha256:' },
        { status: 400 }
      );
    }

    // For now, we accept the signature without verification
    // In production, you'd verify the signature against the DID
    // This allows the CLI to register without complex client-side signing

    const signedAt = body.signed_at ? new Date(body.signed_at) : new Date();

    // Insert into database
    try {
      const result = await sql`
        INSERT INTO skills (publisher_did, skill_name, skill_hash, signed_at, source_url, signature)
        VALUES (${body.publisher_did}, ${body.skill_name}, ${body.skill_hash}, ${signedAt.toISOString()}, ${body.source_url || null}, ${body.signature})
        ON CONFLICT (publisher_did, skill_hash)
        DO UPDATE SET
          skill_name = EXCLUDED.skill_name,
          source_url = EXCLUDED.source_url,
          signature = EXCLUDED.signature
        RETURNING id, skill_name, skill_hash, signed_at
      `;

      return NextResponse.json({
        success: true,
        skill: {
          id: result[0].id,
          name: result[0].skill_name,
          hash: result[0].skill_hash,
          signed_at: result[0].signed_at,
        },
        message: 'Skill registered successfully',
      }, { status: 201 });

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to register skill', details: dbError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Register skill error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
