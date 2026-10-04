import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rootConfigFile = path.resolve(projectRoot, 'site.config.json');
const frontendConfigFile = path.resolve(projectRoot, 'frontend', 'src', 'site.config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('==================================================');
  console.log('COMMUNIQ - Single Source of Truth Site Configuration');
  console.log('==================================================\n');

  let currentConfig = {
    makerName: "[FILL IN: Organization or Maker Name]",
    physicalAddress: "[FILL IN: Registered Address, City, State, Country, Postal Code]",
    contactEmail: "[FILL IN: contact@yourdomain.com]",
    governingLaw: "[FILL IN: e.g. Laws of India, State of Karnataka]",
    productionDomain: "[FILL IN: https://yourdomain.com]",
    apiDomain: "[FILL IN: https://api.yourdomain.com]"
  };

  if (fs.existsSync(rootConfigFile)) {
    try {
      currentConfig = JSON.parse(fs.readFileSync(rootConfigFile, 'utf-8'));
    } catch {
      // Use defaults
    }
  }

  if (process.argv.includes('--show')) {
    console.log(JSON.stringify(currentConfig, null, 2));
    rl.close();
    return;
  }

  console.log('Press Enter to keep the existing value, or type a new value:\n');

  const makerName = await question(`1. Organization or Maker Name [${currentConfig.makerName}]: `);
  const physicalAddress = await question(`2. Registered Physical Address [${currentConfig.physicalAddress}]: `);
  const contactEmail = await question(`3. Official Contact Email [${currentConfig.contactEmail}]: `);
  const governingLaw = await question(`4. Governing Law and Jurisdiction [${currentConfig.governingLaw}]: `);
  const productionDomain = await question(`5. Production Domain URL [${currentConfig.productionDomain}]: `);
  const apiDomain = await question(`6. API Domain URL [${currentConfig.apiDomain}]: `);

  const newConfig = {
    makerName: makerName.trim() || currentConfig.makerName,
    physicalAddress: physicalAddress.trim() || currentConfig.physicalAddress,
    contactEmail: contactEmail.trim() || currentConfig.contactEmail,
    governingLaw: governingLaw.trim() || currentConfig.governingLaw,
    productionDomain: productionDomain.trim() || currentConfig.productionDomain,
    apiDomain: apiDomain.trim() || currentConfig.apiDomain
  };

  const formatted = JSON.stringify(newConfig, null, 2) + '\n';
  fs.writeFileSync(rootConfigFile, formatted, 'utf-8');
  if (fs.existsSync(path.dirname(frontendConfigFile))) {
    fs.writeFileSync(frontendConfigFile, formatted, 'utf-8');
  }

  console.log('\nConfiguration successfully written to:');
  console.log(`- ${rootConfigFile}`);
  console.log(`- ${frontendConfigFile}`);
  console.log('\nUpdated configuration:');
  console.log(formatted);

  rl.close();
}

main().catch((err) => {
  console.error('Error running setup:site:', err);
  rl.close();
  process.exit(1);
});
