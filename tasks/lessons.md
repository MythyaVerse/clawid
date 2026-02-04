# Lessons Learned

## 2026-02-02: Vercel Monorepo Deployment

### Issue
Vercel deployment kept failing with 404 or "No Next.js detected" errors despite successful builds.

### Symptom
- Build logs showed successful compilation and static page generation
- But production URL returned 404 NOT_FOUND
- Or error "No Next.js version detected"

### Root Cause
For pnpm monorepos with Next.js in a subdirectory (apps/web):
1. Vercel's auto-detection couldn't find Next.js in root package.json
2. When Root Directory was set, dependencies weren't installed correctly because pnpm hoists them to workspace root

### Fix
Configure Vercel project settings:
1. **Root Directory:** `apps/web`
2. **Framework Preset:** `Next.js`
3. **Install Command:** `cd ../.. && pnpm install`

Also add `apps/web/vercel.json`:
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install"
}
```

### Prevention
For future pnpm monorepo projects:
- Always set Root Directory to the Next.js app folder in Vercel dashboard
- Always override Install Command to run from monorepo root
- Create vercel.json in the app directory specifying framework and install command
- Don't rely on vercel.json in repo root with `builds` array - it's deprecated

---

## 2026-02-02: Environment Variables in Monorepo

### Issue
Test pages showed env vars as "not set" even though .env.local existed.

### Root Cause
Next.js only loads .env.local from its own directory (apps/web), not from monorepo root.

### Fix
Copy or create .env.local in `apps/web/` directory, not just repo root.

### Prevention
For monorepos, always place .env.local in the Next.js app directory (apps/web/.env.local).

---

## 2026-02-04: Neon Serverless HTTP Client Truncates Results (CRITICAL)

### Issue
API endpoint `/api/v1/publisher/:did/skills` returned incomplete results. Database had 11 skills, but API only returned 9. New skill registrations showed "success" but didn't appear in queries.

### Symptom
- `POST /api/v1/skills/register` returned success
- Database queries via Neon MCP showed all rows present
- `GET /api/v1/publisher/:did/skills` returned fewer rows than expected
- Even `SELECT * FROM skills LIMIT 10000` only returned 9 of 11 rows

### Root Cause
The `neon()` function from `@neondatabase/serverless` creates an HTTP client that has a severe bug causing query results to be truncated. This affects:
- Simple SELECT queries without WHERE
- Queries with parameterized WHERE clauses
- Queries regardless of LIMIT value

The HTTP client silently drops rows without any error indication.

### Fix
Use `Pool` class instead of `neon()` function:

```typescript
// BAD - neon() HTTP client truncates results
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT * FROM skills`; // May only return 9 of 11 rows!

// GOOD - Pool uses WebSocket, returns all rows correctly
import { Pool } from '@neondatabase/serverless';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query('SELECT * FROM skills WHERE publisher_did = $1', [did]);
const skills = result.rows; // Returns all matching rows
```

### Prevention
- **NEVER** use `neon()` HTTP client for production queries that return multiple rows
- **ALWAYS** use `Pool` class for reliable query results
- Test with multiple rows in database to verify all are returned
- Add debug output temporarily (`allSkillsCount`, `rowCount`) to verify query completeness

### Debugging Approach Used
1. Added `_debug` field to API response showing `allSkillsCount` and `filteredCount`
2. Compared with direct Neon MCP queries to database
3. Found `neon()` returned 9 rows while database had 11
4. Switched to `Pool` - returned all 11 rows correctly

---
