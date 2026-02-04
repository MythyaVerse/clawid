import { Command } from 'commander';
import {
  generateIdentity,
  saveIdentity,
  loadIdentity,
  identityExists,
  getClawIdDir,
  updateIdentityProof,
} from './lib/identity.js';
import {
  signSkill,
  saveSignature,
  getSignatureFilePath,
} from './lib/signing.js';
import {
  verifySkill,
  getTierDisplay,
} from './lib/verification.js';
import {
  generateGithubProofContent,
  generateDomainProofContent,
  createGithubProof,
  createDomainProof,
  buildWellKnownUrl,
  parseGistUrl,
  parseDomainUrl,
} from './lib/proof.js';
import {
  downloadSkillWithSignature,
  verifyDownloadedSkill,
  cleanupDownloads,
  canInstall,
} from './lib/wrap.js';
import { registerSkill } from './lib/registry.js';
import * as readline from 'readline';
import { basename } from 'path';

/**
 * Ask a yes/no question via stdin
 */
function askYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    // If not interactive, default to no
    if (!process.stdin.isTTY) {
      resolve(false);
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

// Re-export library API for programmatic use
export {
  verifySkill,
  downloadAndVerify,
  inferSignatureUrl,
  type VerificationResult,
  type VerificationTier,
  type VerifyOptions,
  type DownloadAndVerifyOptions,
  type DownloadAndVerifyResult,
} from './api.js';

const program = new Command();

program
  .name('clawid')
  .description('Cryptographic verification for AI agent skills')
  .version('0.4.0');

program
  .command('init')
  .description('Generate a new ClawID identity (Ed25519 keypair)')
  .option('-f, --force', 'Overwrite existing identity')
  .action(async (options) => {
    console.log('🔑 ClawID Identity Setup\n');

    // Check if identity already exists
    if (identityExists() && !options.force) {
      const existing = await loadIdentity();
      console.log('⚠️  Identity already exists!\n');
      console.log(`   DID: ${existing?.did}`);
      console.log(`   Created: ${existing?.createdAt}`);
      console.log(`\n   Use --force to overwrite.`);
      process.exit(1);
    }

    console.log('Generating Ed25519 keypair...');
    const identity = await generateIdentity();

    console.log('Saving to ~/.clawid/keypair.json...\n');
    await saveIdentity(identity);

    console.log('✅ Identity created successfully!\n');
    console.log(`   DID: ${identity.did}`);
    console.log(`   Public Key: ${identity.publicKey}`);
    console.log(`   Location: ${getClawIdDir()}/keypair.json`);
    console.log('\n📋 Next steps:');
    console.log('   1. Sign a skill: clawid sign <path-to-skill.zip>');
    console.log('   2. Verify a skill: clawid verify <path-to-skill.zip>');
  });

program
  .command('whoami')
  .description('Show current ClawID identity')
  .action(async () => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    const identity = await loadIdentity();
    console.log('🔑 ClawID Identity\n');
    console.log(`   DID: ${identity?.did}`);
    console.log(`   Public Key: ${identity?.publicKey}`);
    console.log(`   Created: ${identity?.createdAt}`);
  });

program
  .command('sign')
  .description('Sign a skill bundle (zip file)')
  .argument('<path>', 'Path to the skill zip file')
  .option('-o, --output <path>', 'Output path for signature file')
  .option('--register', 'Automatically register to clawid.dev after signing')
  .option('--no-register-prompt', 'Skip the registration prompt')
  .action(async (zipPath: string, options) => {
    console.log('📝 ClawID Skill Signing\n');

    try {
      // Check identity exists
      if (!identityExists()) {
        console.log('❌ No identity found. Run `clawid init` first.');
        process.exit(1);
      }

      console.log(`   Input: ${zipPath}`);

      // Sign the skill
      const sigFile = await signSkill(zipPath);

      // Determine output path
      const outputPath = options.output || getSignatureFilePath(zipPath);

      // Save signature
      await saveSignature(sigFile, outputPath);

      console.log(`\n✅ Skill signed successfully!\n`);
      console.log(`   Hash: ${sigFile.artifact.hash}`);
      console.log(`   Signer: ${sigFile.signer.did}`);
      console.log(`   Signature: ${outputPath}`);

      // Registration prompt/auto-register
      const skillName = basename(zipPath, '.zip');
      let shouldRegister = options.register === true;

      if (!shouldRegister && options.registerPrompt !== false && process.stdin.isTTY) {
        console.log('');
        shouldRegister = await askYesNo('📤 Register this skill to clawid.dev? (y/N) ');
      }

      if (shouldRegister) {
        console.log('\n   Registering to clawid.dev...');
        const result = await registerSkill({
          publisherDid: sigFile.signer.did,
          skillName,
          skillHash: sigFile.artifact.hash,
          signature: sigFile.signature,
          signedAt: sigFile.timestamp,
        });

        if (result.success) {
          console.log('   ✅ Registered successfully!');
          console.log(`   View: https://clawid.dev/api/v1/publisher/${encodeURIComponent(sigFile.signer.did)}/skills`);
        } else {
          console.log(`   ⚠️  Registration failed: ${result.error}`);
        }
      }

      console.log(`\n📋 Share the .clawid-sig.json file alongside your skill bundle.`);
    } catch (error) {
      console.log(`\n❌ Signing failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify a signed skill bundle')
  .argument('<path>', 'Path to the skill zip file')
  .option('-s, --signature <path>', 'Path to signature file (default: <name>.clawid-sig.json)')
  .option('--offline', 'Skip online proof verification')
  .action(async (zipPath: string, options) => {
    console.log('🔍 ClawID Skill Verification\n');

    // Determine signature file path
    const sigPath = options.signature || getSignatureFilePath(zipPath);

    try {
      const result = await verifySkill(zipPath, sigPath, { offline: options.offline });
      const display = getTierDisplay(result.tier);

      // Reset color
      const reset = '\x1b[0m';

      console.log(`${display.color}${display.icon} ${display.label}${reset}\n`);

      if (result.valid) {
        console.log(`   Integrity: ✓ Hash matches`);
        console.log(`   Signature: ✓ Valid`);
        console.log(`   Signer: ${result.signerDid}`);

        if (result.proofVerified && result.proofResult) {
          const proofType = result.proofResult.type === 'github' ? '@' : '';
          console.log(`   Identity: ✓ Verified (${result.proofResult.type}: ${proofType}${result.proofResult.handle})`);
        } else if (result.hasIdentityProof && options.offline) {
          console.log(`   Identity: ⏸ Skipped (offline mode)`);
        } else if (result.hasIdentityProof && result.proofResult?.error) {
          console.log(`   Identity: ✗ Proof failed: ${result.proofResult.error}`);
        } else if (result.hasIdentityProof) {
          console.log(`   Identity: ⚠ Proof present but not verified`);
        } else {
          console.log(`   Identity: ⚠ No proof (review code carefully)`);
        }

        console.log(`\n   ⚠️  This is NOT a safety audit.`);
        process.exit(0);
      } else {
        if (!result.hashMatch) {
          console.log(`   Integrity: ✗ Hash mismatch`);
          console.log(`   Expected: ${result.expectedHash}`);
          console.log(`   Got: ${result.actualHash}`);
        }
        if (!result.signatureValid) {
          console.log(`   Signature: ✗ Invalid`);
        }
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }

        console.log(`\n   🚫 DO NOT INSTALL - verification failed`);
        process.exit(1);
      }
    } catch (error) {
      console.log(`❌ Verification failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Register command (standalone)
program
  .command('register')
  .description('Register a signed skill to clawid.dev')
  .argument('<path>', 'Path to the skill zip file (signature file must exist)')
  .option('-s, --signature <path>', 'Path to signature file (default: <name>.clawid-sig.json)')
  .option('-u, --url <url>', 'Source URL where the skill can be downloaded')
  .action(async (zipPath: string, options) => {
    console.log('📤 ClawID Skill Registration\n');

    try {
      const sigPath = options.signature || getSignatureFilePath(zipPath);

      // Load signature file
      const { loadSignature } = await import('./lib/signing.js');
      const sigFile = await loadSignature(sigPath);

      if (!sigFile) {
        console.log(`❌ Signature file not found: ${sigPath}`);
        console.log('   Sign the skill first: clawid sign <path.zip>');
        process.exit(1);
      }

      const skillName = basename(zipPath, '.zip');

      console.log(`   Skill: ${skillName}`);
      console.log(`   Hash: ${sigFile.artifact.hash}`);
      console.log(`   Publisher: ${sigFile.signer.did}`);

      console.log('\n   Registering to clawid.dev...');

      const result = await registerSkill({
        publisherDid: sigFile.signer.did,
        skillName,
        skillHash: sigFile.artifact.hash,
        sourceUrl: options.url,
        signature: sigFile.signature,
        signedAt: sigFile.timestamp,
      });

      if (result.success) {
        console.log('\n✅ Registered successfully!');
        console.log(`   View: https://clawid.dev/api/v1/publisher/${encodeURIComponent(sigFile.signer.did)}/skills`);
      } else {
        console.log(`\n❌ Registration failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.log(`\n❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Proof commands
const proofCmd = program
  .command('proof')
  .description('Manage identity proofs for publisher verification');

proofCmd
  .command('github')
  .description('Generate content for a GitHub gist identity proof')
  .action(async () => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    const identity = await loadIdentity();
    if (!identity) {
      console.log('❌ Failed to load identity.');
      process.exit(1);
    }

    const content = generateGithubProofContent(identity.did, identity.publicKey);

    console.log('📋 GitHub Gist Identity Proof\n');
    console.log('To verify your identity as a publisher:\n');
    console.log('1. Go to https://gist.github.com/');
    console.log('2. Create a new PUBLIC gist');
    console.log('3. Name the file: clawid.json');
    console.log('4. Paste this content:\n');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    console.log('\n5. Save the gist and copy its URL');
    console.log('6. Run: clawid proof add github <gist-url>\n');
  });

proofCmd
  .command('domain')
  .description('Generate content for a domain-based identity proof')
  .argument('[domain]', 'Your domain name (e.g., example.com)')
  .action(async (domain?: string) => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    const identity = await loadIdentity();
    if (!identity) {
      console.log('❌ Failed to load identity.');
      process.exit(1);
    }

    const content = generateDomainProofContent(identity.did, identity.publicKey);

    console.log('🌐 Domain Identity Proof\n');
    console.log('To verify your identity as a publisher:\n');
    console.log('1. Create the file: .well-known/clawid.json on your domain');
    if (domain) {
      console.log(`   URL: ${buildWellKnownUrl(domain)}`);
    }
    console.log('2. Add this content:\n');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    if (domain) {
      console.log(`\n3. Run: clawid proof add domain ${buildWellKnownUrl(domain)}\n`);
    } else {
      console.log('\n3. Run: clawid proof add domain https://yourdomain.com/.well-known/clawid.json\n');
    }
  });

proofCmd
  .command('add')
  .description('Add an identity proof to your keypair')
  .argument('<type>', 'Proof type: github or domain')
  .argument('<url>', 'URL to the proof (gist URL or .well-known URL)')
  .action(async (type: string, url: string) => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    if (type !== 'github' && type !== 'domain') {
      console.log(`❌ Invalid proof type: ${type}`);
      console.log('   Valid types: github, domain');
      process.exit(1);
    }

    let proof;
    if (type === 'github') {
      proof = createGithubProof(url);
      if (!proof) {
        console.log('❌ Invalid GitHub gist URL');
        console.log('   Expected: https://gist.github.com/username/gistid');
        process.exit(1);
      }
      const parsed = parseGistUrl(url);
      console.log(`\n📋 Adding GitHub proof for @${parsed?.owner}`);
    } else {
      proof = createDomainProof(url);
      if (!proof) {
        console.log('❌ Invalid domain proof URL');
        console.log('   Expected: https://example.com/.well-known/clawid.json');
        process.exit(1);
      }
      const domain = parseDomainUrl(url);
      console.log(`\n🌐 Adding domain proof for ${domain}`);
    }

    try {
      await updateIdentityProof(proof);
      console.log('✅ Proof added to identity!\n');
      console.log('   Your signatures will now include this proof.');
      console.log('   Verifiers can check your identity using this proof.\n');
      console.log('⚠️  Note: The proof URL must be publicly accessible');
      console.log('   for verification to succeed.');
    } catch (error) {
      console.log(`❌ Failed to add proof: ${(error as Error).message}`);
      process.exit(1);
    }
  });

proofCmd
  .command('remove')
  .description('Remove identity proof from your keypair')
  .action(async () => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    const identity = await loadIdentity();
    if (!identity?.proof) {
      console.log('ℹ️  No proof configured.');
      process.exit(0);
    }

    // Import removeIdentityProof dynamically to avoid circular import issues
    const { removeIdentityProof } = await import('./lib/identity.js');
    await removeIdentityProof();
    console.log('✅ Proof removed from identity.');
  });

proofCmd
  .command('show')
  .description('Show current identity proof configuration')
  .action(async () => {
    if (!identityExists()) {
      console.log('❌ No identity found. Run `clawid init` first.');
      process.exit(1);
    }

    const identity = await loadIdentity();
    console.log('🔑 Identity Proof Status\n');

    if (!identity?.proof) {
      console.log('   Status: No proof configured');
      console.log('\n   Run `clawid proof github` or `clawid proof domain` to set up.');
    } else {
      console.log(`   Type: ${identity.proof.type}`);
      if (identity.proof.handle) {
        console.log(`   Handle: ${identity.proof.type === 'github' ? '@' : ''}${identity.proof.handle}`);
      }
      if (identity.proof.domain) {
        console.log(`   Domain: ${identity.proof.domain}`);
      }
      console.log(`   URL: ${identity.proof.url}`);
    }
  });

// Wrap command
const wrapCmd = program
  .command('wrap')
  .description('Download and verify skills before installation');

wrapCmd
  .command('install')
  .description('Download, verify, and prepare a skill for installation')
  .argument('<url>', 'URL to the skill zip file')
  .option('-s, --signature <url>', 'URL to signature file (default: inferred from skill URL)')
  .option('--force', 'Install even if publisher is unknown')
  .option('--offline', 'Skip online proof verification')
  .action(async (skillUrl: string, options) => {
    console.log('📦 ClawID Skill Installation\n');

    try {
      // Download skill and signature
      console.log('⬇️  Downloading...');
      const download = await downloadSkillWithSignature(skillUrl, options.signature);

      if (!download.success) {
        console.log(`\n❌ Download failed: ${download.error}`);
        process.exit(1);
      }

      // Verify
      console.log('\n🔍 Verifying...');
      const result = await verifyDownloadedSkill(
        download.zipPath!,
        download.sigPath!,
        { offline: options.offline }
      );

      const display = getTierDisplay(result.tier);
      const reset = '\x1b[0m';
      console.log(`\n${display.color}${display.icon} ${display.label}${reset}\n`);

      if (result.valid) {
        console.log(`   Integrity: ✓ Hash matches`);
        console.log(`   Signature: ✓ Valid`);
        console.log(`   Signer: ${result.signerDid}`);

        if (result.proofVerified && result.proofResult) {
          const proofType = result.proofResult.type === 'github' ? '@' : '';
          console.log(`   Identity: ✓ Verified (${result.proofResult.type}: ${proofType}${result.proofResult.handle})`);
        } else if (result.hasIdentityProof && options.offline) {
          console.log(`   Identity: ⏸ Skipped (offline mode)`);
        } else if (result.hasIdentityProof && result.proofResult?.error) {
          console.log(`   Identity: ✗ Proof failed: ${result.proofResult.error}`);
        } else {
          console.log(`   Identity: ⚠ No proof (unknown publisher)`);
        }
      }

      // Check if installation is allowed
      const installCheck = canInstall(result, options.force);

      if (!installCheck.allowed) {
        console.log(`\n🚫 Installation blocked: ${installCheck.reason}`);
        await cleanupDownloads(download.zipPath, download.sigPath);
        process.exit(1);
      }

      // Installation allowed
      console.log('\n✅ Verification passed!');
      console.log(`\n   Skill ready at: ${download.zipPath}`);
      console.log(`   Signature at: ${download.sigPath}`);
      console.log('\n   ⚠️  This is NOT a safety audit. Review code before use.');

    } catch (error) {
      console.log(`\n❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

wrapCmd
  .command('verify')
  .description('Download and verify a skill without installing')
  .argument('<url>', 'URL to the skill zip file')
  .option('-s, --signature <url>', 'URL to signature file (default: inferred from skill URL)')
  .option('--offline', 'Skip online proof verification')
  .action(async (skillUrl: string, options) => {
    console.log('🔍 ClawID Remote Skill Verification\n');

    try {
      // Download skill and signature
      console.log('⬇️  Downloading...');
      const download = await downloadSkillWithSignature(skillUrl, options.signature);

      if (!download.success) {
        console.log(`\n❌ Download failed: ${download.error}`);
        process.exit(1);
      }

      // Verify
      console.log('\n🔍 Verifying...');
      const result = await verifyDownloadedSkill(
        download.zipPath!,
        download.sigPath!,
        { offline: options.offline }
      );

      const display = getTierDisplay(result.tier);
      const reset = '\x1b[0m';
      console.log(`\n${display.color}${display.icon} ${display.label}${reset}\n`);

      if (result.valid) {
        console.log(`   Integrity: ✓ Hash matches`);
        console.log(`   Signature: ✓ Valid`);
        console.log(`   Signer: ${result.signerDid}`);

        if (result.proofVerified && result.proofResult) {
          const proofType = result.proofResult.type === 'github' ? '@' : '';
          console.log(`   Identity: ✓ Verified (${result.proofResult.type}: ${proofType}${result.proofResult.handle})`);
        } else if (result.hasIdentityProof && options.offline) {
          console.log(`   Identity: ⏸ Skipped (offline mode)`);
        } else if (result.hasIdentityProof && result.proofResult?.error) {
          console.log(`   Identity: ✗ Proof failed: ${result.proofResult.error}`);
        } else {
          console.log(`   Identity: ⚠ No proof (unknown publisher)`);
        }
      } else {
        if (!result.hashMatch) {
          console.log(`   Integrity: ✗ Hash mismatch`);
        }
        if (!result.signatureValid) {
          console.log(`   Signature: ✗ Invalid`);
        }
      }

      // Clean up
      await cleanupDownloads(download.zipPath, download.sigPath);

      console.log('\n   ⚠️  This is NOT a safety audit.');
      process.exit(result.valid ? 0 : 1);

    } catch (error) {
      console.log(`\n❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
