/**
 * Skill registry client for clawid.dev API
 */

const REGISTRY_URL = process.env.CLAWID_REGISTRY_URL || 'https://www.clawid.dev';

export interface RegisterSkillParams {
  publisherDid: string;
  skillName: string;
  skillHash: string;
  sourceUrl?: string;
  signature: string;
  signedAt?: string;
}

export interface RegisterSkillResponse {
  success: boolean;
  skill?: {
    id: number;
    name: string;
    hash: string;
    signed_at: string;
  };
  message?: string;
  error?: string;
}

/**
 * Register a skill with the clawid.dev registry
 */
export async function registerSkill(params: RegisterSkillParams): Promise<RegisterSkillResponse> {
  try {
    const response = await fetch(`${REGISTRY_URL}/api/v1/skills/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publisher_did: params.publisherDid,
        skill_name: params.skillName,
        skill_hash: params.skillHash,
        source_url: params.sourceUrl,
        signature: params.signature,
        signed_at: params.signedAt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data as RegisterSkillResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Simple stdin reader for prompts
 */
export function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);

    // Read from stdin
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      input = data.toString().trim();
      resolve(input);
    });

    // If stdin is not interactive, return empty
    if (!process.stdin.isTTY) {
      resolve('');
    }
  });
}
