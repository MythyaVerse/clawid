import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { loadIdentity, signData, ClawIDIdentity } from './identity.js';

export interface SignatureFile {
  version: string;
  signer: {
    did: string;
    publicKey: string;
    proof?: {
      type: string;
      handle?: string;
      url?: string;
    };
  };
  artifact: {
    type: string;
    hash: string;
    filename: string;
    size: number;
  };
  timestamp: string;
  signature: string;
}

/**
 * Compute SHA256 hash of a file
 */
export async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  const hash = createHash('sha256').update(content).digest('hex');
  return `sha256:${hash}`;
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const content = await readFile(filePath);
  return content.length;
}

/**
 * Create signature data to be signed (deterministic JSON)
 */
function createSignaturePayload(
  did: string,
  hash: string,
  filename: string,
  timestamp: string
): string {
  // Create deterministic payload for signing
  const payload = {
    did,
    hash,
    filename,
    timestamp,
  };
  return JSON.stringify(payload);
}

/**
 * Sign a skill bundle (zip file)
 */
export async function signSkill(zipPath: string): Promise<SignatureFile> {
  // Verify file exists
  if (!existsSync(zipPath)) {
    throw new Error(`File not found: ${zipPath}`);
  }

  // Verify it's a zip file
  if (!zipPath.endsWith('.zip')) {
    throw new Error('Only .zip files can be signed');
  }

  // Load identity
  const identity = await loadIdentity();
  if (!identity) {
    throw new Error('No identity found. Run `clawid init` first.');
  }

  // Hash the zip file
  const hash = await hashFile(zipPath);
  const size = await getFileSize(zipPath);
  const filename = basename(zipPath);
  const timestamp = new Date().toISOString();

  // Create payload and sign
  const payload = createSignaturePayload(identity.did, hash, filename, timestamp);
  const payloadBytes = new TextEncoder().encode(payload);
  const signature = await signData(payloadBytes, identity.privateKey);

  // Create signature file
  const sigFile: SignatureFile = {
    version: '1.0',
    signer: {
      did: identity.did,
      publicKey: identity.publicKey,
    },
    artifact: {
      type: 'skill-bundle-zip',
      hash,
      filename,
      size,
    },
    timestamp,
    signature,
  };

  // Include proof if identity has one
  if (identity.proof) {
    sigFile.signer.proof = {
      type: identity.proof.type,
      handle: identity.proof.handle,
      url: identity.proof.url,
    };
    if (identity.proof.domain) {
      sigFile.signer.proof.handle = identity.proof.domain;
    }
  }

  return sigFile;
}

/**
 * Get the signature file path for a given zip file
 */
export function getSignatureFilePath(zipPath: string): string {
  const dir = dirname(zipPath);
  const base = basename(zipPath, '.zip');
  return join(dir, `${base}.clawid-sig.json`);
}

/**
 * Save signature file
 */
export async function saveSignature(
  sigFile: SignatureFile,
  outputPath: string
): Promise<void> {
  await writeFile(outputPath, JSON.stringify(sigFile, null, 2), 'utf-8');
}

/**
 * Load signature file
 */
export async function loadSignature(sigPath: string): Promise<SignatureFile | null> {
  if (!existsSync(sigPath)) {
    return null;
  }
  const content = await readFile(sigPath, 'utf-8');
  return JSON.parse(content) as SignatureFile;
}
