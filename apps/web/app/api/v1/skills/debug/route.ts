import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * GET /api/v1/skills/debug
 * Debug endpoint to check database connection
 */
export async function GET() {
  try {
    // Get all skills
    const skills = await sql`SELECT id, publisher_did, skill_name FROM skills LIMIT 10`;

    return NextResponse.json({
      connected: true,
      database_url_set: !!process.env.DATABASE_URL,
      skills_count: skills.length,
      skills: skills,
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message,
      database_url_set: !!process.env.DATABASE_URL,
    }, { status: 500 });
  }
}
