# AI-CONTEXT.md

## Project Snapshot
- **Purpose:** ClawID - Cryptographic verification for AI agent skills/plugins. Provides integrity and provenance verification (NOT safety audits).
- **Current State:** ✅ SPRINT 2 COMPLETE - Full publisher verification working
- **Key Entry Points:** `packages/cli/src/index.ts`, `apps/web/app/page.tsx`, `apps/web/app/verify/page.tsx`

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
| npm | Package registry | ✅ Published | @clawid/cli@0.2.0 |
| Vercel | Web hosting | ✅ Live | https://clawid.dev |
| GitHub API | Gist verification | ✅ Working | GITHUB_TOKEN configured |
| Waitlist (Tally) | Signups | ✅ Configured | Email form on landing page |

## Database
- **Day 1:** No database needed (CLI is local-only)
- **Week 2+:** Supabase for skill registry

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

---

## HANDOFF (for the next agent)

### Current Objective
Sprint 2 COMPLETE. All P0+P1 tasks deployed and E2E tested.

### What Was Delivered (Sprint 2)
- ✅ `clawid proof github` - generates gist content template
- ✅ `clawid proof domain [domain]` - generates .well-known content
- ✅ `clawid proof add <type> <url>` - adds proof to identity
- ✅ `clawid proof remove/show` - manage identity proofs
- ✅ GitHub gist verification - fetches gist via API, validates DID match
- ✅ Domain proof verification - fetches .well-known/clawid.json
- ✅ `clawid verify --offline` - skip online proof check
- ✅ `clawid wrap install <url>` - download + verify + prepare for install
- ✅ `clawid wrap verify <url>` - download + verify + cleanup
- ✅ Web /verify page - browser-based verification with drag-drop upload
- ✅ @clawid/cli@0.2.0 published to npm
- ✅ Deployed to Vercel at https://clawid.dev
- ✅ Real GitHub gist created and tested: https://gist.github.com/binarycache/578dd0a913fd80e8c70ec9fd15d6659a

### Key Files
- `packages/cli/src/lib/proof.ts` - proof generation and parsing
- `packages/cli/src/lib/proof-verification.ts` - online proof verification
- `packages/cli/src/lib/wrap.ts` - remote skill download/verify
- `apps/web/app/verify/page.tsx` - browser verification page

### Test Coverage
- `packages/cli/src/lib/proof.test.ts` - 20 tests
- `packages/cli/src/lib/proof-verification.test.ts` - 13 tests
- `packages/cli/src/lib/wrap.test.ts` - 9 tests
- `apps/web/app/verify/verify.test.ts` - 10 tests
- **Total: 52 tests passing**

### Current Blockers
None - All P0+P1 tasks complete and deployed

### What to Do Next (USER ACTIONS)
1. [ ] Write launch post (LinkedIn + X)
2. [ ] Promote to early adopters for real-world testing
3. [ ] Gather feedback for Sprint 3 priorities

### Remaining P2 Tasks (Optional - Sprint 3+)
- T37: Shareable verification receipt URLs
- US-11: Key rotation and revocation (T38-T41)
- US-12: Supabase registry + /registry page (T42-T47)

### Verified Publisher Identity
- GitHub handle: `binarycache`
- DID: `did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ`
- Public key: `fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8`
- Proof gist: https://gist.github.com/binarycache/578dd0a913fd80e8c70ec9fd15d6659a

### If Time Is Tight
The core product is complete. Focus on marketing and user acquisition.
