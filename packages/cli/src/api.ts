/**
 * ClawID Library API
 *
 * This module provides a clean API for integrating ClawID verification
 * into external tools like MCP servers, package managers, and installers.
 *
 * @example
 * ```typescript
 * import { verifySkill, downloadAndVerify } from '@clawid/cli';
 *
 * // Verify local files
 * const result = await verifySkill('./skill.zip', './skill.clawid-sig.json');
 * console.log(result.tier);        // 'publisher_verified'
 * console.log(result.canInstall);  // true
 *
 * // Verify remote skill
 * const remote = await downloadAndVerify('https://example.com/skill.zip');
 * if (remote.canInstall) {
 *   // Install from remote.zipPath
 * }
 * ```
 */

import {
  verifySkill as verifySkillInternal,
  type VerificationResult as InternalResult,
  type VerifyOptions,
  type VerificationTier,
} from './lib/verification.js';
import {
  downloadSkillWithSignature,
  verifyDownloadedSkill,
  cleanupDownloads,
  canInstall as canInstallInternal,
  inferSignatureUrl,
} from './lib/wrap.js';

export { VerificationTier, VerifyOptions };

/**
 * Verification result with canInstall flag for library consumers
 */
export interface VerificationResult extends InternalResult {
  /**
   * Whether this verification result allows installation.
   * true for publisher_verified and integrity_verified tiers.
   * false for unknown_publisher and failed tiers.
   */
  canInstall: boolean;
}

/**
 * Result from downloading and verifying a remote skill
 */
export interface DownloadAndVerifyResult extends VerificationResult {
  /**
   * Path to the downloaded zip file.
   * Exists if download was successful.
   */
  zipPath?: string;

  /**
   * Path to the downloaded signature file.
   * Exists if download was successful.
   */
  sigPath?: string;

  /**
   * Error message if download failed.
   */
  downloadError?: string;
}

/**
 * Options for downloading and verifying a remote skill
 */
export interface DownloadAndVerifyOptions extends VerifyOptions {
  /**
   * Whether to keep downloaded files after verification.
   * If false (default), files are deleted after verification.
   * If true, files are kept and paths are returned in the result.
   */
  keepFiles?: boolean;
}

/**
 * Add canInstall flag to verification result
 */
function addCanInstall(result: InternalResult): VerificationResult {
  const installCheck = canInstallInternal(result, false);
  return {
    ...result,
    canInstall: installCheck.allowed,
  };
}

/**
 * Verify a signed skill bundle from local files.
 *
 * @param zipPath - Path to the skill zip file
 * @param sigPath - Path to the signature file (.clawid-sig.json)
 * @param options - Verification options
 * @returns Verification result with tier and canInstall flag
 *
 * @example
 * ```typescript
 * const result = await verifySkill('./my-skill.zip', './my-skill.clawid-sig.json');
 * if (result.canInstall) {
 *   console.log('Skill is safe to install');
 * }
 * ```
 */
export async function verifySkill(
  zipPath: string,
  sigPath: string,
  options: VerifyOptions = {}
): Promise<VerificationResult> {
  const result = await verifySkillInternal(zipPath, sigPath, options);
  return addCanInstall(result);
}

/**
 * Download and verify a remote skill.
 *
 * @param skillUrl - URL to the skill zip file
 * @param signatureUrl - URL to signature file (inferred from skillUrl if not provided)
 * @param options - Verification and download options
 * @returns Verification result with download paths
 *
 * @example
 * ```typescript
 * // Verify and keep files
 * const result = await downloadAndVerify(
 *   'https://example.com/skill.zip',
 *   undefined, // Infer signature URL
 *   { keepFiles: true }
 * );
 *
 * if (result.canInstall && result.zipPath) {
 *   // Install from result.zipPath
 * }
 * ```
 */
export async function downloadAndVerify(
  skillUrl: string,
  signatureUrl?: string,
  options: DownloadAndVerifyOptions = {}
): Promise<DownloadAndVerifyResult> {
  // Validate URL
  try {
    new URL(skillUrl);
  } catch {
    return {
      tier: 'failed',
      valid: false,
      hashMatch: false,
      signatureValid: false,
      signerDid: '',
      expectedHash: '',
      actualHash: '',
      hasIdentityProof: false,
      proofVerified: false,
      canInstall: false,
      downloadError: 'Invalid URL provided',
    };
  }

  // Download skill and signature
  const download = await downloadSkillWithSignature(skillUrl, signatureUrl);

  if (!download.success) {
    return {
      tier: 'failed',
      valid: false,
      hashMatch: false,
      signatureValid: false,
      signerDid: '',
      expectedHash: '',
      actualHash: '',
      hasIdentityProof: false,
      proofVerified: false,
      canInstall: false,
      downloadError: download.error,
    };
  }

  // Verify
  const result = await verifyDownloadedSkill(
    download.zipPath!,
    download.sigPath!,
    { offline: options.offline }
  );

  const verificationResult = addCanInstall(result);

  // Clean up if not keeping files
  if (!options.keepFiles) {
    await cleanupDownloads(download.zipPath, download.sigPath);
  }

  return {
    ...verificationResult,
    zipPath: options.keepFiles ? download.zipPath : undefined,
    sigPath: options.keepFiles ? download.sigPath : undefined,
  };
}

/**
 * Infer the signature URL for a skill.
 * For a skill at https://example.com/skill.zip,
 * returns https://example.com/skill.clawid-sig.json
 *
 * @param skillUrl - URL to the skill zip file
 * @returns Inferred signature URL
 */
export { inferSignatureUrl };

/**
 * Installation rules by verification tier:
 *
 * | Tier               | canInstall |
 * |--------------------|------------|
 * | publisher_verified | true       |
 * | integrity_verified | true       |
 * | unknown_publisher  | false      |
 * | failed             | false      |
 *
 * Use the --force flag in CLI or check result.valid to override
 * for unknown_publisher tier.
 */
