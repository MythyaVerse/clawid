# SCRUM.md

## Sprint Overview

| Sprint | Theme | Duration | Status |
|--------|-------|----------|--------|
| Sprint 1 | Ship Day 1 MVP | Day 1 | 🏃 In Progress |
| Sprint 2 | Publishers & Integration | Days 2-3 | ⬜ Planned |
| Sprint 3 | Moltbook & Press | Days 4-5 | ⬜ Planned |
| Sprint 4 | Scale & Registry | Days 6-7 | ⬜ Planned |

---

## Sprint 1: Ship Day 1 MVP

**Goal:** Ship working CLI tool + landing page by end of day

### User Stories

#### US-1: CLI Identity Generation
**As a** skill author
**I want to** generate a ClawID identity
**So that** I can sign my skill bundles

**Acceptance Criteria:**
- [ ] `clawid init` creates `~/.clawid/keypair.json`
- [ ] Generates Ed25519 keypair
- [ ] Creates DID in `did:key:z6Mk...` format
- [ ] Shows public key and DID on success

---

#### US-2: CLI Skill Signing
**As a** skill author
**I want to** sign my skill bundle (zip)
**So that** users can verify its integrity

**Acceptance Criteria:**
- [ ] `clawid sign <path.zip>` works
- [ ] Computes SHA256 of zip bytes
- [ ] Signs hash with Ed25519 private key
- [ ] Outputs `.clawid-sig.json` alongside zip
- [ ] Signature file follows spec format

---

#### US-3: CLI Skill Verification
**As a** skill user
**I want to** verify a signed skill bundle
**So that** I know it hasn't been tampered with

**Acceptance Criteria:**
- [ ] `clawid verify <path.zip>` works
- [ ] Checks signature validity
- [ ] Verifies hash matches zip bytes
- [ ] Shows tiered result (Integrity Verified / Unknown Publisher / Failed)
- [ ] Returns correct exit code for CI (0=pass, 1=fail)

---

#### US-4: Landing Page
**As a** visitor
**I want to** see what ClawID does
**So that** I can decide to use it

**Acceptance Criteria:**
- [ ] Landing page deployed to Vercel
- [ ] Clear value proposition
- [ ] Waitlist signup form
- [ ] Link to GitHub repo
- [ ] "NOT A SAFETY AUDIT" disclaimer visible

---

#### US-5: npm Package Published
**As a** developer
**I want to** install ClawID via npm
**So that** I can use it easily

**Acceptance Criteria:**
- [ ] `@clawid/cli` published to npm
- [ ] `npx @clawid/cli --help` works
- [ ] README with install instructions
- [ ] MIT license

---

### Sprint 1 Backlog

| ID | Task | Story | Status | Notes |
|----|------|-------|--------|-------|
| T1 | Implement Ed25519 keypair generation | US-1 | ✅ | @noble/ed25519 |
| T2 | Implement DID generation (did:key) | US-1 | ✅ | Multibase encoding |
| T3 | Create ~/.clawid directory + save keypair | US-1 | ✅ | keypair.json |
| T4 | Implement SHA256 hashing of zip | US-2 | ✅ | Hash raw bytes |
| T5 | Implement Ed25519 signing | US-2 | ✅ | |
| T6 | Generate .clawid-sig.json output | US-2 | ✅ | Follows spec |
| T7 | Implement signature verification | US-3 | ✅ | |
| T8 | Implement hash verification | US-3 | ✅ | |
| T9 | Implement tiered output display | US-3 | ✅ | Colors, exit codes |
| T10 | Build landing page UI | US-4 | ✅ | Basic structure |
| T11 | Add waitlist form (Tally) | US-4 | ⬜ | |
| T12 | Deploy to Vercel | US-4 | ✅ | clawid.vercel.app |
| T13 | Build CLI for production | US-5 | ✅ | tsup build |
| T14 | Publish to npm | US-5 | ⬜ | @clawid/cli |
| T15 | Write README with demo | US-5 | ⬜ | Include GIF |

---

### Definition of Done (Sprint 1)

- [ ] `clawid init` generates identity
- [ ] `clawid sign ./test.zip` produces valid signature
- [ ] `clawid verify ./test.zip` validates correctly
- [ ] Landing page live at clawid.vercel.app
- [ ] npm package installable via `npx @clawid/cli`
- [ ] Launch post written (LinkedIn + X)

---

## Sprint 2: Publishers & Integration (Days 2-3)

**Goal:** Get 5 publishers signing their skills, OpenClaw integration

### Planned Stories
- Publisher onboarding guide
- GitHub gist identity proof verification
- OpenClaw hook for auto-verification
- `clawid wrap` command

---

## Sprint 3: Moltbook & Press (Days 4-5)

**Goal:** Moltbook identity binding, press outreach

### Planned Stories
- Moltbook OAuth integration
- Verification page (verify.clawid.io)
- Hacker News "Show HN" post
- Reddit posts

---

## Sprint 4: Scale & Registry (Days 6-7)

**Goal:** Public skill registry, 100 users

### Planned Stories
- Public registry (registry.clawid.io)
- Browse verified skills page
- Domain-based identity proof (.well-known)
- Twitter Space

---

## Velocity Tracking

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| 1 | 15 | 1 | - |
| 2 | - | - | - |
| 3 | - | - | - |
| 4 | - | - | - |

---

*Last updated: 2026-02-02*
