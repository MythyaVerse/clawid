/**
 * Wrap command for verified skill installation
 * Downloads skills and verifies them before installation
 */

import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import { tmpdir } from 'os';
import { verifySkill, VerificationResult, VerifyOptions } from './verification.js';
import { getSignatureFilePath } from './signing.js';

export interface DownloadResult {
  success: boolean;
  zipPath?: string;
  sigPath?: string;
  error?: string;
}

/**
 * Download a file from URL to a local path
 */
async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ClawID-Verifier/1.0',
      },
    });

    if (!response.ok) {
      return false;
    }

    const buffer = await response.arrayBuffer();
    await writeFile(destPath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

/**
 * Infer signature URL from skill URL
 * For a skill at https://example.com/skill-v1.0.0.zip
 * The signature is at https://example.com/skill-v1.0.0.clawid-sig.json
 */
export function inferSignatureUrl(skillUrl: string): string {
  // Replace .zip with .clawid-sig.json
  if (skillUrl.endsWith('.zip')) {
    return skillUrl.replace(/\.zip$/, '.clawid-sig.json');
  }
  // Otherwise, append the signature extension
  return `${skillUrl}.clawid-sig.json`;
}

/**
 * Download a skill and its signature
 */
export async function downloadSkillWithSignature(
  skillUrl: string,
  signatureUrl?: string
): Promise<DownloadResult> {
  // Create temp directory for downloads
  const tempDir = join(tmpdir(), 'clawid-downloads');
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }

  // Extract filename from URL
  const urlObj = new URL(skillUrl);
  const filename = basename(urlObj.pathname);
  if (!filename.endsWith('.zip')) {
    return {
      success: false,
      error: 'URL must point to a .zip file',
    };
  }

  const zipPath = join(tempDir, filename);
  const sigFilename = basename(getSignatureFilePath(filename));
  const sigPath = join(tempDir, sigFilename);

  // Download skill zip
  console.log(`   Downloading skill: ${skillUrl}`);
  const zipDownloaded = await downloadFile(skillUrl, zipPath);
  if (!zipDownloaded) {
    return {
      success: false,
      error: 'Failed to download skill bundle',
    };
  }

  // Download signature (infer URL if not provided)
  const sigUrl = signatureUrl || inferSignatureUrl(skillUrl);
  console.log(`   Downloading signature: ${sigUrl}`);
  const sigDownloaded = await downloadFile(sigUrl, sigPath);
  if (!sigDownloaded) {
    // Clean up zip
    await unlink(zipPath).catch(() => {});
    return {
      success: false,
      error: 'Failed to download signature file. Skill may not be signed.',
    };
  }

  return {
    success: true,
    zipPath,
    sigPath,
  };
}

/**
 * Verify a downloaded skill
 */
export async function verifyDownloadedSkill(
  zipPath: string,
  sigPath: string,
  options: VerifyOptions = {}
): Promise<VerificationResult> {
  return verifySkill(zipPath, sigPath, options);
}

/**
 * Clean up downloaded files
 */
export async function cleanupDownloads(zipPath?: string, sigPath?: string): Promise<void> {
  if (zipPath) {
    await unlink(zipPath).catch(() => {});
  }
  if (sigPath) {
    await unlink(sigPath).catch(() => {});
  }
}

/**
 * Check if verification result allows installation
 */
export function canInstall(result: VerificationResult, force: boolean): {
  allowed: boolean;
  reason?: string;
} {
  if (!result.valid) {
    return {
      allowed: false,
      reason: 'Verification failed - skill may be tampered with',
    };
  }

  if (result.tier === 'publisher_verified') {
    return { allowed: true };
  }

  if (result.tier === 'integrity_verified') {
    return { allowed: true };
  }

  if (result.tier === 'unknown_publisher') {
    if (force) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Unknown publisher. Use --force to install anyway.',
    };
  }

  return {
    allowed: false,
    reason: 'Verification failed',
  };
}
