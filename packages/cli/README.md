# @clawid/cli

Cryptographic verification for AI agent skills. Prove integrity and provenance of skill bundles with Ed25519 signatures.

> **⚠️ NOT A SAFETY AUDIT** — ClawID verifies that a skill hasn't been tampered with and identifies who signed it. It does NOT audit code for malware.

[![npm version](https://img.shields.io/npm/v/@clawid/cli?style=flat-square&color=667eea)](https://www.npmjs.com/package/@clawid/cli)
[![license](https://img.shields.io/github/license/MythyaVerse/clawid?style=flat-square)](https://github.com/MythyaVerse/clawid/blob/main/LICENSE)

## Installation

```bash
npm install -g @clawid/cli
# or
npx @clawid/cli
```

## Quick Start

### 1. Generate Your Identity

```bash
clawid init
```

Creates an Ed25519 keypair and DID at `~/.clawid/keypair.json`:

```
🔑 ClawID Identity Setup

✅ Identity created successfully!

   DID: did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ
   Public Key: fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8
```

### 2. Sign a Skill Bundle

```bash
clawid sign my-skill-v1.0.0.zip
```

Creates a `.clawid-sig.json` signature file alongside the zip.

### 3. Verify a Skill Bundle

```bash
clawid verify my-skill-v1.0.0.zip
```

Shows tiered verification result.

## Commands

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
| `clawid verify <path> -s <sig>` | Specify signature file |

### Identity Proofs

Prove your identity to show as "Publisher Verified":

| Command | Description |
|---------|-------------|
| `clawid proof github` | Generate GitHub gist proof template |
| `clawid proof domain [domain]` | Generate .well-known proof template |
| `clawid proof add <type> <url>` | Add proof to identity |
| `clawid proof remove` | Remove proof from identity |
| `clawid proof show` | Show current proof configuration |

**Example workflow:**

```bash
# Generate gist content
clawid proof github
# → Copy output to a public GitHub gist named clawid.json

# Add proof to your identity
clawid proof add github https://gist.github.com/yourname/abc123

# Now your signatures include the proof
clawid sign my-skill.zip
# → Verifiers will see "Publisher Verified"
```

### Remote Skills

Download and verify skills from URLs:

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

## Signature File Format

The `.clawid-sig.json` file contains:

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

## CI Integration

Exit codes for CI pipelines:

| Exit Code | Meaning |
|-----------|---------|
| `0` | Verification passed |
| `1` | Verification failed |

```bash
# In your CI pipeline
clawid verify skill.zip || exit 1
```

## FAQ

**Does verified mean safe?**
No. Verified means the bundle hasn't been tampered with and we know who signed it. Review code from unknown publishers.

**Can attackers sign malware?**
Yes — that's why we show WHO signed it. Signature proves integrity, not intent.

**What about dependencies?**
Out of scope. We verify the published bundle, not what it might download at runtime.

## Links

- **Website**: [clawid.vercel.app](https://clawid.vercel.app)
- **Web Verifier**: [clawid.vercel.app/verify](https://clawid.vercel.app/verify)
- **GitHub**: [MythyaVerse/clawid](https://github.com/MythyaVerse/clawid)

## License

MIT
