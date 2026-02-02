# SCRUM.md

## Sprint Overview

| Sprint | Theme | Duration | Status |
|--------|-------|----------|--------|
| Sprint 1 | Ship Day 1 MVP | Day 1 | ✅ Complete |
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
- [x] `clawid init` creates `~/.clawid/keypair.json`
- [x] Generates Ed25519 keypair
- [x] Creates DID in `did:key:z6Mk...` format
- [x] Shows public key and DID on success

---

#### US-2: CLI Skill Signing
**As a** skill author
**I want to** sign my skill bundle (zip)
**So that** users can verify its integrity

**Acceptance Criteria:**
- [x] `clawid sign <path.zip>` works
- [x] Computes SHA256 of zip bytes
- [x] Signs hash with Ed25519 private key
- [x] Outputs `.clawid-sig.json` alongside zip
- [x] Signature file follows spec format

---

#### US-3: CLI Skill Verification
**As a** skill user
**I want to** verify a signed skill bundle
**So that** I know it hasn't been tampered with

**Acceptance Criteria:**
- [x] `clawid verify <path.zip>` works
- [x] Checks signature validity
- [x] Verifies hash matches zip bytes
- [x] Shows tiered result (Integrity Verified / Unknown Publisher / Failed)
- [x] Returns correct exit code for CI (0=pass, 1=fail)

---

#### US-4: Landing Page
**As a** visitor
**I want to** see what ClawID does
**So that** I can decide to use it

**Acceptance Criteria:**
- [x] Landing page deployed to Vercel
- [x] Clear value proposition
- [x] Waitlist signup form
- [x] Link to GitHub repo
- [x] "NOT A SAFETY AUDIT" disclaimer visible

---

#### US-5: npm Package Published
**As a** developer
**I want to** install ClawID via npm
**So that** I can use it easily

**Acceptance Criteria:**
- [x] `@clawid/cli` published to npm
- [x] `npx @clawid/cli --help` works
- [x] README with install instructions
- [x] MIT license

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
| T11 | Add waitlist form (Tally) | US-4 | ✅ | Email form added |
| T12 | Deploy to Vercel | US-4 | ✅ | clawid.vercel.app |
| T13 | Build CLI for production | US-5 | ✅ | tsup build |
| T14 | Publish to npm | US-5 | ✅ | @clawid/cli@0.1.0 |
| T15 | Write README with demo | US-5 | ✅ | Full docs |

---

### Definition of Done (Sprint 1)

- [x] `clawid init` generates identity
- [x] `clawid sign ./test.zip` produces valid signature
- [x] `clawid verify ./test.zip` validates correctly
- [x] Landing page live at clawid.vercel.app
- [x] npm package installable via `npx @clawid/cli`
- [ ] Launch post written (LinkedIn + X) ← **YOUR ACTION**

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
| 1 | 15 | 15 | 15 |
| 2 | - | - | - |
| 3 | - | - | - |
| 4 | - | - | - |

---

*Last updated: 2026-02-02*
