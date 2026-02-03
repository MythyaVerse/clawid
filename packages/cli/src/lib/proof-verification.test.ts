import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyGithubProof,
  verifyDomainProof,
  verifyProof,
} from './proof-verification.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('proof-verification', () => {
  const testDid = 'did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ';
  const testPublicKey = 'fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8';

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifyGithubProof', () => {
    it('should verify valid GitHub gist proof', async () => {
      const gistResponse = {
        files: {
          'clawid.json': {
            content: JSON.stringify({
              clawid: {
                version: '1.0',
                did: testDid,
                publicKey: testPublicKey,
              },
            }),
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gistResponse),
      });

      const result = await verifyGithubProof(
        'https://gist.github.com/testuser/abc123',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(true);
      expect(result.type).toBe('github');
      expect(result.handle).toBe('testuser');
    });

    it('should reject invalid gist URL', async () => {
      const result = await verifyGithubProof(
        'https://github.com/user/repo',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Invalid gist URL');
    });

    it('should handle 404 gist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await verifyGithubProof(
        'https://gist.github.com/testuser/abc123def456',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Could not fetch gist');
    });

    it('should reject mismatched DID in gist', async () => {
      const gistResponse = {
        files: {
          'clawid.json': {
            content: JSON.stringify({
              clawid: {
                version: '1.0',
                did: 'did:key:z6MkWRONG',
                publicKey: testPublicKey,
              },
            }),
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gistResponse),
      });

      const result = await verifyGithubProof(
        'https://gist.github.com/testuser/abc123',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('DID mismatch');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyGithubProof(
        'https://gist.github.com/testuser/abc123',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Could not fetch gist');
    });
  });

  describe('verifyDomainProof', () => {
    it('should verify valid domain proof', async () => {
      const proofContent = {
        clawid: {
          version: '1.0',
          did: testDid,
          publicKey: testPublicKey,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(proofContent),
      });

      const result = await verifyDomainProof(
        'https://example.com/.well-known/clawid.json',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(true);
      expect(result.type).toBe('domain');
      expect(result.handle).toBe('example.com');
    });

    it('should reject invalid domain URL', async () => {
      const result = await verifyDomainProof(
        'https://example.com/clawid.json',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Invalid domain URL');
    });

    it('should handle 404 domain proof', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await verifyDomainProof(
        'https://example.com/.well-known/clawid.json',
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Could not fetch domain proof');
    });
  });

  describe('verifyProof', () => {
    it('should route github proof correctly', async () => {
      const gistResponse = {
        files: {
          'clawid.json': {
            content: JSON.stringify({
              clawid: {
                version: '1.0',
                did: testDid,
                publicKey: testPublicKey,
              },
            }),
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gistResponse),
      });

      const result = await verifyProof(
        { type: 'github', url: 'https://gist.github.com/testuser/abc123', handle: 'testuser' },
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(true);
      expect(result.type).toBe('github');
    });

    it('should route domain proof correctly', async () => {
      const proofContent = {
        clawid: {
          version: '1.0',
          did: testDid,
          publicKey: testPublicKey,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(proofContent),
      });

      const result = await verifyProof(
        { type: 'domain', url: 'https://example.com/.well-known/clawid.json', handle: 'example.com' },
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(true);
      expect(result.type).toBe('domain');
    });

    it('should skip verification in offline mode', async () => {
      const result = await verifyProof(
        { type: 'github', url: 'https://gist.github.com/testuser/abc123', handle: 'testuser' },
        testDid,
        testPublicKey,
        true // offline
      );

      expect(result.verified).toBe(false);
      expect(result.offline).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject unknown proof type', async () => {
      const result = await verifyProof(
        { type: 'unknown', url: 'https://example.com/proof' },
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('Unknown proof type');
    });

    it('should reject missing URL', async () => {
      const result = await verifyProof(
        { type: 'github' },
        testDid,
        testPublicKey
      );

      expect(result.verified).toBe(false);
      expect(result.error).toContain('No proof URL');
    });
  });
});
