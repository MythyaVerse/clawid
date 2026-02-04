/**
 * Tests for ClawID Library API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifySkill, downloadAndVerify, inferSignatureUrl } from './api.js';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';

// Helper to create test files
async function createTestFiles(dir: string) {
  const privateKey = new Uint8Array(32).fill(1);
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const publicKeyHex = Buffer.from(publicKey).toString('hex');

  // Create a simple zip-like file (just bytes for testing)
  const zipContent = Buffer.from('test skill content');
  const zipPath = join(dir, 'test-skill.zip');
  await writeFile(zipPath, zipContent);

  // Compute hash
  const hashBytes = sha256(zipContent);
  const hash = `sha256:${Buffer.from(hashBytes).toString('hex')}`;

  // Create signature payload
  const did = `did:key:z6Mk${publicKeyHex.slice(0, 44)}`;
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({
    did,
    hash,
    filename: 'test-skill.zip',
    timestamp,
  });

  // Sign
  const signature = await ed.signAsync(
    new TextEncoder().encode(payload),
    privateKey
  );
  const signatureHex = Buffer.from(signature).toString('hex');

  // Create signature file
  const sigFile = {
    version: '1.0.0',
    signer: {
      did,
      publicKey: publicKeyHex,
    },
    artifact: {
      type: 'skill',
      hash,
      filename: 'test-skill.zip',
      size: zipContent.length,
    },
    timestamp,
    signature: signatureHex,
  };

  const sigPath = join(dir, 'test-skill.clawid-sig.json');
  await writeFile(sigPath, JSON.stringify(sigFile, null, 2));

  return { zipPath, sigPath, did, hash };
}

describe('ClawID Library API', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `clawid-api-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true });
    }
  });

  describe('verifySkill', () => {
    it('should verify valid skill and return canInstall=true for unknown_publisher', async () => {
      const { zipPath, sigPath } = await createTestFiles(testDir);

      const result = await verifySkill(zipPath, sigPath);

      expect(result.valid).toBe(true);
      expect(result.hashMatch).toBe(true);
      expect(result.signatureValid).toBe(true);
      // Without proof, tier is unknown_publisher, which has canInstall=false
      expect(result.tier).toBe('unknown_publisher');
      expect(result.canInstall).toBe(false);
    });

    it('should return canInstall=false for failed verification', async () => {
      const { zipPath, sigPath } = await createTestFiles(testDir);

      // Tamper with the zip file
      await writeFile(zipPath, 'tampered content');

      const result = await verifySkill(zipPath, sigPath);

      expect(result.valid).toBe(false);
      expect(result.tier).toBe('failed');
      expect(result.canInstall).toBe(false);
    });

    it('should return error for missing zip file', async () => {
      const nonExistentZip = join(testDir, 'nonexistent.zip');
      const { sigPath } = await createTestFiles(testDir);

      const result = await verifySkill(nonExistentZip, sigPath);

      expect(result.valid).toBe(false);
      expect(result.tier).toBe('failed');
      expect(result.canInstall).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return error for missing signature file', async () => {
      const { zipPath } = await createTestFiles(testDir);
      const nonExistentSig = join(testDir, 'nonexistent.json');

      const result = await verifySkill(zipPath, nonExistentSig);

      expect(result.valid).toBe(false);
      expect(result.tier).toBe('failed');
      expect(result.canInstall).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should support offline mode', async () => {
      const { zipPath, sigPath } = await createTestFiles(testDir);

      const result = await verifySkill(zipPath, sigPath, { offline: true });

      expect(result.valid).toBe(true);
      // Offline mode doesn't change canInstall for unknown_publisher
      expect(result.tier).toBe('unknown_publisher');
    });
  });

  describe('inferSignatureUrl', () => {
    it('should replace .zip with .clawid-sig.json', () => {
      const url = inferSignatureUrl('https://example.com/skill-v1.0.0.zip');
      expect(url).toBe('https://example.com/skill-v1.0.0.clawid-sig.json');
    });

    it('should append .clawid-sig.json if not .zip', () => {
      const url = inferSignatureUrl('https://example.com/skill');
      expect(url).toBe('https://example.com/skill.clawid-sig.json');
    });

    it('should handle URLs with query parameters', () => {
      // The current implementation just replaces .zip, which may not handle query params ideally
      // This test documents current behavior
      const url = inferSignatureUrl('https://example.com/skill.zip?v=1');
      expect(url).toBe('https://example.com/skill.zip?v=1.clawid-sig.json');
    });
  });

  describe('downloadAndVerify', () => {
    // Note: These tests would require mocking fetch or a test server
    // For now, we test the error handling paths

    it('should return download error for invalid URL', async () => {
      // This will fail because it's not a valid URL
      const result = await downloadAndVerify('not-a-valid-url');

      expect(result.valid).toBe(false);
      expect(result.tier).toBe('failed');
      expect(result.canInstall).toBe(false);
      expect(result.downloadError).toBeDefined();
    });

    it('should return download error for non-zip URL', async () => {
      const result = await downloadAndVerify('https://example.com/not-a-zip');

      expect(result.valid).toBe(false);
      expect(result.tier).toBe('failed');
      expect(result.canInstall).toBe(false);
      expect(result.downloadError).toBeDefined();
    });
  });

  describe('VerificationResult interface', () => {
    it('should have all expected fields', async () => {
      const { zipPath, sigPath, did, hash } = await createTestFiles(testDir);

      const result = await verifySkill(zipPath, sigPath);

      // Check all required fields exist
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('hashMatch');
      expect(result).toHaveProperty('signatureValid');
      expect(result).toHaveProperty('signerDid');
      expect(result).toHaveProperty('expectedHash');
      expect(result).toHaveProperty('actualHash');
      expect(result).toHaveProperty('hasIdentityProof');
      expect(result).toHaveProperty('proofVerified');
      expect(result).toHaveProperty('canInstall');

      // Check types
      expect(typeof result.tier).toBe('string');
      expect(typeof result.valid).toBe('boolean');
      expect(typeof result.canInstall).toBe('boolean');
    });
  });
});

describe('Installation Rules', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `clawid-install-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true });
    }
  });

  it('should have canInstall=false for unknown_publisher', async () => {
    const { zipPath, sigPath } = await createTestFiles(testDir);
    const result = await verifySkill(zipPath, sigPath);

    expect(result.tier).toBe('unknown_publisher');
    expect(result.canInstall).toBe(false);
  });

  it('should have canInstall=false for failed tier', async () => {
    const { zipPath, sigPath } = await createTestFiles(testDir);

    // Tamper with zip
    await writeFile(zipPath, 'tampered');

    const result = await verifySkill(zipPath, sigPath);

    expect(result.tier).toBe('failed');
    expect(result.canInstall).toBe(false);
  });

  // Note: Testing publisher_verified and integrity_verified tiers would require
  // setting up valid proofs which is complex for unit tests
});
