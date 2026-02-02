# AI-CONTEXT.md

## Project Snapshot
- **Purpose:** ClawID - Cryptographic verification for AI agent skills/plugins. Provides integrity and provenance verification (NOT safety audits).
- **Current State:** ✅ SPRINT 1 COMPLETE - Day 1 MVP shipped
- **Key Entry Points:** `packages/cli/src/index.ts`, `apps/web/app/page.tsx`

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
| `GITHUB_TOKEN` | Verify publisher gists | ⬜ Not set |
| `NPM_TOKEN` | Publish @clawid/cli | ✅ Set (binarycache-mv) |
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
| npm | Package registry | ✅ Connected | binarycache-mv + @clawid org |
| Vercel | Web hosting | ✅ Live | https://clawid.vercel.app |
| GitHub API | Gist verification | ⬜ Optional | For publisher identity proofs |
| Waitlist (Tally) | Signups | ⬜ Pending | - |

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
  - ✅ Sprint 1 COMPLETE:
    - CLI commands: init, sign, verify all working
    - npm package published: @clawid/cli@0.1.0
    - Landing page live: https://clawid.vercel.app
    - Waitlist form, feature cards, safety disclaimer deployed
  - Removed plan docs from GitHub (added to .gitignore)

---

## HANDOFF (for the next agent)

### Current Objective
Sprint 1 COMPLETE. Ready for Sprint 2 (Publishers & Integration)

### What Was Delivered (Sprint 1)
- ✅ `clawid init` - generates Ed25519 keypair + DID, saves to ~/.clawid/keypair.json
- ✅ `clawid sign <path.zip>` - SHA256 hash + Ed25519 signature → .clawid-sig.json
- ✅ `clawid verify <path.zip>` - tiered output (Publisher Verified / Unknown Publisher / Failed)
- ✅ Landing page live at https://clawid.vercel.app
- ✅ npm package published: @clawid/cli@0.1.0

### Key Files
- `packages/cli/src/lib/identity.ts` - keypair generation, DID encoding
- `packages/cli/src/lib/signing.ts` - hash + sign logic
- `packages/cli/src/lib/verification.ts` - verify logic + tiered output
- `apps/web/app/page.tsx` - landing page with waitlist
- `apps/web/vercel.json` - monorepo deployment config

### Current Blockers
None - Sprint 1 complete

### What to Do Next (Sprint 2)
1. [ ] User writes LinkedIn + X launch posts (manual action)
2. [ ] Publisher onboarding guide
3. [ ] GitHub gist identity proof verification
4. [ ] OpenClaw hook for auto-verification
5. [ ] `clawid wrap` command

### If Time Is Tight, Do This First
User: Write and post the launch announcement (LinkedIn + X)
