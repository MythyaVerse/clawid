# SCRUM.md

## Sprint Overview

| Sprint | Theme | Duration | Status |
|--------|-------|----------|--------|
| Sprint 1 | Ship Day 1 MVP | Day 1 | ✅ Complete |
| Sprint 2 | Development Consolidation | Days 2-7 | ⬜ Ready |

> **Note:** Marketing/outreach tasks deferred. Moltbook integration deferred (service unavailable).

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
| T12 | Deploy to Vercel | US-4 | ✅ | clawid.dev |
| T13 | Build CLI for production | US-5 | ✅ | tsup build |
| T14 | Publish to npm | US-5 | ✅ | @clawid/cli@0.1.0 |
| T15 | Write README with demo | US-5 | ✅ | Full docs |

---

### Definition of Done (Sprint 1)

- [x] `clawid init` generates identity
- [x] `clawid sign ./test.zip` produces valid signature
- [x] `clawid verify ./test.zip` validates correctly
- [x] Landing page live at clawid.dev
- [x] npm package installable via `npx @clawid/cli`
- [ ] Launch post written (LinkedIn + X) ← **YOUR ACTION**

---

## Sprint 2: Development Consolidation

**Goal:** Complete all development features - publisher verification, CLI enhancements, and web verification tools

---

### US-6: GitHub Identity Proof Verification
**As a** skill user
**I want to** verify a publisher's identity via their GitHub gist
**So that** I know the signer is who they claim to be

**Acceptance Criteria:**
- [ ] `clawid verify` checks for `proof.type: "github"` in signature file
- [ ] Fetches gist from GitHub API and validates DID/public key match
- [ ] Shows "✅ PUBLISHER VERIFIED" with GitHub handle when proof valid
- [ ] Shows "⚠️ UNKNOWN PUBLISHER" when no proof or proof invalid
- [ ] Works offline (skip proof check) with `--offline` flag

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T16 | Add GitHub gist fetching to verification | ⬜ | Use GITHUB_TOKEN |
| T17 | Parse gist content and extract DID/public key | ⬜ | Expected format TBD |
| T18 | Compare gist DID with signature signer DID | ⬜ | |
| T19 | Update tiered output for publisher verified | ⬜ | Green + handle |
| T20 | Add `--offline` flag to skip proof verification | ⬜ | |

---

### US-7: Domain-Based Identity Proof (.well-known)
**As a** publisher with a domain
**I want to** prove my identity via .well-known/clawid.json
**So that** users can verify I control the domain

**Acceptance Criteria:**
- [ ] `clawid verify` checks for `proof.type: "domain"` in signature file
- [ ] Fetches `https://{domain}/.well-known/clawid.json`
- [ ] Validates DID/public key match
- [ ] Shows "✅ PUBLISHER VERIFIED" with domain when proof valid

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T21 | Add domain proof type to verification | ⬜ | |
| T22 | Fetch .well-known/clawid.json from domain | ⬜ | HTTPS only |
| T23 | Parse and validate domain proof format | ⬜ | |
| T24 | Update tiered output for domain verified | ⬜ | Show domain |

---

### US-8: Publisher Identity Proof Creation
**As a** skill publisher
**I want to** create an identity proof (GitHub gist or domain file)
**So that** my signatures show as "Publisher Verified"

**Acceptance Criteria:**
- [ ] `clawid proof github` generates gist content to copy/paste
- [ ] `clawid proof domain` generates .well-known/clawid.json content
- [ ] `clawid proof add <type> <url>` adds proof to keypair.json
- [ ] Proof info included in subsequent signatures

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T25 | Implement `clawid proof github` command | ⬜ | Output gist template |
| T26 | Implement `clawid proof domain` command | ⬜ | Output JSON template |
| T27 | Implement `clawid proof add` command | ⬜ | Updates keypair.json |
| T28 | Include proof in signature file when signing | ⬜ | Auto-include from keypair |

---

### US-9: Wrap Command for Skill Installation
**As a** skill user
**I want to** install a skill with automatic verification
**So that** I don't accidentally install tampered skills

**Acceptance Criteria:**
- [ ] `clawid wrap install <skill-url>` downloads and verifies before installing
- [ ] Blocks installation if verification fails
- [ ] Shows verification result before proceeding
- [ ] Supports `--force` to install despite unknown publisher (with warning)

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T29 | Implement `clawid wrap` command structure | ⬜ | |
| T30 | Download skill zip from URL | ⬜ | Support ClawHub URLs |
| T31 | Auto-detect and fetch signature file | ⬜ | Same URL + .clawid-sig.json |
| T32 | Run verification before install | ⬜ | Block on failure |
| T33 | Add `--force` flag for unknown publishers | ⬜ | Warning message |

---

### US-10: Web Verification Page
**As a** user
**I want to** verify a skill via a web interface
**So that** I can check signatures without installing the CLI

**Acceptance Criteria:**
- [ ] Page at `/verify` accepts file upload (zip + signature)
- [ ] Shows verification result with same tiered output as CLI
- [ ] Displays signer DID, hash, timestamp
- [ ] Works entirely client-side (no server-side secrets)

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T34 | Create /verify page with file upload UI | ⬜ | Drag-drop support |
| T35 | Port verification logic to browser (WebCrypto) | ⬜ | Or use @noble/ed25519 |
| T36 | Display verification results | ⬜ | Match CLI output style |
| T37 | Add shareable verification receipt URL | ⬜ | Hash in URL params |

---

### US-11: Key Management (Rotation & Revocation)
**As a** publisher
**I want to** rotate or revoke my keys
**So that** I can recover from compromise or change identity

**Acceptance Criteria:**
- [ ] `clawid rotate` generates new keypair, archives old one
- [ ] `clawid revoke` marks current key as revoked
- [ ] Old signatures remain verifiable with archived keys
- [ ] Revoked keys show warning during verification

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T38 | Implement key rotation with archival | ⬜ | ~/.clawid/archived/ |
| T39 | Implement key revocation marker | ⬜ | revoked.json |
| T40 | Update verification to check revocation | ⬜ | Warning if revoked |
| T41 | Document key rotation process | ⬜ | In README |

---

### US-12: Skill Registry (Database Backend)
**As a** user
**I want to** browse verified skills in a public registry
**So that** I can discover trusted skills

**Acceptance Criteria:**
- [ ] Supabase database stores skill signatures
- [ ] `clawid publish` uploads signature to registry
- [ ] `/registry` page shows list of verified skills
- [ ] Filter by publisher, search by name

**Tasks:**
| ID | Task | Status | Notes |
|----|------|--------|-------|
| T42 | Set up Supabase project | ⬜ | Create tables |
| T43 | Design registry schema (skills, publishers, signatures) | ⬜ | |
| T44 | Create `/test/supabase` connectivity test | ⬜ | Per protocol |
| T45 | Implement `clawid publish` command | ⬜ | Upload to registry |
| T46 | Build `/registry` page with skill list | ⬜ | SSR from Supabase |
| T47 | Add search and filter functionality | ⬜ | |

---

### Sprint 2 Backlog Summary

| ID | Task | Story | Priority | Status |
|----|------|-------|----------|--------|
| T16 | GitHub gist fetching | US-6 | P0 | ✅ |
| T17 | Parse gist DID/key | US-6 | P0 | ✅ |
| T18 | Compare gist DID with signer | US-6 | P0 | ✅ |
| T19 | Update tiered output | US-6 | P0 | ✅ |
| T20 | Add --offline flag | US-6 | P1 | ✅ |
| T21 | Domain proof type | US-7 | P1 | ✅ |
| T22 | Fetch .well-known | US-7 | P1 | ✅ |
| T23 | Validate domain proof | US-7 | P1 | ✅ |
| T24 | Domain verified output | US-7 | P1 | ✅ |
| T25 | `proof github` command | US-8 | P0 | ✅ |
| T26 | `proof domain` command | US-8 | P1 | ✅ |
| T27 | `proof add` command | US-8 | P0 | ✅ |
| T28 | Include proof in signature | US-8 | P0 | ✅ |
| T29 | `wrap` command structure | US-9 | P1 | ✅ |
| T30 | Download skill zip | US-9 | P1 | ✅ |
| T31 | Fetch signature file | US-9 | P1 | ✅ |
| T32 | Verify before install | US-9 | P1 | ✅ |
| T33 | --force flag | US-9 | P2 | ✅ |
| T34 | /verify page UI | US-10 | P1 | ✅ |
| T35 | Browser verification logic | US-10 | P1 | ✅ |
| T36 | Verification results display | US-10 | P1 | ✅ |
| T37 | Shareable receipt URL | US-10 | P2 | ⬜ |
| T38 | Key rotation | US-11 | P2 | ⬜ |
| T39 | Key revocation | US-11 | P2 | ⬜ |
| T40 | Revocation check | US-11 | P2 | ⬜ |
| T41 | Key rotation docs | US-11 | P2 | ⬜ |
| T42 | Supabase setup | US-12 | P2 | ⬜ |
| T43 | Registry schema | US-12 | P2 | ⬜ |
| T44 | Supabase test page | US-12 | P2 | ⬜ |
| T45 | `clawid publish` | US-12 | P2 | ⬜ |
| T46 | /registry page | US-12 | P2 | ⬜ |
| T47 | Search/filter | US-12 | P2 | ⬜ |

**Priority Legend:** P0 = Must have, P1 = Should have, P2 = Nice to have

---

### Definition of Done (Sprint 2)

- [x] GitHub identity proof verification working
- [x] `clawid proof github` generates valid proof template
- [ ] At least one real publisher has "Publisher Verified" status (needs real gist)
- [x] Web verification page functional at /verify
- [x] All P0 and P1 tasks complete

---

### Deferred (Not in Sprint 2)

| Feature | Reason |
|---------|--------|
| Moltbook OAuth integration | Service unavailable |
| OpenClaw hook integration | Requires publisher adoption first |
| On-chain registry (ERC-8004) | Week 4+ per plan |
| TEE attestation | Future scope |
| US-11: Key rotation/revocation | P2 priority |
| US-12: Supabase registry | P2 priority |

---

## Velocity Tracking

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| 1 | 15 | 15 | 15 |
| 2 | 32 | 21 (P0+P1) | 21 |

---

*Last updated: 2026-02-03*
