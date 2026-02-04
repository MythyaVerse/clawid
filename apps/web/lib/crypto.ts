import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Enable synchronous methods for ed25519
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Extract public key from did:key
 * did:key:z6Mk... format uses multicodec 0xed01 prefix
 */
export function extractPublicKeyFromDid(did: string): Uint8Array | null {
  if (!did.startsWith('did:key:z6Mk')) {
    return null;
  }

  try {
    // The z6Mk prefix indicates Ed25519 key
    // Decode base58btc (everything after 'did:key:')
    const keyPart = did.slice(8); // Remove 'did:key:'
    const decoded = base58btcDecode(keyPart);

    // Remove multicodec prefix (0xed01 = 2 bytes)
    if (decoded.length !== 34) {
      return null;
    }

    return decoded.slice(2);
  } catch {
    return null;
  }
}

/**
 * Simple base58btc decoder for did:key
 */
function base58btcDecode(str: string): Uint8Array {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  let result = BigInt(0);
  for (const char of str) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid base58 character');
    result = result * BigInt(58) + BigInt(index);
  }

  // Convert to bytes
  const hex = result.toString(16).padStart(68, '0'); // 34 bytes = 68 hex chars
  return hexToBytes(hex);
}

/**
 * Verify a registration signature
 * The payload format is: { action: "register", publisher_did, skill_name, skill_hash, timestamp }
 */
export async function verifyRegistrationSignature(
  publisherDid: string,
  skillName: string,
  skillHash: string,
  signature: string,
  timestamp?: string
): Promise<boolean> {
  const publicKey = extractPublicKeyFromDid(publisherDid);
  if (!publicKey) {
    return false;
  }

  // Create the payload that was signed
  const payload = JSON.stringify({
    action: 'register',
    publisher_did: publisherDid,
    skill_name: skillName,
    skill_hash: skillHash,
    timestamp: timestamp || new Date().toISOString(),
  });

  const payloadBytes = new TextEncoder().encode(payload);
  const signatureBytes = hexToBytes(signature);

  try {
    return await ed.verifyAsync(signatureBytes, payloadBytes, publicKey);
  } catch {
    return false;
  }
}
