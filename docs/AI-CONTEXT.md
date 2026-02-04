# AI-CONTEXT.md

## Project Snapshot
- **Purpose:** ClawID - Cryptographic verification for AI agent skills/plugins. Provides integrity and provenance verification (NOT safety audits).
- **Current State:** ✅ SPRINT 4 COMPLETE - Publisher Skill Registry + CLI auto-register
- **Key Entry Points:** `packages/cli/src/index.ts`, `packages/cli/src/api.ts`, `apps/web/app/page.tsx`, `apps/web/app/verify/page.tsx`, `apps/web/app/api/v1/`

## How to Run
- **Install:** `pnpm install`
- **Dev (web):** `pnpm --filter @clawid/web dev`
- **Dev (cli):** `pnpm --filter @clawid/cli dev`
- **Build:** `pnpm build`
- **Test:** `pnpm test`
- **Lint/Format:** `pnpm lint`

## Environment & Configuration

### Required Env Vars (Day 1)
| Variable | Purpose | Status |
|----------|---------|--------|
| `GITHUB_TOKEN` | Verify publisher gists | ✅ Set |
| `NPM_TOKEN` | Publish @clawid/cli | ✅ Set (automation token) |
| `NODE_ENV` | Environment flag | ✅ Set (development) |
| `NEXT_PUBLIC_APP_URL` | Web app URL | ✅ Set (localhost:3000) |

### Optional Env Vars
| Variable | Purpose | Status |
|----------|---------|--------|
| `VERCEL_TOKEN` | Programmatic deploys | ⬜ Not set |

### Future (Week 2+)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## External Services Status

| Service | Purpose | Status | Account |
|---------|---------|--------|---------|
| GitHub | Code hosting | ✅ Ready | MythyaVerse/clawid |
| npm | Package registry | ✅ Published | @clawid/cli@0.4.1 |
| Vercel | Web hosting | ✅ Live | https://clawid.dev |
| GitHub API | Gist verification | ✅ Working | GITHUB_TOKEN configured |
| Waitlist (Tally) | Signups | ✅ Configured | Email form on landing page |
| Neon | PostgreSQL database | ✅ Connected | wild-fire-23032082 (clawid) |

## Database
- **Provider:** Neon Serverless Postgres
- **Project:** clawid (wild-fire-23032082)
- **Database:** neondb
- **Branch:** production (br-ancient-base-ahc68cp4)
- **Region:** aws-us-east-1
- **PostgreSQL:** v17
- **Status:** ✅ Connected with skill registry schema

### Schema
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  publisher_did VARCHAR(255) NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  skill_hash VARCHAR(100) NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url TEXT,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publisher_did, skill_hash)
);
```

## Repo Structure (Planned)
```
clawid/
├── packages/
│   └── cli/                 # @clawid/cli npm package
│       ├── src/
│       │   ├── commands/    # init, sign, verify
│       │   ├── lib/         # crypto, did, verification
│       │   └── index.ts
│       └── package.json
├── apps/
│   └── web/                 # Landing page (Next.js)
│       ├── app/
│       │   ├── page.tsx     # Landing
│       │   └── test/        # Connectivity tests
│       └── package.json
├── docs/
│   ├── PROJECT-PLAN.md      # Original plan
│   ├── AI-CONTEXT.md        # This file
│   ├── ARCHITECTURE.md      # TBD
│   ├── SCRUM.md             # TBD (after logistics)
│   └── TESTING.md           # TBD
├── .env.local               # Local secrets
├── .env.example             # Template
├── .gitignore
├── package.json             # Monorepo root
├── pnpm-workspace.yaml
└── CLAUDE.md                # AI instructions
```

## Known Issues and Fixes

### Vercel Monorepo Deployment
- **Symptom:** "No Next.js version detected" or 404 errors on production
- **Cause:** Vercel default assumes root is the app; monorepo has apps/web subdirectory
- **Fix:** Set Root Directory to `apps/web` in Vercel dashboard + add vercel.json with `installCommand: "cd ../.. && pnpm install"`
- **Prevention:** Always configure Root Directory for monorepo deployments

### npm 2FA Publishing
- **Symptom:** 403 error "2FA required" when publishing
- **Cause:** npm Publish tokens require 2FA by default
- **Fix:** Create Automation token type OR enable "Require two-factor authentication for write" bypass
- **Prevention:** Use Automation tokens for CI/CD publishing

### Neon Serverless HTTP Client Bug (CRITICAL)
- **Symptom:** The `neon()` HTTP client truncates query results, returning fewer rows than exist in the database
- **Cause:** Bug in @neondatabase/serverless HTTP client (the `neon()` function)
- **Fix:** Use `Pool` class instead of `neon()` function for reliable results
- **Prevention:** Always use Pool-based connections for any queries that return multiple rows
- **Example:**
  ```typescript
  // BAD - neon() HTTP client truncates results
  import { neon } from '@neondatabase/serverless';
  const sql = neon(process.env.DATABASE_URL);
  const skills = await sql`SELECT * FROM skills WHERE did = ${did}`;
  // May only return 9 rows when database has 11!

  // GOOD - Pool uses WebSocket, returns all rows correctly
  import { Pool } from '@neondatabase/serverless';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT * FROM skills WHERE publisher_did = $1', [did]);
  const skills = result.rows;
  // Returns all matching rows reliably
  ```

## Operational Gotchas
- **NEVER claim "safe" or "secure"** - only "Integrity Verified" and "Publisher Verified"
- Plan says 180K stars but actual is ~63K (update marketing copy)

## Recent Changes / Decisions
- 2026-02-02:
  - Project initialized
  - Plan verified (ERC-8004, did:key confirmed valid)
  - Env files created
  - ✅ Sprint 1 COMPLETE
  - Removed plan docs from GitHub (added to .gitignore)

- 2026-02-03:
  - ✅ Sprint 2 COMPLETE:
    - `clawid proof github/domain/add/remove/show` commands
    - GitHub gist proof verification (fetches and validates)
    - Domain .well-known proof verification
    - `--offline` flag for verification
    - `clawid wrap install/verify` commands for remote skills
    - Web verification page at /verify (browser-side crypto)
    - 52 tests passing (42 CLI + 10 web)
    - Published @clawid/cli@0.2.0 to npm
    - Deployed to Vercel at https://clawid.dev
    - Created real GitHub gist: https://gist.github.com/binarycache/578dd0a913fd80e8c70ec9fd15d6659a
    - E2E publisher verification tested successfully (shows "Publisher Verified (github: @binarycache)")

- 2026-02-04:
  - ✅ Sprint 3 COMPLETE:
    - T37: Shareable verification receipt URLs on /verify page
    - Copy Verification Link button after successful verification
    - Receipt mode displays saved result when opened via shared URL
    - Library API: `verifySkill()` and `downloadAndVerify()` functions exported
    - `canInstall` boolean added to verification results
    - API documented in README with usage examples
    - 77 tests passing (55 CLI + 22 web)
    - @clawid/cli@0.3.0 published to npm

  - ✅ Sprint 4 COMPLETE:
    - Publisher Skill Registry with Neon database
    - POST /api/v1/skills/register endpoint (register signed skills)
    - GET /api/v1/publisher/:did/skills endpoint (query publisher skills)
    - CLI `--register` flag for auto-registration after signing
    - CLI standalone `register` command
    - Registry client in `packages/cli/src/lib/registry.ts`
    - @clawid/cli@0.4.0 published to npm
    - Deployed to production at https://clawid.dev
    - **Bug fix:** Neon serverless ORDER BY with parameterized WHERE returns empty results
      - Root cause: Unknown bug in @neondatabase/serverless driver
      - Fix: Sort results in JavaScript instead of SQL
      - Documented in Known Issues section

---

## HANDOFF (for the next agent)

### Current Objective
Sprint 4 COMPLETE. Publisher Skill Registry fully operational after fixing critical Neon bug.

### What Was Delivered (Sprint 4)
- ✅ **Database Schema**
  - `skills` table in Neon with publisher_did, skill_name, skill_hash, signature
  - UNIQUE constraint on (publisher_did, skill_hash) allows re-registration

- ✅ **API Endpoints**
  - `POST /api/v1/skills/register` - register signed skills
  - `GET /api/v1/publisher/:did/skills` - query all skills by publisher
  - **CRITICAL FIX:** Switched from `neon()` HTTP client to `Pool` WebSocket connection

- ✅ **CLI Integration**
  - `--register` flag on `sign` command
  - Auto-prompt after signing (unless `--no-register-prompt`)
  - Standalone `register` command for previously signed skills
  - Registry client in `packages/cli/src/lib/registry.ts`

### Key Files (Sprint 4)
- `apps/web/lib/db.ts` - Neon database client
- `apps/web/app/api/v1/skills/register/route.ts` - registration endpoint
- `apps/web/app/api/v1/publisher/[did]/skills/route.ts` - query endpoint
- `packages/cli/src/lib/registry.ts` - CLI registry client
- `packages/cli/src/index.ts` - updated with register commands

### Test Coverage
- `packages/cli/src/api.test.ts` - 13 tests
- `packages/cli/src/lib/proof.test.ts` - 20 tests
- `packages/cli/src/lib/proof-verification.test.ts` - 13 tests
- `packages/cli/src/lib/wrap.test.ts` - 9 tests
- `apps/web/app/verify/verify.test.ts` - 22 tests
- **Total: 77 tests passing**

### Current Blockers
None - Sprint 4 complete

### What to Do Next
1. [ ] Consider adding web UI for browsing publisher skills
2. [ ] Key rotation and revocation (US-11)

### Release Protocol
**IMPORTANT:** Before any future releases, follow the Release Checklist in `docs/SCRUM.md`.
All E2E testing must pass before marking a release complete.

### API Examples
```bash
# Register a skill
curl -X POST https://clawid.dev/api/v1/skills/register \
  -H "Content-Type: application/json" \
  -d '{
    "publisher_did": "did:key:z6Mk...",
    "skill_name": "my-skill",
    "skill_hash": "sha256:abc123...",
    "signature": "..."
  }'

# Query publisher skills
curl https://clawid.dev/api/v1/publisher/did%3Akey%3Az6Mk.../skills
```

### Verified Publisher Identity
- GitHub handle: `binarycache`
- DID: `did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ`
- Public key: `fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8`
- Proof gist: https://gist.github.com/binarycache/578dd0a913fd80e8c70ec9fd15d6659a

### If Time Is Tight
Core functionality complete. @clawid/cli@0.4.0 published and live.
