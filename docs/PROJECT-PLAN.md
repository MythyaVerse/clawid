# CLAWID Launch Plan: Day 1 to 100 Users

**Ship Today. Get Users This Week.**

*February 2026*

---

## Executive Summary

**The Opportunity:** OpenClaw has 180,000+ GitHub stars. Moltbook hit 1.5M agents in days. Both ecosystems have a critical gap: trust and verification. There's already news about malicious skills (14 found on ClawHub), database breaches exposing all agent API keys, and prompt injection attacks.

**Our Wedge:** We don't compete with Moltbook's identity system—we extend it. We make agent actions, skill bundles, and policies verifiable. Enterprises need this before deploying agents at scale.

| OpenClaw Stars | Moltbook Agents | Database Breach |
|----------------|-----------------|-----------------|
| 180,000+       | 1.5 Million     | All Keys        |

**Our One-Liner:** "We turn agent actions, skill bundles, and policy configs into verifiable receipts—so you can prove what ran, who ran it, and what it was allowed to do."

> ⚠️ **CRITICAL: Integrity ≠ Safety**
>
> Never claim a verified skill is "safe." We verify INTEGRITY (bundle wasn't modified) and PROVENANCE (came from this publisher). We do NOT audit code for malware. Use "Publisher Verified" and "Integrity Verified" — never "Safe" or "Secure." This protects us from liability.

---

## Day 1: What We Ship TODAY

We ship ONE thing that solves a real, urgent problem: **OpenClaw Skill Verifier**.

This is the fastest path to adoption because:
- Malicious skills are already in the news (Tom's Hardware reported on crypto-stealing skills)
- OpenClaw's own docs say "treat third-party skills as untrusted code"
- ClawHub is an open registry—anyone can publish anything
- Doesn't require OpenClaw or Moltbook to change anything
- Skill authors WANT verification (legitimacy)

### Day 1 Deliverables (Ship by Tonight)

| Deliverable | Description | Time |
|-------------|-------------|------|
| Landing Page | Simple page: problem statement, waitlist signup, "coming today" badge | 1 hour |
| CLI Tool v0.1 | `clawid sign <skill-path>` and `clawid verify <skill-path>` | 3 hours |
| NPM Package | Publish to npm as `@clawid/cli` | 30 min |
| GitHub Repo | Open source, MIT license, good README with demo GIF | 1 hour |
| Launch Post | LinkedIn + X post announcing the tool | 30 min |

**Total Day 1 Time: ~6 hours**

---

## Day 1 Technical Specification

### Artifact Model: Hash the Zip, Not the Directory

ClawHub already provides skills as downloadable zips. Hash the zip bytes directly — this avoids all line-ending, symlink, and filesystem metadata issues.

```javascript
artifact.hash = sha256(zip_bytes) // NOT unpacked directory
```

**Why this is better:**
- No line-ending normalization debates
- No symlink edge cases
- No filesystem metadata differences across OS
- Verifiers can reproduce with basic tooling (sha256 + signature verify)

### CLI Commands

**1. Generate Identity (First-time setup)**
```bash
$ clawid init
```
Creates `~/.clawid/keypair.json` with Ed25519 keypair and DID

**2. Sign a Skill Bundle (zip)**
```bash
$ clawid sign ./email-reader-v1.2.0.zip
```
Computes SHA256 of zip bytes (not unpacked), signs with private key, outputs `.clawid-sig.json`

**3. Verify a Skill Bundle**
```bash
$ clawid verify ./email-reader-v1.2.0.zip
```
Checks: (1) signature valid, (2) hash matches zip bytes, (3) publisher identity proof if available. Outputs tiered result + exit code for CI.

### Signature File Format (.clawid-sig.json)

```json
{
  "version": "1.0",
  "signer": {
    "did": "did:key:z6Mk...",
    "proof": {
      "type": "github",
      "handle": "acme-corp",
      "gist": "https://gist.github.com/acme-corp/abc123"
    }
  },
  "artifact": {
    "type": "openclaw-skill-zip",
    "hash": "sha256:a1b2c3d4...",
    "filename": "email-reader-v1.2.0.zip"
  },
  "timestamp": "2026-02-02T10:30:00Z",
  "signature": "base64..."
}
```

### Tiered Verification (Critical for Credibility)

A malware author can sign their own malware. Crypto doesn't stop that. So we need two tiers:

| Tier | What It Means |
|------|---------------|
| ✅ Integrity Verified | Bundle matches signature. Offline check. Always available. |
| ✅ Publisher Verified | Signer identity proven via GitHub gist or domain (.well-known). Only shown if proof exists. |
| ⚠️ Unknown Publisher | Signature valid, but no identity proof. Integrity OK, but who signed it? |

**Publisher Proof Methods (v0.1):**
- **GitHub:** Publisher posts public key fingerprint in a gist. We verify the gist exists and matches.
- **Domain:** Publisher hosts `.well-known/clawid.json` on their domain with their public key.

### Verification Output

```
✅ PUBLISHER VERIFIED          ⚠️ UNKNOWN PUBLISHER         🚫 FAILED
Integrity: ✓                   Integrity: ✓                  Hash mismatch
Publisher: @acme-corp          Signer: did:key:z6Mk...       Expected: a1b2...
Proof: github.com/...          No identity proof             Got: x9y8...
(Not a safety audit)           Review code carefully         DO NOT INSTALL
```

### README FAQ (Add on Day 1)

**"Does verified mean safe?"**
No. Verified means integrity/provenance. You still review code.

**"Can attackers sign malware?"**
Yes — that's why we show WHO signed it and whether signer identity is proven.

**"What about dependencies / runtime downloads?"**
Out of scope for v0.1. Verification covers the published bundle, not what it might fetch later.

**"Why do I need this? Doesn't ClawHub moderate?"**
ClawHub uses reporting/moderation, but cryptographic provenance is a different layer.

---

## Week 1 Roadmap: Day-by-Day

### Day 1 (Monday) — Theme: SHIP
- Morning: Build CLI tool (sign + verify commands)
- Afternoon: Create landing page with waitlist
- Evening: Publish to npm, push to GitHub
- Night: Write and post launch announcement on LinkedIn + X
- **Goal:** Tool is live and downloadable

### Day 2 (Tuesday) — Theme: PUBLISHERS
- DM top 10 OpenClaw skill authors: "I'll help you sign your next release in 5 minutes"
- Create "Verified Publisher" onboarding guide (keypair generation + first signature)
- Blockchain partner: First post about ClawID to his network
- Publish list of first verified publishers (even if just 3-5)
- **Goal:** 5 publishers signing their own skills, first 20 users

### Day 3 (Wednesday) — Theme: INTEGRATE
- Build OpenClaw hook that auto-verifies skills on install
- Create "clawid wrap" command that wraps skill install
- Reach out to Peter Steinberger (OpenClaw creator) for potential partnership
- Your LinkedIn: Post demo video showing verification in action
- **Goal:** OpenClaw integration works, 30 users

### Day 4 (Thursday) — Theme: MOLTBOOK
- Build Moltbook identity binding (use their OAuth flow)
- Create verification page: verify.clawid.io/agent/<did>
- Generate shareable "verification receipts" agents can post to Moltbook
- Blockchain partner: Announce ERC-8004 alignment angle
- **Goal:** Moltbook integration demo, 50 users

### Day 5 (Friday) — Theme: PRESS
- Reach out to tech journalists covering OpenClaw/Moltbook
- Post on Hacker News: "Show HN: We built skill verification for OpenClaw"
- Post on Reddit: r/artificial, r/LocalLLaMA, r/OpenClaw (if exists)
- Both founders: LinkedIn posts about the security gap we're solving
- **Goal:** Press coverage interest, 70 users

### Day 6-7 (Weekend) — Theme: SCALE
- Launch public skill registry: registry.clawid.io
- Add "Browse Verified Skills" page
- Blockchain partner: Host Twitter Space about agent security + blockchain
- Collect user feedback, fix bugs, respond to GitHub issues
- **Goal:** 100+ users, public registry live

---

## User Acquisition: How We Get 100 Users

### Channel 1: OpenClaw Publishers (Target: 40 users)
- DM top 20 skill authors: "I'll help you sign your release in 5 minutes"
- Post in OpenClaw Discord announcing verification tool
- Create GitHub issue in OpenClaw repo proposing integration
- **Key:** Publishers sign THEIR OWN skills (you're infrastructure, not auditor)

### Channel 2: LinkedIn (Target: 30 users)
- Your company's existing presence—leverage it
- Post 1: "We shipped in 1 day" story (Day 1)
- Post 2: Demo video of verification (Day 3)
- Post 3: "Why agent security matters" thought leadership (Day 5)
- Blockchain partner cross-posts to his audience

### Channel 3: Crypto/Web3 Community (Target: 20 users)
- Your partner's network in India, Dubai, US
- Frame as: "Infrastructure for the agent economy"
- ERC-8004 alignment is a strong talking point
- Twitter Space / AMA about agent identity + blockchain

### Channel 4: Hacker News + Reddit (Target: 10 users)
- "Show HN" post on Day 5
- Focus on technical credibility, not hype
- Reddit posts in relevant subreddits

---

## Technical Architecture

### System Layers

| Layer | What It Does | Ships |
|-------|--------------|-------|
| 0: Bootstrap | Moltbook identity → ClawID DID binding | Day 4 |
| 1: Identity | Ed25519 keypairs, DIDs, key rotation, revocation | Day 1 |
| 2: Signed Artifacts | Skill/plugin signing and verification | Day 1 |
| 3: Audit Trail | Hash-chained logs, Merkle anchoring | Week 2 |
| 4: Claims | Verifiable credentials (operator, model, TEE) | Week 3 |
| 5: On-Chain | ERC-8004 registry, Merkle root anchoring | Week 4 |

### Integration Points

| Platform | Integration | What Exists Today |
|----------|-------------|-------------------|
| OpenClaw | Hook pack for audit + skill verification wrapper | Hooks API, ClawHub registry, Skills framework |
| Moltbook | Identity binding + verification receipts | Identity tokens, OAuth flow, SDK |
| ERC-8004 | Discovery registry + DID endpoint | Draft standard, ERC-721 based |

---

## Business Model

| Tier | Target | Offering | Price |
|------|--------|----------|-------|
| Free | Indie devs | CLI, SDK, basic DID, skill signing | $0 |
| Pro | Startups | Hosted verification, badges, dashboard, monitoring | $49-199/mo |
| Enterprise | Companies | Compliance bundles, audit export, SSO, SLA | $2-10k/mo |

### Revenue Trajectory
- Week 1-4: Free only (build user base)
- Month 2: Launch Pro tier ($49-199/mo)
- Month 3: First enterprise pilots
- Month 6: Target $10-20k MRR

---

## Success Metrics

### Week 1 Targets

| Metric | Target | Stretch |
|--------|--------|---------|
| CLI Downloads (npm) | 100 | 500 |
| GitHub Stars | 50 | 200 |
| Signed Skills | 20 | 50 |
| Waitlist Signups | 200 | 500 |
| LinkedIn Post Impressions | 5,000 | 20,000 |

---

## What We Don't Do (Scope Control)

To ship fast, we explicitly defer these to later:

| ❌ NOT Week 1 | ✅ Week 1 Focus |
|---------------|-----------------|
| Token / tokenomics | CLI that works |
| On-chain registry | Off-chain signing + verification |
| TEE attestation | Basic identity (keypairs) |
| Global reputation system | Import Moltbook reputation |
| Agent wallets / payments | Verification receipts |
| Solve human puppeteering | Solve impersonation + tampering |

**Key principle:** Ship something useful today. Add complexity later. The best way to validate the market is to have users.

---

## Appendix: Day 1 Checklist

Print this. Check items off as you go.

### Morning (Hours 1-3): Build CLI
- [ ] Create GitHub repo: clawid/clawid
- [ ] Initialize npm package
- [ ] Implement: `clawid init` (generate keypair)
- [ ] Implement: `clawid sign <path>`
- [ ] Implement: `clawid verify <path>`
- [ ] Test on a real OpenClaw skill from ClawHub

### Afternoon (Hours 4-5): Landing Page + Publish
- [ ] Create landing page (use Vercel/Netlify)
- [ ] Add waitlist signup (use Tally/Typeform)
- [ ] Write README with install instructions + demo GIF
- [ ] Add "NOT A SAFETY AUDIT" disclaimer in README (critical for liability)
- [ ] Publish to npm: `npm publish`
- [ ] Make GitHub repo public

### Evening (Hour 6): Launch
- [ ] Write LinkedIn post
- [ ] Write X/Twitter post
- [ ] Send to blockchain partner to amplify
- [ ] Post in OpenClaw Discord (if accessible)
- [ ] DM 5 OpenClaw skill authors offering to sign their skills

**Done? Celebrate. Then prep Day 2.**

---

*— End of Document —*
