import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Enable synchronous methods for ed25519
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const CLAWID_DIR = join(homedir(), '.clawid');
const KEYPAIR_FILE = join(CLAWID_DIR, 'keypair.json');

export interface ClawIDIdentity {
  did: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

/**
 * Convert bytes to base58btc multibase encoding
 * Multibase prefix 'z' = base58btc
 */
function bytesToMultibase(bytes: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }

  let encoded = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    encoded = ALPHABET[remainder] + encoded;
    num = num / 58n;
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte === 0) {
      encoded = '1' + encoded;
    } else {
      break;
    }
  }

  return 'z' + encoded; // 'z' prefix for base58btc multibase
}

/**
 * Create a did:key from Ed25519 public key
 * Format: did:key:z6Mk... (multicodec 0xed01 for Ed25519)
 */
function publicKeyToDid(publicKey: Uint8Array): string {
  // Multicodec prefix for Ed25519 public key: 0xed 0x01
  const multicodecPrefix = new Uint8Array([0xed, 0x01]);
  const prefixedKey = new Uint8Array(multicodecPrefix.length + publicKey.length);
  prefixedKey.set(multicodecPrefix);
  prefixedKey.set(publicKey, multicodecPrefix.length);

  const multibaseEncoded = bytesToMultibase(prefixedKey);
  return `did:key:${multibaseEncoded}`;
}

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generate a new Ed25519 keypair and DID
 */
export async function generateIdentity(): Promise<ClawIDIdentity> {
  // Generate random private key (32 bytes)
  const privateKey = ed.utils.randomPrivateKey();

  // Derive public key
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  // Generate DID from public key
  const did = publicKeyToDid(publicKey);

  return {
    did,
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Save identity to ~/.clawid/keypair.json
 */
export async function saveIdentity(identity: ClawIDIdentity): Promise<void> {
  // Create directory if it doesn't exist
  if (!existsSync(CLAWID_DIR)) {
    await mkdir(CLAWID_DIR, { recursive: true });
  }

  await writeFile(KEYPAIR_FILE, JSON.stringify(identity, null, 2), 'utf-8');
}

/**
 * Load identity from ~/.clawid/keypair.json
 */
export async function loadIdentity(): Promise<ClawIDIdentity | null> {
  if (!existsSync(KEYPAIR_FILE)) {
    return null;
  }

  const content = await readFile(KEYPAIR_FILE, 'utf-8');
  return JSON.parse(content) as ClawIDIdentity;
}

/**
 * Check if identity exists
 */
export function identityExists(): boolean {
  return existsSync(KEYPAIR_FILE);
}

/**
 * Get the ClawID directory path
 */
export function getClawIdDir(): string {
  return CLAWID_DIR;
}

/**
 * Sign data with private key
 */
export async function signData(data: Uint8Array, privateKeyHex: string): Promise<string> {
  const privateKey = hexToBytes(privateKeyHex);
  const signature = await ed.signAsync(data, privateKey);
  return bytesToHex(signature);
}

/**
 * Verify signature
 */
export async function verifySignature(
  data: Uint8Array,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  const signature = hexToBytes(signatureHex);
  const publicKey = hexToBytes(publicKeyHex);
  return await ed.verifyAsync(signature, data, publicKey);
}
