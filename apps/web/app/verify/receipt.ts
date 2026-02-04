/**
 * Receipt URL utilities for shareable verification results
 */

type VerificationTier = 'publisher_verified' | 'integrity_verified' | 'unknown_publisher' | 'failed';

interface VerificationResult {
  tier: VerificationTier;
  valid: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  signerDid: string;
  expectedHash: string;
  actualHash: string;
  hasProof: boolean;
  proofType?: string;
  proofHandle?: string;
  error?: string;
}

// Receipt data structure for shareable URLs
export interface ReceiptData {
  hash: string;        // SHA256 hash of the skill
  sig: string;         // Truncated signature (first 16 chars)
  did: string;         // Signer DID
  filename: string;    // Original filename
  timestamp: string;   // Signing timestamp
  tier: VerificationTier;
  proof?: {
    type: string;
    handle: string;
  };
}

/**
 * Generate a shareable receipt URL from verification result
 */
export function generateReceiptUrl(
  result: VerificationResult,
  filename: string,
  timestamp: string,
  signature: string
): string {
  const receipt: ReceiptData = {
    hash: result.expectedHash,
    sig: signature.slice(0, 16),
    did: result.signerDid,
    filename,
    timestamp,
    tier: result.tier,
  };

  if (result.hasProof && result.proofType && result.proofHandle) {
    receipt.proof = {
      type: result.proofType,
      handle: result.proofHandle,
    };
  }

  const encoded = btoa(JSON.stringify(receipt));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/verify#receipt=${encoded}`;
}

/**
 * Parse a receipt from URL hash
 */
export function parseReceiptFromUrl(hash: string): ReceiptData | null {
  if (!hash || !hash.startsWith('#receipt=')) {
    return null;
  }

  try {
    const encoded = hash.slice('#receipt='.length);
    const decoded = atob(encoded);
    const receipt = JSON.parse(decoded) as ReceiptData;

    // Validate required fields
    if (!receipt.hash || !receipt.did || !receipt.filename || !receipt.tier) {
      return null;
    }

    return receipt;
  } catch {
    return null;
  }
}

/**
 * Convert receipt data to verification result for display
 */
export function receiptToResult(receipt: ReceiptData): VerificationResult {
  return {
    tier: receipt.tier,
    valid: receipt.tier !== 'failed',
    hashMatch: true,
    signatureValid: true,
    signerDid: receipt.did,
    expectedHash: receipt.hash,
    actualHash: receipt.hash,
    hasProof: !!receipt.proof,
    proofType: receipt.proof?.type,
    proofHandle: receipt.proof?.handle,
  };
}
