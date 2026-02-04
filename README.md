<p align="center">
  <img src="https://img.shields.io/npm/v/@clawid/cli?style=flat-square&color=667eea" alt="npm version">
  <img src="https://img.shields.io/github/license/MythyaVerse/clawid?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs welcome">
</p>

# ClawID

**Cryptographic verification for AI agent skills.** Prove integrity and provenance of skill bundles with Ed25519 signatures and decentralized identifiers (DIDs).

> **⚠️ NOT A SAFETY AUDIT** — ClawID verifies that a skill bundle hasn't been tampered with and identifies who signed it. It does NOT audit code for malware or security vulnerabilities.

## What's New in v0.3.0

### Shareable Verification Receipts
After verifying a skill on [clawid.dev/verify](https://clawid.dev/verify), click **"Copy Verification Link"** to share a URL that shows your verification result to others — no file upload required.

### Library API for Integration
Use ClawID programmatically in MCP servers, package managers, and other tools:

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
  // Proceed with installation
}
```

See the [CLI README](packages/cli/README.md#library-api) for full API documentation.

## Why ClawID?

AI agent ecosystems like OpenClaw and Moltbook are growing rapidly, but they face a critical trust gap:

- **Malicious skills** have already been found in public registries
- **No cryptographic verification** exists for skill bundles
- **Anyone can publish** skills without identity verification

ClawID solves this by providing:

- **Integrity verification** — Confirm skills haven't been tampered with (SHA256 + Ed25519)
- **Publisher identity** — Prove who signed the skill via GitHub or domain verification
- **CI/CD integration** — Exit codes for automated verification pipelines

## Features

| Feature | Description |
|---------|-------------|
| **Identity Generation** | Ed25519 keypairs with `did:key` format DIDs |
| **Skill Signing** | SHA256 hash + Ed25519 signature in JSON format |
| **Tiered Verification** | Publisher Verified / Unknown Publisher / Failed |
| **GitHub Identity Proof** | Verify publisher via public gist |
| **Domain Identity Proof** | Verify publisher via `.well-known/clawid.json` |
| **Remote Skill Verification** | Download and verify skills from URLs |
| **Web Verifier** | Browser-based verification at [clawid.dev/verify](https://clawid.dev/verify) |
| **Shareable Receipts** | Share verification results via URL (no re-upload needed) |
| **Library API** | Programmatic verification for MCP servers and tools |
| **Offline Mode** | Skip online proof verification with `--offline` |

## Quick Start

### Install

```bash
npm install -g @clawid/cli
# or use npx
npx @clawid/cli --help
```

### 1. Generate Identity

```bash
clawid init
```

Creates an Ed25519 keypair and DID at `~/.clawid/keypair.json`.

### 2. Sign a Skill

```bash
clawid sign my-skill.zip
```

Produces `my-skill.clawid-sig.json` with integrity hash and signature.

### 3. Verify a Skill

```bash
clawid verify my-skill.zip
```

Outputs verification status with colored tiered results.

## Publisher Identity Verification

For skills to show as "Publisher Verified", publishers must prove their identity:

### Option A: GitHub Gist

```bash
# Generate gist content
clawid proof github

# Create public gist at gist.github.com with the content
# Then add it to your identity:
clawid proof add github https://gist.github.com/username/gistid
```

### Option B: Domain (.well-known)

```bash
# Generate .well-known content
clawid proof domain example.com

# Host at https://example.com/.well-known/clawid.json
# Then add it:
clawid proof add domain https://example.com/.well-known/clawid.json
```

Once added, all your signatures will include the proof and verifiers can confirm your identity.

## CLI Commands

### Identity Management

| Command | Description |
|---------|-------------|
| `clawid init` | Generate new Ed25519 keypair and DID |
| `clawid init --force` | Overwrite existing identity |
| `clawid whoami` | Display current identity |

### Signing & Verification

| Command | Description |
|---------|-------------|
| `clawid sign <path.zip>` | Sign a skill bundle |
| `clawid sign <path> -o <output>` | Specify output path |
| `clawid verify <path.zip>` | Verify a signed skill |
| `clawid verify <path> --offline` | Skip online proof check |

### Identity Proofs

| Command | Description |
|---------|-------------|
| `clawid proof github` | Generate GitHub gist proof template |
| `clawid proof domain [domain]` | Generate .well-known proof template |
| `clawid proof add <type> <url>` | Add proof to identity |
| `clawid proof remove` | Remove proof from identity |
| `clawid proof show` | Show current proof configuration |

### Remote Skills

| Command | Description |
|---------|-------------|
| `clawid wrap install <url>` | Download, verify, and prepare skill |
| `clawid wrap install <url> --force` | Install even if unknown publisher |
| `clawid wrap verify <url>` | Download and verify (cleanup after) |

## Verification Tiers

| Tier | Icon | Meaning |
|------|------|---------|
| Publisher Verified | ✅ | Signature valid + identity proven via GitHub/domain |
| Integrity Verified | ✅ | Signature valid, proof skipped (offline mode) |
| Unknown Publisher | ⚠️ | Signature valid but identity not proven |
| Failed | 🚫 | Hash mismatch or invalid signature |

## Web Verification

Visit [clawid.dev/verify](https://clawid.dev/verify) to verify skills in your browser:

1. Upload the skill `.zip` file
2. Upload the `.clawid-sig.json` signature file
3. See instant verification results

All verification happens client-side — your files never leave your browser.

## Signature File Format

```json
{
  "version": "1.0",
  "signer": {
    "did": "did:key:z6Mk...",
    "publicKey": "fc931e2c...",
    "proof": {
      "type": "github",
      "handle": "username",
      "url": "https://gist.github.com/..."
    }
  },
  "artifact": {
    "type": "skill-bundle-zip",
    "hash": "sha256:a1b2c3d4...",
    "filename": "my-skill.zip",
    "size": 12345
  },
  "timestamp": "2026-02-03T10:30:00Z",
  "signature": "e1555fa4..."
}
```

## CI/CD Integration

ClawID returns exit codes for pipeline integration:

```bash
# In your CI pipeline
clawid verify skill.zip || exit 1
```

| Exit Code | Meaning |
|-----------|---------|
| `0` | Verification passed |
| `1` | Verification failed |

## Project Structure

```
clawid/
├── packages/
│   └── cli/                 # @clawid/cli npm package
│       ├── src/
│       │   ├── lib/
│       │   │   ├── identity.ts      # Keypair & DID generation
│       │   │   ├── signing.ts       # SHA256 + Ed25519 signing
│       │   │   ├── verification.ts  # Signature verification
│       │   │   ├── proof.ts         # Identity proof generation
│       │   │   ├── proof-verification.ts  # Online proof verification
│       │   │   └── wrap.ts          # Remote skill download
│       │   ├── api.ts       # Library API for programmatic use
│       │   └── index.ts     # CLI commands
│       └── package.json
├── apps/
│   └── web/                 # Next.js landing page + verifier
│       └── app/
│           ├── page.tsx     # Landing page
│           └── verify/      # Browser verification + shareable receipts
└── docs/                    # Documentation
```

## Security Model

ClawID provides **integrity and provenance** verification, not safety auditing:

| What ClawID Does | What ClawID Does NOT Do |
|------------------|------------------------|
| Verify bundle hash matches | Scan code for malware |
| Verify signature is valid | Audit for vulnerabilities |
| Verify publisher identity | Guarantee code safety |
| Detect tampering | Review code quality |

**Always review code from unknown publishers**, even if signatures are valid.

## Cryptographic Details

- **Key Generation**: Ed25519 via [@noble/ed25519](https://github.com/paulmillr/noble-ed25519)
- **Hashing**: SHA256 via [@noble/hashes](https://github.com/paulmillr/noble-hashes)
- **DID Format**: `did:key:z6Mk...` (multicodec 0xed01 + base58btc)
- **Signature Payload**: Deterministic JSON of `{did, hash, filename, timestamp}`

## FAQ

**Does verified mean safe?**
No. Verified means the bundle hasn't been tampered with and we know who signed it. Always review code from unknown publishers.

**Can attackers sign malware?**
Yes — that's why we show WHO signed it. Cryptographic signature proves integrity, not intent.

**What about dependencies?**
Out of scope. We verify the published bundle, not what it might download at runtime.

**Why DIDs instead of public keys?**
DIDs provide a standard, self-describing format that can be extended to support key rotation and multiple proof methods.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Clone the repo
git clone https://github.com/MythyaVerse/clawid.git
cd clawid

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## Links

- **Website**: [clawid.dev](https://clawid.dev)
- **npm**: [@clawid/cli](https://www.npmjs.com/package/@clawid/cli)
- **GitHub**: [MythyaVerse/clawid](https://github.com/MythyaVerse/clawid)

## License

MIT © [ClawID](https://clawid.dev)
