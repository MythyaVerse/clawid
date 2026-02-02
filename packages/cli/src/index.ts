import { Command } from 'commander';
import {
  generateIdentity,
  saveIdentity,
  loadIdentity,
  identityExists,
  getClawIdDir,
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

const program = new Command();

program
  .name('clawid')
  .description('Cryptographic verification for AI agent skills')
  .version('0.1.0');

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
  .action(async (zipPath: string, options) => {
    console.log('🔍 ClawID Skill Verification\n');

    // Determine signature file path
    const sigPath = options.signature || getSignatureFilePath(zipPath);

    try {
      const result = await verifySkill(zipPath, sigPath);
      const display = getTierDisplay(result.tier);

      // Reset color
      const reset = '\x1b[0m';

      console.log(`${display.color}${display.icon} ${display.label}${reset}\n`);

      if (result.valid) {
        console.log(`   Integrity: ✓ Hash matches`);
        console.log(`   Signature: ✓ Valid`);
        console.log(`   Signer: ${result.signerDid}`);

        if (result.hasIdentityProof) {
          console.log(`   Identity: ✓ Verified`);
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

program.parse();
