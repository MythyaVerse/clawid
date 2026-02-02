# @clawid/cli

Cryptographic verification for AI agent skills. Prove integrity and provenance of skill bundles.

> **⚠️ NOT A SAFETY AUDIT** - ClawID verifies that a skill bundle hasn't been tampered with and identifies who signed it. It does NOT audit code for malware or security vulnerabilities.

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

Generating Ed25519 keypair...
Saving to ~/.clawid/keypair.json...

✅ Identity created successfully!

   DID: did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ
   Public Key: fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8
```

### 2. Sign a Skill Bundle

```bash
clawid sign my-skill-v1.0.0.zip
```

Creates a `.clawid-sig.json` signature file:

```
📝 ClawID Skill Signing

   Input: my-skill-v1.0.0.zip

✅ Skill signed successfully!

   Hash: sha256:a1b2c3d4...
   Signer: did:key:z6Mk...
   Signature: my-skill-v1.0.0.clawid-sig.json
```

### 3. Verify a Skill Bundle

```bash
clawid verify my-skill-v1.0.0.zip
```

Shows verification result:

```
🔍 ClawID Skill Verification

⚠️ UNKNOWN PUBLISHER

   Integrity: ✓ Hash matches
   Signature: ✓ Valid
   Signer: did:key:z6Mk...
   Identity: ⚠ No proof (review code carefully)

   ⚠️  This is NOT a safety audit.
```

## Commands

| Command | Description |
|---------|-------------|
| `clawid init` | Generate a new ClawID identity |
| `clawid whoami` | Show current identity |
| `clawid sign <path.zip>` | Sign a skill bundle |
| `clawid verify <path.zip>` | Verify a signed skill bundle |

## Verification Tiers

| Tier | Meaning |
|------|---------|
| ✅ PUBLISHER VERIFIED | Signature valid + identity proven (via GitHub/domain) |
| ⚠️ UNKNOWN PUBLISHER | Signature valid but signer identity not proven |
| 🚫 FAILED | Hash mismatch or invalid signature - DO NOT INSTALL |

## Signature File Format

The `.clawid-sig.json` file contains:

```json
{
  "version": "1.0",
  "signer": {
    "did": "did:key:z6Mk...",
    "publicKey": "..."
  },
  "artifact": {
    "type": "skill-bundle-zip",
    "hash": "sha256:...",
    "filename": "my-skill-v1.0.0.zip",
    "size": 12345
  },
  "timestamp": "2026-02-02T10:30:00Z",
  "signature": "..."
}
```

## CI Integration

Exit codes for CI pipelines:
- `0` - Verification passed
- `1` - Verification failed

```bash
clawid verify skill.zip || exit 1
```

## FAQ

**Does verified mean safe?**
No. Verified means the bundle hasn't been tampered with and we know who signed it. You should still review code from unknown publishers.

**Can attackers sign malware?**
Yes - that's why we show WHO signed it. Signature proves integrity, not intent.

**What about dependencies?**
Out of scope. We verify the published bundle, not what it might download at runtime.

## Links

- Website: https://clawid.vercel.app
- GitHub: https://github.com/MythyaVerse/clawid

## License

MIT
