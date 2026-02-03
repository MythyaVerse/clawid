/**
 * Identity proof verification for ClawID
 * Verifies GitHub gists and domain-based proofs
 */

import {
  validateProofContent,
  parseGistUrl,
  parseDomainUrl,
  type GistProofContent,
  type DomainProofContent,
} from './proof.js';

export interface ProofVerificationResult {
  verified: boolean;
  type: 'github' | 'domain' | 'none';
  handle?: string;      // GitHub username or domain
  error?: string;
  offline?: boolean;    // True if verification was skipped due to offline mode
}

/**
 * Fetch content from a URL with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ClawID-Verifier/1.0',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch and parse a GitHub gist
 */
async function fetchGistContent(gistUrl: string): Promise<GistProofContent | null> {
  const parsed = parseGistUrl(gistUrl);
  if (!parsed) {
    return null;
  }

  // GitHub API URL for the gist
  const apiUrl = `https://api.github.com/gists/${parsed.gistId}`;

  try {
    const response = await fetchWithTimeout(apiUrl);

    if (!response.ok) {
      return null;
    }

    const gistData = await response.json();

    // Find the clawid.json file in the gist
    const files = gistData.files;
    let clawidFile = files['clawid.json'];

    // If not found by exact name, look for any .json file with clawid content
    if (!clawidFile) {
      for (const filename of Object.keys(files)) {
        if (filename.toLowerCase().includes('clawid') && filename.endsWith('.json')) {
          clawidFile = files[filename];
          break;
        }
      }
    }

    if (!clawidFile || !clawidFile.content) {
      return null;
    }

    return JSON.parse(clawidFile.content) as GistProofContent;
  } catch {
    return null;
  }
}

/**
 * Fetch and parse domain proof from .well-known
 */
async function fetchDomainProof(domainUrl: string): Promise<DomainProofContent | null> {
  try {
    const response = await fetchWithTimeout(domainUrl);

    if (!response.ok) {
      return null;
    }

    return await response.json() as DomainProofContent;
  } catch {
    return null;
  }
}

/**
 * Verify a GitHub gist identity proof
 */
export async function verifyGithubProof(
  gistUrl: string,
  expectedDid: string,
  expectedPublicKey: string
): Promise<ProofVerificationResult> {
  const parsed = parseGistUrl(gistUrl);
  if (!parsed) {
    return {
      verified: false,
      type: 'github',
      error: 'Invalid gist URL format',
    };
  }

  const content = await fetchGistContent(gistUrl);
  if (!content) {
    return {
      verified: false,
      type: 'github',
      handle: parsed.owner,
      error: 'Could not fetch gist content (may be private or deleted)',
    };
  }

  const validation = validateProofContent(content, expectedDid, expectedPublicKey);
  if (!validation.valid) {
    return {
      verified: false,
      type: 'github',
      handle: parsed.owner,
      error: validation.error,
    };
  }

  return {
    verified: true,
    type: 'github',
    handle: parsed.owner,
  };
}

/**
 * Verify a domain-based identity proof
 */
export async function verifyDomainProof(
  domainUrl: string,
  expectedDid: string,
  expectedPublicKey: string
): Promise<ProofVerificationResult> {
  const domain = parseDomainUrl(domainUrl);
  if (!domain) {
    return {
      verified: false,
      type: 'domain',
      error: 'Invalid domain URL format',
    };
  }

  const content = await fetchDomainProof(domainUrl);
  if (!content) {
    return {
      verified: false,
      type: 'domain',
      handle: domain,
      error: 'Could not fetch domain proof (may not exist or be unreachable)',
    };
  }

  const validation = validateProofContent(content, expectedDid, expectedPublicKey);
  if (!validation.valid) {
    return {
      verified: false,
      type: 'domain',
      handle: domain,
      error: validation.error,
    };
  }

  return {
    verified: true,
    type: 'domain',
    handle: domain,
  };
}

/**
 * Verify an identity proof based on its type
 */
export async function verifyProof(
  proof: { type: string; url?: string; handle?: string },
  expectedDid: string,
  expectedPublicKey: string,
  offline: boolean = false
): Promise<ProofVerificationResult> {
  // If offline mode, return without verification
  if (offline) {
    return {
      verified: false,
      type: proof.type as 'github' | 'domain',
      handle: proof.handle,
      offline: true,
    };
  }

  if (!proof.url) {
    return {
      verified: false,
      type: proof.type as 'github' | 'domain',
      error: 'No proof URL provided',
    };
  }

  switch (proof.type) {
    case 'github':
      return verifyGithubProof(proof.url, expectedDid, expectedPublicKey);

    case 'domain':
      return verifyDomainProof(proof.url, expectedDid, expectedPublicKey);

    default:
      return {
        verified: false,
        type: 'none',
        error: `Unknown proof type: ${proof.type}`,
      };
  }
}
