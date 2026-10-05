import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendSrc = path.resolve(projectRoot, 'frontend', 'src');

function hexToHsl(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return null;

  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

const HEX_REGEX = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const GRADIENT_REGEX = /(?:bg-gradient-|linear-gradient|radial-gradient|conic-gradient)/i;
const PILL_BUTTON_REGEX = /(?:<button[^>]*rounded-full|className=['"][^'"]*rounded-full[^'"]*['"][^>]*role=['"]button['"])/i;
const NAMED_PURPLE_REGEX = /\b(purple|violet|magenta|indigo)\b/i;

const violations = [];

function scanFile(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. Check gradients
    if (GRADIENT_REGEX.test(line)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: 'GRADIENT',
        detail: `Found gradient: ${line.trim()}`
      });
    }

    // 2. Check pill buttons
    if (PILL_BUTTON_REGEX.test(line)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: 'PILL_BUTTON',
        detail: `Found pill-shaped button (rounded-full): ${line.trim()}`
      });
    }

    // 3. Check named purple words
    const namedMatch = line.match(NAMED_PURPLE_REGEX);
    if (namedMatch) {
      // Ignore if it's in a comment explaining "no purple"
      if (!line.includes('no purple') && !line.includes('No purple') && !line.includes('forbidden')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'FORBIDDEN_COLOR_NAME',
          detail: `Found forbidden color term '${namedMatch[0]}': ${line.trim()}`
        });
      }
    }

    // 4. Check hex codes for hue 250 - 320 degrees
    const hexMatches = line.match(HEX_REGEX);
    if (hexMatches) {
      for (const hex of hexMatches) {
        const hsl = hexToHsl(hex);
        if (hsl && hsl.s >= 0.08) { // Only check if saturation indicates actual color
          if (hsl.h >= 250 && hsl.h <= 320) {
            violations.push({
              file: relativePath,
              line: lineNum,
              type: 'FORBIDDEN_HUE_PURPLE',
              detail: `Found color ${hex} with forbidden hue ${hsl.h} deg (250-320 deg): ${line.trim()}`
            });
          }
        }
      }
    }
  });
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|css|html)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

console.log('==================================================');
console.log('            COMMUNIQ COLOR & SHAPE AUDIT          ');
console.log('==================================================');
console.log(`Scanning directory: ${frontendSrc}`);

walkDir(frontendSrc);

if (violations.length > 0) {
  console.error(`\nFAILED: Found ${violations.length} violations:`);
  for (const v of violations) {
    console.error(`[${v.type}] ${v.file}:${v.line} -> ${v.detail}`);
  }
  process.exit(1);
}

console.log('\n[PASS] Zero forbidden hues (250-320 deg), zero gradients, zero pill buttons found.');
process.exit(0);
