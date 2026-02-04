import { existsSync } from 'fs';
import { hashFile, loadSignature, SignatureFile } from './signing.js';
import { verifySignature } from './identity.js';
import { verifyProof, type ProofVerificationResult } from './proof-verification.js';

export type VerificationTier =
  | 'publisher_verified'
  | 'integrity_verified'
  | 'unknown_publisher'
  | 'failed';

export interface VerificationResult {
  tier: VerificationTier;
  valid: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  signerDid: string;
  expectedHash: string;
  actualHash: string;
  hasIdentityProof: boolean;
  proofVerified: boolean;
  proofResult?: ProofVerificationResult;
  error?: string;
}

export interface VerifyOptions {
  offline?: boolean;
}

/**
 * Create signature payload for verification (must match signing)
 */
function createSignaturePayload(
  did: string,
  hash: string,
  filename: string,
  timestamp: string
): string {
  const payload = {
    did,
    hash,
    filename,
    timestamp,
  };
  return JSON.stringify(payload);
}

/**
 * Verify a signed skill bundle
 */
export async function verifySkill(
  zipPath: string,
  sigPath: string,
  options: VerifyOptions = {}
): Promise<VerificationResult> {
  // Check files exist
  if (!existsSync(zipPath)) {
    return {
      tier: 'failed',
      valid: false,
      hashMatch: false,
      signatureValid: false,
      signerDid: '',
      expectedHash: '',
      actualHash: '',
      hasIdentityProof: false,
      proofVerified: false,
      error: `Skill file not found: ${zipPath}`,
    };
  }

  if (!existsSync(sigPath)) {
    return {
      tier: 'failed',
      valid: false,
      hashMatch: false,
      signatureValid: false,
      signerDid: '',
      expectedHash: '',
      actualHash: '',
      hasIdentityProof: false,
      proofVerified: false,
      error: `Signature file not found: ${sigPath}`,
    };
  }

  // Load signature file
  const sigFile = await loadSignature(sigPath);
  if (!sigFile) {
    return {
      tier: 'failed',
      valid: false,
      hashMatch: false,
      signatureValid: false,
      signerDid: '',
      expectedHash: '',
      actualHash: '',
      hasIdentityProof: false,
      proofVerified: false,
      error: 'Failed to parse signature file',
    };
  }

  // Compute actual hash
  const actualHash = await hashFile(zipPath);
  const expectedHash = sigFile.artifact.hash;
  const hashMatch = actualHash === expectedHash;

  // Verify signature
  const payload = createSignaturePayload(
    sigFile.signer.did,
    sigFile.artifact.hash,
    sigFile.artifact.filename,
    sigFile.timestamp
  );
  const payloadBytes = new TextEncoder().encode(payload);

  let signatureValid = false;
  try {
    signatureValid = await verifySignature(
      payloadBytes,
      sigFile.signature,
      sigFile.signer.publicKey
    );
  } catch {
    signatureValid = false;
  }

  // Check for identity proof and verify it
  const hasIdentityProof = !!(sigFile.signer as any).proof;
  let proofVerified = false;
  let proofResult: ProofVerificationResult | undefined;

  if (hasIdentityProof && sigFile.signer.proof) {
    proofResult = await verifyProof(
      sigFile.signer.proof,
      sigFile.signer.did,
      sigFile.signer.publicKey,
      options.offline
    );
    proofVerified = proofResult.verified;
  }

  // Determine tier
  let tier: VerificationTier;
  if (!hashMatch || !signatureValid) {
    tier = 'failed';
  } else if (proofVerified) {
    tier = 'publisher_verified';
  } else if (hasIdentityProof && options.offline) {
    // In offline mode with proof present, show integrity verified
    tier = 'integrity_verified';
  } else {
    tier = 'unknown_publisher';
  }

  return {
    tier,
    valid: hashMatch && signatureValid,
    hashMatch,
    signatureValid,
    signerDid: sigFile.signer.did,
    expectedHash,
    actualHash,
    hasIdentityProof,
    proofVerified,
    proofResult,
  };
}

/**
 * Get colored output for verification tier
 */
export function getTierDisplay(tier: VerificationTier): {
  icon: string;
  label: string;
  color: string;
} {
  switch (tier) {
    case 'publisher_verified':
      return { icon: '✅', label: 'PUBLISHER VERIFIED', color: '\x1b[32m' };
    case 'integrity_verified':
      return { icon: '✅', label: 'INTEGRITY VERIFIED', color: '\x1b[32m' };
    case 'unknown_publisher':
      return { icon: '⚠️', label: 'UNKNOWN PUBLISHER', color: '\x1b[33m' };
    case 'failed':
      return { icon: '🚫', label: 'VERIFICATION FAILED', color: '\x1b[31m' };
  }
}
