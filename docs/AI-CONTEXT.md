# AI-CONTEXT.md

## Project Snapshot
- **Purpose:** ClawID - Cryptographic verification for AI agent skills/plugins. Provides integrity and provenance verification (NOT safety audits).
- **Current State:** SPRINT 1 - Building Day 1 MVP
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
(None yet)

## Operational Gotchas
- **NEVER claim "safe" or "secure"** - only "Integrity Verified" and "Publisher Verified"
- Plan says 180K stars but actual is ~63K (update marketing copy)

## Recent Changes / Decisions
- 2026-02-02:
  - Project initialized
  - Plan verified (ERC-8004, did:key confirmed valid)
  - Env files created
  - Awaiting logistics setup (GitHub, npm, Vercel)

---

## HANDOFF (for the next agent)

### Current Objective
Complete logistics setup, then create SCRUM.md and begin Sprint 1

### What I Changed
- Created `/docs/PROJECT-PLAN.md` (converted from docx)
- Created `/docs/AI-CONTEXT.md` (this file)
- Created `/.env.local` and `/apps/web/.env.local`
- Created `/.env.example` and `/.gitignore`
- Set up monorepo structure (pnpm workspace)
- Created `/packages/cli` - CLI tool skeleton
- Created `/apps/web` - Next.js landing page with test pages
- Linked Vercel project
- Verified npm token connectivity ✅

### Commands I Ran
- `git init` + `git remote add origin`
- `pnpm install` (all dependencies installed)
- `pnpm --filter @clawid/web dev` (dev server running on :3001)

### Current Blockers
Waiting for user:
1. ⬜ Create GITHUB_TOKEN (for gist verification)
2. ⬜ Create @clawid org on npm (for publishing)

### What to Do Next
1. [ ] User adds GITHUB_TOKEN to .env.local
2. [ ] User creates @clawid npm organization
3. [ ] Verify GitHub API test page passes
4. [ ] Push initial commit to GitHub
5. [ ] Create SCRUM.md with Sprint 1 tasks
6. [ ] Begin CLI implementation (init, sign, verify commands)

### If Time Is Tight, Do This First
Get GITHUB_TOKEN set - then we can push to GitHub and create SCRUM.md
