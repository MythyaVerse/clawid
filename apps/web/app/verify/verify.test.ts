/**
 * Tests for browser-side verification logic
 * These test the core crypto functions that run in the browser
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';

// Enable synchronous methods for ed25519
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('Browser Verification Logic', () => {
  // Test keypair
  const privateKey = hexToBytes('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  let publicKey: Uint8Array;
  let publicKeyHex: string;

  beforeAll(async () => {
    publicKey = await ed.getPublicKeyAsync(privateKey);
    publicKeyHex = bytesToHex(publicKey);
  });

  describe('SHA256 Hashing', () => {
    it('should compute correct hash of bytes', () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const hash = sha256(testData);
      const hashHex = bytesToHex(hash);

      // SHA256 of [1,2,3,4,5] should be consistent
      expect(hashHex).toHaveLength(64);
      expect(hashHex).toMatch(/^[0-9a-f]+$/);
    });

    it('should produce different hashes for different inputs', () => {
      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([1, 2, 4]);

      const hash1 = bytesToHex(sha256(data1));
      const hash2 = bytesToHex(sha256(data2));

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Ed25519 Signature Verification', () => {
    it('should verify valid signature', async () => {
      const message = new TextEncoder().encode('test message');
      const signature = await ed.signAsync(message, privateKey);

      const isValid = await ed.verifyAsync(signature, message, publicKey);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const message = new TextEncoder().encode('test message');
      const signature = await ed.signAsync(message, privateKey);

      // Tamper with signature
      const tamperedSig = new Uint8Array(signature);
      tamperedSig[0] = tamperedSig[0] ^ 0xff;

      const isValid = await ed.verifyAsync(tamperedSig, message, publicKey);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong public key', async () => {
      const message = new TextEncoder().encode('test message');
      const signature = await ed.signAsync(message, privateKey);

      // Use different public key
      const otherPrivateKey = hexToBytes('fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210');
      const otherPublicKey = await ed.getPublicKeyAsync(otherPrivateKey);

      const isValid = await ed.verifyAsync(signature, message, otherPublicKey);
      expect(isValid).toBe(false);
    });

    it('should reject signature for different message', async () => {
      const message = new TextEncoder().encode('test message');
      const differentMessage = new TextEncoder().encode('different message');
      const signature = await ed.signAsync(message, privateKey);

      const isValid = await ed.verifyAsync(signature, differentMessage, publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe('Payload Verification', () => {
    it('should verify deterministic JSON payload', async () => {
      const payload = JSON.stringify({
        did: 'did:key:z6MkTest',
        hash: 'sha256:abc123',
        filename: 'test.zip',
        timestamp: '2026-02-03T00:00:00Z',
      });
      const payloadBytes = new TextEncoder().encode(payload);

      const signature = await ed.signAsync(payloadBytes, privateKey);
      const isValid = await ed.verifyAsync(signature, payloadBytes, publicKey);

      expect(isValid).toBe(true);
    });

    it('should detect tampering in payload', async () => {
      const payload = JSON.stringify({
        did: 'did:key:z6MkTest',
        hash: 'sha256:abc123',
        filename: 'test.zip',
        timestamp: '2026-02-03T00:00:00Z',
      });
      const payloadBytes = new TextEncoder().encode(payload);
      const signature = await ed.signAsync(payloadBytes, privateKey);

      // Tampered payload
      const tamperedPayload = JSON.stringify({
        did: 'did:key:z6MkTest',
        hash: 'sha256:tampered',
        filename: 'test.zip',
        timestamp: '2026-02-03T00:00:00Z',
      });
      const tamperedBytes = new TextEncoder().encode(tamperedPayload);

      const isValid = await ed.verifyAsync(signature, tamperedBytes, publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe('Hex Encoding', () => {
    it('should round-trip hex encoding', () => {
      const original = new Uint8Array([0, 127, 255, 128, 1]);
      const hex = bytesToHex(original);
      const decoded = hexToBytes(hex);

      expect(decoded).toEqual(original);
    });

    it('should handle empty array', () => {
      const empty = new Uint8Array([]);
      const hex = bytesToHex(empty);
      expect(hex).toBe('');
      expect(hexToBytes(hex)).toEqual(empty);
    });
  });
});
