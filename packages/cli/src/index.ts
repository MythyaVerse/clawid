import { Command } from 'commander';
import {
  generateIdentity,
  saveIdentity,
  loadIdentity,
  identityExists,
  getClawIdDir,
} from './lib/identity.js';

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
  .action(async (path: string) => {
    console.log(`📝 Signing: ${path}`);
    // TODO: Implement signing
    console.log('⚠️  Not yet implemented. Coming soon!');
  });

program
  .command('verify')
  .description('Verify a signed skill bundle')
  .argument('<path>', 'Path to the skill zip file')
  .action(async (path: string) => {
    console.log(`🔍 Verifying: ${path}`);
    // TODO: Implement verification
    console.log('⚠️  Not yet implemented. Coming soon!');
  });

program.parse();
