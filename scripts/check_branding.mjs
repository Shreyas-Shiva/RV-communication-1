import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../frontend/dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

const forbiddenStrings = [
  'made with ai',
  'built with',
  'lovable',
  'v0.dev',
  'bolt.new',
  'builder.io',
  'created with ai',
  'powered by ai',
  'lorem ipsum',
  'placeholder number'
];

let violationsFound = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(html|js|css|json)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lower = content.toLowerCase();

      for (const pattern of forbiddenStrings) {
        if (lower.includes(pattern)) {
          console.error(`Violation: Found forbidden pattern "${pattern}" in ${path.relative(distDir, fullPath)}`);
          violationsFound++;
        }
      }
    }
  }
}

scanDir(distDir);

if (violationsFound > 0) {
  console.error(`check:branding failed: ${violationsFound} branding or template pattern(s) found in /dist.`);
  process.exit(1);
} else {
  console.log('check:branding passed: Zero template or builder branding detected in /dist.');
}
