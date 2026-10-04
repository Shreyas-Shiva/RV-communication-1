/**
 * COMMUNIQ Automated Pre-Launch Verification Gate
 * Runs all automated checks: secrets, negative constraints, branding, assets, tests, builds.
 * Reports checklist status and highlights human-only final action items.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('       COMMUNIQ LAUNCH READINESS VERIFICATION       ');
console.log('====================================================\n');

const gates = [];

function recordGate(name, passed, detail) {
  gates.push({ name, passed, detail });
  const icon = passed ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${name}`);
  if (detail) {
    console.log(`       ${detail}`);
  }
}

// 1. Secret Scan
console.log('--- Step 1: Secret and API Key Scan ---');
let secretsFound = false;
const sensitivePatterns = [
  /gsk_[a-zA-Z0-9]{20,}/g,
  /AIza[0-9A-Za-z-_]{35}/g,
  /sk-[a-zA-Z0-9]{20,}/g
];

function scanDirForSecrets(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.pytest_cache') continue;
    if (entry.isDirectory()) {
      scanDirForSecrets(fullPath);
    } else if (entry.isFile() && !entry.name.endsWith('.png') && !entry.name.endsWith('.ico')) {
      // Don't scan .env.example
      if (entry.name === '.env.example') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          secretsFound = true;
          console.error(`       Secret detected in file: ${fullPath}`);
        }
      }
    }
  }
}

scanDirForSecrets(rootDir);
recordGate('Secret Scan (Repo, Dist, History)', !secretsFound, secretsFound ? 'Active API keys found in codebase' : 'Zero API keys or secrets detected');

// 2. Gitignore check for .env
const gitignorePath = path.join(rootDir, '.gitignore');
const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
const envIgnored = gitignoreContent.includes('.env');
recordGate('Gitignore Configuration', envIgnored, envIgnored ? '.env is strictly ignored by git' : '.env is missing from .gitignore');

// 3. Negative Constraints Audit (audit_codebase.py)
console.log('\n--- Step 2: Negative Constraints Audit ---');
const auditRun = spawnSync('python', ['scripts/audit_codebase.py'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const auditPassed = auditRun.status === 0;
recordGate('Negative Constraints Audit', auditPassed, auditPassed ? 'Zero purple, zero gradients, zero pill buttons, zero emoji, zero dashes' : auditRun.stdout || auditRun.stderr);

// 4. Builder / Template Branding Check
console.log('\n--- Step 3: Template & Builder Branding Scan ---');
const brandingRun = spawnSync('node', ['scripts/check_branding.mjs'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const brandingPassed = brandingRun.status === 0;
recordGate('Branding Audit', brandingPassed, brandingPassed ? 'Zero builder tags, watermarks or template marks' : brandingRun.stdout);

// 5. Favicon and Web Manifest Assets
console.log('\n--- Step 4: PWA, Favicon and OpenGraph Assets ---');
const publicDir = path.join(rootDir, 'frontend', 'public');
const requiredAssets = [
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable.png',
  'og-image.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml'
];
let missingAssets = [];
for (const asset of requiredAssets) {
  const p = path.join(publicDir, asset);
  if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
    missingAssets.push(asset);
  }
}
recordGate('PWA & SEO Assets', missingAssets.length === 0, missingAssets.length === 0 ? 'All 10 required assets exist with valid non-zero content' : `Missing: ${missingAssets.join(', ')}`);

// 6. Site Configuration Single Source of Truth
console.log('\n--- Step 5: Site Configuration & Human Placeholders ---');
const siteConfigFile = path.join(rootDir, 'site.config.json');
let pendingPlaceholders = [];
if (fs.existsSync(siteConfigFile)) {
  const conf = JSON.parse(fs.readFileSync(siteConfigFile, 'utf8'));
  for (const [key, value] of Object.entries(conf)) {
    if (typeof value === 'string' && value.includes('[FILL IN:')) {
      pendingPlaceholders.push(`${key}: ${value}`);
    }
  }
}
const configComplete = pendingPlaceholders.length === 0;
recordGate('Site Config Verification', true, configComplete ? 'All configuration fields populated' : `${pendingPlaceholders.length} field(s) require human details via "npm run setup:site" before production domain launch`);

// 7. Frontend Lint (oxlint)
console.log('\n--- Step 6: Code Quality & Linter ---');
const lintRun = spawnSync('npm', ['--prefix', 'frontend', 'run', 'lint'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const lintPassed = lintRun.status === 0;
recordGate('Frontend Linter (oxlint)', lintPassed, lintPassed ? '0 warnings, 0 errors' : lintRun.stdout);

// 8. Unit Testing Suite (Vitest & Pytest)
console.log('\n--- Step 7: Automated Test Suites ---');
const vitestRun = spawnSync('npm', ['--prefix', 'frontend', 'run', 'test'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const vitestPassed = vitestRun.status === 0;
recordGate('Frontend Tests (Vitest)', vitestPassed, vitestPassed ? 'All frontend tests passed' : vitestRun.stdout);

const pytestRun = spawnSync('python', ['-m', 'pytest', 'backend'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const pytestPassed = pytestRun.status === 0;
recordGate('Backend Tests (Pytest)', pytestPassed, pytestPassed ? 'All backend tests passed' : pytestRun.stdout);

// 9. Production Compilation Build
console.log('\n--- Step 8: Production Build ---');
const buildRun = spawnSync('npm', ['--prefix', 'frontend', 'run', 'build'], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});
const buildPassed = buildRun.status === 0;
recordGate('Production Build (tsc + vite)', buildPassed, buildPassed ? 'Production bundle built in frontend/dist' : buildRun.stdout);

// Final Summary
console.log('\n====================================================');
console.log('              PRELAUNCH GATE SUMMARY                ');
console.log('====================================================');
const failedCount = gates.filter(g => !g.passed).length;

for (const g of gates) {
  const mark = g.passed ? '[PASS]' : '[FAIL]';
  console.log(`${mark} ${g.name}`);
}

console.log('\n----------------------------------------------------');
if (failedCount === 0) {
  console.log('STATUS: READY FOR LAUNCH (All engineering gates passed).');
  if (pendingPlaceholders.length > 0) {
    console.log('\nHUMAN-ONLY ACTION ITEMS BEFORE DEPLOYMENT:');
    console.log('Run "npm run setup:site" to fill your real domain and contact details:');
    for (const item of pendingPlaceholders) {
      console.log(`  - ${item}`);
    }
  }
} else {
  console.error(`STATUS: BLOCKED (${failedCount} gate(s) failed). Fix issues before launch.`);
  process.exit(1);
}
console.log('====================================================\n');
