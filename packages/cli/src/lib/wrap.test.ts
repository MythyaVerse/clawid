import { describe, it, expect } from 'vitest';
import {
  inferSignatureUrl,
  canInstall,
} from './wrap.js';
import type { VerificationResult } from './verification.js';

describe('wrap', () => {
  describe('inferSignatureUrl', () => {
    it('should replace .zip with .clawid-sig.json', () => {
      const url = 'https://example.com/skills/email-reader-v1.0.0.zip';
      expect(inferSignatureUrl(url)).toBe('https://example.com/skills/email-reader-v1.0.0.clawid-sig.json');
    });

    it('should handle URLs with paths', () => {
      const url = 'https://cdn.example.com/path/to/skill.v2.1.0.zip';
      expect(inferSignatureUrl(url)).toBe('https://cdn.example.com/path/to/skill.v2.1.0.clawid-sig.json');
    });

    it('should append extension for non-zip URLs', () => {
      const url = 'https://example.com/skill';
      expect(inferSignatureUrl(url)).toBe('https://example.com/skill.clawid-sig.json');
    });
  });

  describe('canInstall', () => {
    const baseResult: VerificationResult = {
      tier: 'publisher_verified',
      valid: true,
      hashMatch: true,
      signatureValid: true,
      signerDid: 'did:key:z6MkTest',
      expectedHash: 'sha256:abc',
      actualHash: 'sha256:abc',
      hasIdentityProof: true,
      proofVerified: true,
    };

    it('should allow publisher verified', () => {
      const result: VerificationResult = { ...baseResult, tier: 'publisher_verified' };
      expect(canInstall(result, false).allowed).toBe(true);
    });

    it('should allow integrity verified', () => {
      const result: VerificationResult = { ...baseResult, tier: 'integrity_verified' };
      expect(canInstall(result, false).allowed).toBe(true);
    });

    it('should block unknown publisher without force', () => {
      const result: VerificationResult = {
        ...baseResult,
        tier: 'unknown_publisher',
        hasIdentityProof: false,
        proofVerified: false,
      };
      const check = canInstall(result, false);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('--force');
    });

    it('should allow unknown publisher with force', () => {
      const result: VerificationResult = {
        ...baseResult,
        tier: 'unknown_publisher',
        hasIdentityProof: false,
        proofVerified: false,
      };
      expect(canInstall(result, true).allowed).toBe(true);
    });

    it('should block failed verification', () => {
      const result: VerificationResult = {
        ...baseResult,
        tier: 'failed',
        valid: false,
        hashMatch: false,
      };
      const check = canInstall(result, false);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('tampered');
    });

    it('should block failed verification even with force', () => {
      const result: VerificationResult = {
        ...baseResult,
        tier: 'failed',
        valid: false,
        signatureValid: false,
      };
      expect(canInstall(result, true).allowed).toBe(false);
    });
  });
});
