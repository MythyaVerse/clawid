/**
 * Identity proof management for ClawID
 * Supports GitHub gist and domain-based (.well-known) proofs
 */

export interface IdentityProof {
  type: 'github' | 'domain';
  handle?: string;  // GitHub username
  domain?: string;  // Domain name
  url: string;      // Full URL to proof document
}

export interface GistProofContent {
  clawid: {
    version: string;
    did: string;
    publicKey: string;
  };
}

export interface DomainProofContent {
  clawid: {
    version: string;
    did: string;
    publicKey: string;
  };
}

/**
 * Generate GitHub gist proof content for a publisher
 */
export function generateGithubProofContent(did: string, publicKey: string): string {
  const content: GistProofContent = {
    clawid: {
      version: '1.0',
      did,
      publicKey,
    },
  };

  return JSON.stringify(content, null, 2);
}

/**
 * Generate domain proof content (.well-known/clawid.json)
 */
export function generateDomainProofContent(did: string, publicKey: string): string {
  const content: DomainProofContent = {
    clawid: {
      version: '1.0',
      did,
      publicKey,
    },
  };

  return JSON.stringify(content, null, 2);
}

/**
 * Parse a GitHub gist URL to extract owner and gist ID
 * Supports: https://gist.github.com/username/gistid
 * Also supports raw URLs: https://gist.githubusercontent.com/username/gistid/raw/...
 */
export function parseGistUrl(url: string): { owner: string; gistId: string } | null {
  // Match standard gist URL
  const standardMatch = url.match(/gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/i);
  if (standardMatch) {
    return { owner: standardMatch[1], gistId: standardMatch[2] };
  }

  // Match raw gist URL
  const rawMatch = url.match(/gist\.githubusercontent\.com\/([^\/]+)\/([a-f0-9]+)/i);
  if (rawMatch) {
    return { owner: rawMatch[1], gistId: rawMatch[2] };
  }

  return null;
}

/**
 * Parse a domain from a .well-known URL
 * Supports: https://example.com/.well-known/clawid.json
 */
export function parseDomainUrl(url: string): string | null {
  const match = url.match(/https:\/\/([^\/]+)\/.well-known\/clawid\.json/i);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Validate that proof content matches expected DID and public key
 */
export function validateProofContent(
  content: GistProofContent | DomainProofContent,
  expectedDid: string,
  expectedPublicKey: string
): { valid: boolean; error?: string } {
  if (!content.clawid) {
    return { valid: false, error: 'Missing clawid field in proof' };
  }

  if (content.clawid.did !== expectedDid) {
    return {
      valid: false,
      error: `DID mismatch: expected ${expectedDid}, got ${content.clawid.did}`,
    };
  }

  if (content.clawid.publicKey !== expectedPublicKey) {
    return {
      valid: false,
      error: `Public key mismatch: expected ${expectedPublicKey}, got ${content.clawid.publicKey}`,
    };
  }

  return { valid: true };
}

/**
 * Build a .well-known URL from a domain
 */
export function buildWellKnownUrl(domain: string): string {
  // Remove protocol if present
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${cleanDomain}/.well-known/clawid.json`;
}

/**
 * Create an IdentityProof object from a GitHub gist URL
 */
export function createGithubProof(gistUrl: string): IdentityProof | null {
  const parsed = parseGistUrl(gistUrl);
  if (!parsed) {
    return null;
  }

  return {
    type: 'github',
    handle: parsed.owner,
    url: gistUrl,
  };
}

/**
 * Create an IdentityProof object from a domain URL
 */
export function createDomainProof(domainUrl: string): IdentityProof | null {
  const domain = parseDomainUrl(domainUrl);
  if (!domain) {
    return null;
  }

  return {
    type: 'domain',
    domain,
    url: domainUrl,
  };
}
