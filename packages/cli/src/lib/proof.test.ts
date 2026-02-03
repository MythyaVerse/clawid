import { describe, it, expect } from 'vitest';
import {
  generateGithubProofContent,
  generateDomainProofContent,
  parseGistUrl,
  parseDomainUrl,
  validateProofContent,
  createGithubProof,
  createDomainProof,
  buildWellKnownUrl,
} from './proof.js';

describe('proof generation', () => {
  const testDid = 'did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ';
  const testPublicKey = 'fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8';

  describe('generateGithubProofContent', () => {
    it('should generate valid JSON with clawid structure', () => {
      const content = generateGithubProofContent(testDid, testPublicKey);
      const parsed = JSON.parse(content);

      expect(parsed.clawid).toBeDefined();
      expect(parsed.clawid.version).toBe('1.0');
      expect(parsed.clawid.did).toBe(testDid);
      expect(parsed.clawid.publicKey).toBe(testPublicKey);
    });
  });

  describe('generateDomainProofContent', () => {
    it('should generate valid JSON with clawid structure', () => {
      const content = generateDomainProofContent(testDid, testPublicKey);
      const parsed = JSON.parse(content);

      expect(parsed.clawid).toBeDefined();
      expect(parsed.clawid.version).toBe('1.0');
      expect(parsed.clawid.did).toBe(testDid);
      expect(parsed.clawid.publicKey).toBe(testPublicKey);
    });
  });
});

describe('URL parsing', () => {
  describe('parseGistUrl', () => {
    it('should parse standard gist URL', () => {
      const result = parseGistUrl('https://gist.github.com/testuser/abc123def456');
      expect(result).toEqual({ owner: 'testuser', gistId: 'abc123def456' });
    });

    it('should parse gist URL with full hash', () => {
      const result = parseGistUrl('https://gist.github.com/acme-corp/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4');
      expect(result).toEqual({ owner: 'acme-corp', gistId: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' });
    });

    it('should parse raw gist URL', () => {
      const result = parseGistUrl('https://gist.githubusercontent.com/testuser/abc123/raw/file.json');
      expect(result).toEqual({ owner: 'testuser', gistId: 'abc123' });
    });

    it('should return null for invalid URL', () => {
      expect(parseGistUrl('https://github.com/user/repo')).toBeNull();
      expect(parseGistUrl('not a url')).toBeNull();
    });
  });

  describe('parseDomainUrl', () => {
    it('should parse .well-known URL', () => {
      const result = parseDomainUrl('https://example.com/.well-known/clawid.json');
      expect(result).toBe('example.com');
    });

    it('should parse subdomain .well-known URL', () => {
      const result = parseDomainUrl('https://skills.acme-corp.com/.well-known/clawid.json');
      expect(result).toBe('skills.acme-corp.com');
    });

    it('should return null for invalid URL', () => {
      expect(parseDomainUrl('https://example.com/clawid.json')).toBeNull();
      expect(parseDomainUrl('http://example.com/.well-known/clawid.json')).toBeNull(); // HTTP not HTTPS
    });
  });

  describe('buildWellKnownUrl', () => {
    it('should build correct URL from domain', () => {
      expect(buildWellKnownUrl('example.com')).toBe('https://example.com/.well-known/clawid.json');
    });

    it('should strip existing protocol', () => {
      expect(buildWellKnownUrl('https://example.com')).toBe('https://example.com/.well-known/clawid.json');
      expect(buildWellKnownUrl('http://example.com')).toBe('https://example.com/.well-known/clawid.json');
    });

    it('should strip trailing slash', () => {
      expect(buildWellKnownUrl('example.com/')).toBe('https://example.com/.well-known/clawid.json');
    });
  });
});

describe('proof validation', () => {
  const testDid = 'did:key:z6MkwTCtz6NewTuV2MJsHvhrQew8Lp7uC1W7Syvg97WsAGjZ';
  const testPublicKey = 'fc931e2c3c0a729fd8c931634ad032d5e648b5dc5e66aecc090f32a1398844e8';

  describe('validateProofContent', () => {
    it('should validate correct proof content', () => {
      const content = {
        clawid: {
          version: '1.0',
          did: testDid,
          publicKey: testPublicKey,
        },
      };
      const result = validateProofContent(content, testDid, testPublicKey);
      expect(result.valid).toBe(true);
    });

    it('should reject mismatched DID', () => {
      const content = {
        clawid: {
          version: '1.0',
          did: 'did:key:z6MkOTHER',
          publicKey: testPublicKey,
        },
      };
      const result = validateProofContent(content, testDid, testPublicKey);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('DID mismatch');
    });

    it('should reject mismatched public key', () => {
      const content = {
        clawid: {
          version: '1.0',
          did: testDid,
          publicKey: 'wrongkey',
        },
      };
      const result = validateProofContent(content, testDid, testPublicKey);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Public key mismatch');
    });

    it('should reject missing clawid field', () => {
      const content = {} as any;
      const result = validateProofContent(content, testDid, testPublicKey);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing clawid field');
    });
  });
});

describe('proof creation', () => {
  describe('createGithubProof', () => {
    it('should create valid GitHub proof', () => {
      const proof = createGithubProof('https://gist.github.com/testuser/abc123');
      expect(proof).toEqual({
        type: 'github',
        handle: 'testuser',
        url: 'https://gist.github.com/testuser/abc123',
      });
    });

    it('should return null for invalid URL', () => {
      expect(createGithubProof('https://github.com/user/repo')).toBeNull();
    });
  });

  describe('createDomainProof', () => {
    it('should create valid domain proof', () => {
      const proof = createDomainProof('https://example.com/.well-known/clawid.json');
      expect(proof).toEqual({
        type: 'domain',
        domain: 'example.com',
        url: 'https://example.com/.well-known/clawid.json',
      });
    });

    it('should return null for invalid URL', () => {
      expect(createDomainProof('https://example.com/clawid.json')).toBeNull();
    });
  });
});
