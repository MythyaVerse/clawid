# AI-CONTEXT.md

## Project Snapshot
- **Purpose:** ClawID - Cryptographic verification for AI agent skills/plugins. Provides integrity and provenance verification (NOT safety audits).
- **Current State:** ✅ SPRINT 3 COMPLETE - Shareable receipts + library API
- **Key Entry Points:** `packages/cli/src/index.ts`, `packages/cli/src/api.ts`, `apps/web/app/page.tsx`, `apps/web/app/verify/page.tsx`

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
| npm | Package registry | ✅ Published | @clawid/cli@0.3.0 |
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
- **Status:** ✅ Connected (empty, ready for skill registry schema)

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
    - @clawid/cli@0.3.0 ready for npm publish

---

## HANDOFF (for the next agent)

### Current Objective
Sprint 3 COMPLETE. Shareable receipts and library API implemented.

### What Was Delivered (Sprint 3)
- ✅ **T37: Shareable Verification Receipt URLs**
  - `generateReceiptUrl()` creates shareable URL with verification data in hash
  - "Copy Verification Link" button appears after successful verification
  - Receipt mode displays when opening shared URL (shows saved result)
  - `parseReceiptFromUrl()` parses URL hash to restore receipt
  - 12 new tests for receipt URL generation/parsing

- ✅ **Library API for Hook Integration**
  - `packages/cli/src/api.ts` - clean entry point for programmatic use
  - `verifySkill(zipPath, sigPath, options)` - verify local files
  - `downloadAndVerify(url, sigUrl, options)` - download and verify remote
  - `canInstall` boolean added to VerificationResult
  - Types exported: VerificationResult, VerificationTier, VerifyOptions
  - Package exports updated in package.json
  - 13 new API tests
  - README updated with library usage documentation

### Key Files (Sprint 3)
- `apps/web/app/verify/receipt.ts` - receipt URL utilities
- `apps/web/app/verify/page.tsx` - updated with receipt mode UI
- `packages/cli/src/api.ts` - library API entry point
- `packages/cli/src/lib/verification.ts` - added proofVerified to error returns
- `packages/cli/README.md` - library API documentation

### Test Coverage
- `packages/cli/src/api.test.ts` - 13 tests (NEW)
- `packages/cli/src/lib/proof.test.ts` - 20 tests
- `packages/cli/src/lib/proof-verification.test.ts` - 13 tests
- `packages/cli/src/lib/wrap.test.ts` - 9 tests
- `apps/web/app/verify/verify.test.ts` - 22 tests (+12 new)
- **Total: 77 tests passing**

### Current Blockers
None - Sprint 3 complete, ready for deploy

### What to Do Next
1. [x] Deploy web app to Vercel - DONE (https://www.clawid.dev)
2. [x] Publish @clawid/cli@0.3.0 to npm - DONE
3. [ ] Test shareable receipt URLs on production

### Remaining Tasks (Sprint 4+)
- US-11: Key rotation and revocation (T38-T41)
- US-12: Supabase registry + /registry page (T42-T47)

### Verified Publisher Identity
- GitHub handle: `binarycache`
- DID: `did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ`
- Public key: `fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8`
- Proof gist: https://gist.github.com/binarycache/578dd0a913fd80e8c70ec9fd15d6659a

### Library API Usage Example
```typescript
import { verifySkill, downloadAndVerify } from '@clawid/cli';

// Verify local files
const result = await verifySkill('./skill.zip', './skill.clawid-sig.json');
if (result.canInstall) {
  console.log('Safe to install');
}

// Verify remote skill
const remote = await downloadAndVerify('https://example.com/skill.zip');
if (remote.canInstall) {
  // Install from remote.zipPath
}
```

### If Time Is Tight
Core functionality complete. Deploy and publish first, then test manually.
