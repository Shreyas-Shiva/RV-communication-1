import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.resolve(projectRoot, 'frontend');

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(frontendDir, 'node_modules', 'playwright'));

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

function parseRgb(colorStr) {
  if (!colorStr || colorStr === 'transparent') return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1.0;
  if (a < 0.05) return null; // Essentially transparent
  return { r, g, b, a };
}

function rgbToHsl(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h = h * 60;
  }
  return { h, s, l };
}

function classifyHueFamily(h) {
  if (h >= 345 || h < 20) return 'red';
  if (h >= 20 && h < 55) return 'amber_orange';
  if (h >= 55 && h < 85) return 'yellow';
  if (h >= 85 && h < 160) return 'green';
  if (h >= 160 && h < 210) return 'teal_cyan';
  if (h >= 210 && h < 255) return 'blue';
  if (h >= 255 && h < 320) return 'purple_magenta';
  return 'pink_red';
}

async function run() {
  console.log('==================================================');
  console.log('       COMMUNIQ CALM VISUAL SYSTEM AUDIT         ');
  console.log('==================================================\n');

  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'cmd.exe' : 'npm';
  const npmArgs = isWindows
    ? ['/c', 'npm', 'run', 'preview', '--', '--port', '4173', '--strictPort']
    : ['run', 'preview', '--', '--port', '4173', '--strictPort'];

  const previewServer = spawn(npmCmd, npmArgs, {
    cwd: frontendDir,
    stdio: 'ignore'
  });

  let browser;
  let hasFailure = false;

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server online on http://localhost:4173/. Launching Chromium...');

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 });

    // Set onboarding completed
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const prefData = {
        id: 'current',
        language: 'en',
        userMode: 'adult',
        vocabLevel: 3,
        screenDensity: 'compact',
        speakOnTap: true,
        wordingForMe: 'neutral',
        onboardingCompleted: true
      };
      return new Promise((resolve) => {
        const req = indexedDB.open('CommuniqDatabase');
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('userPreferences')) return resolve(false);
          const tx = db.transaction('userPreferences', 'readwrite');
          tx.objectStore('userPreferences').put(prefData);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    });

    const routesToAudit = [
      { name: 'Chat', url: 'http://localhost:4173/' },
      { name: 'Practice', url: 'http://localhost:4173/practice' },
      { name: 'My Day', url: 'http://localhost:4173/myday' },
      { name: 'Settings', url: 'http://localhost:4173/settings' },
      { name: 'Home/Root', url: 'http://localhost:4173/home' }
    ];

    for (const route of routesToAudit) {
      await page.goto(route.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Evaluate visible elements outside Board grid
      const elementsColors = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('*');

        for (const el of all) {
          // Check if element is hidden or zero size
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Ignore elements inside the Board grid (cards naturally have word-class colors)
          if (el.closest('[role="region"][aria-label*="Board"]') || el.closest('.card-communiq') || el.closest('[role="region"][aria-label*="board"]')) {
            continue;
          }

          // Ignore Help button and emergency modals (red is authorized only there)
          if (el.closest('button[aria-label*="Help"]') || el.closest('[role="alertdialog"]')) {
            continue;
          }

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            continue;
          }

          // Capture background color and borders
          results.push({
            bg: style.backgroundColor,
            bt: style.borderTopColor,
            bb: style.borderBottomColor,
            bl: style.borderLeftColor,
            br: style.borderRightColor
          });
        }
        return results;
      });

      const hueFamiliesFound = new Set();
      const detectedDetails = [];

      for (const item of elementsColors) {
        const colorsToCheck = [item.bg, item.bt, item.bb, item.bl, item.br];
        for (const colStr of colorsToCheck) {
          const rgb = parseRgb(colStr);
          if (!rgb) continue;

          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          // Ignore neutrals with saturation under 12% (0.12)
          if (hsl.s < 0.12) continue;

          // Ignore pure white/black extremes
          if (hsl.l < 0.05 || hsl.l > 0.96) continue;

          const family = classifyHueFamily(hsl.h);
          hueFamiliesFound.add(family);
          detectedDetails.push({ hex: `rgb(${rgb.r},${rgb.g},${rgb.b})`, h: Math.round(hsl.h), s: Math.round(hsl.s * 100), family });
        }
      }

      const familiesList = Array.from(hueFamiliesFound);
      console.log(`\nRoute [${route.name}] (${route.url}):`);
      console.log(`  Hue families found outside board grid (${familiesList.length}): ${familiesList.join(', ') || 'None (all neutral)'}`);

      // Part 6 Rule: Fail if more than 3 hue families appear outside the Board grid
      if (familiesList.length > 3) {
        console.error(`  [FAIL] More than 3 hue families detected outside Board grid on ${route.name}!`);
        console.error('  Detected:', detectedDetails.slice(0, 10));
        hasFailure = true;
      } else {
        console.log(`  [PASS] Calm palette verified (<= 3 hue families: ${familiesList.join(', ') || 'All neutral'}).`);
      }
    }
  } catch (err) {
    console.error('Error during calm audit:', err);
    hasFailure = true;
  } finally {
    if (browser) await browser.close();
    previewServer.kill();
  }

  if (hasFailure) {
    console.log('\n[FAIL] Calm visual system audit failed.');
    process.exit(1);
  } else {
    console.log('\n==================================================');
    console.log('   [PASS] CALM VISUAL SYSTEM AUDIT FULLY PASSED   ');
    console.log('==================================================');
    process.exit(0);
  }
}

run();
