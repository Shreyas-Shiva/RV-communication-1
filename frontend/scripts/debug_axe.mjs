import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const frontendDir = path.resolve(projectRoot, 'frontend');

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // Keep waiting
    }
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function main() {
  const previewProcess = spawn('npm.cmd', ['run', 'preview', '--', '--port', '4173', '--strictPort'], {
    cwd: frontendDir,
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:4173/');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // Set child mode
    await page.evaluate(async () => {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('CommuniqDatabase');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('userPreferences', 'readwrite');
          const store = tx.objectStore('userPreferences');
          store.put({
            id: 'current',
            language: 'en',
            userMode: 'child',
            onboardingCompleted: true,
            speechRate: 1.0,
            speechPitch: 1.0,
            voiceURI: '',
            textSize: 'normal',
            buttonSize: 'normal',
            highContrast: false,
            darkMode: false,
            reducedMotion: false,
            soundEffects: true,
            largeAndSimple: false,
            parentConsentGiven: true,
            dailyStreak: 3,
            starsCount: 8
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        };
      });
    });

    await page.reload({ waitUntil: 'networkidle' });
    const axeChild = await new AxeBuilder({ page }).analyze();
    console.log('=== CHILD HOME VIOLATIONS ===');
    for (const v of axeChild.violations) {
      console.log(`[${v.id}] ${v.help}`);
      for (const node of v.nodes) {
        console.log('  Target:', JSON.stringify(node.target));
        console.log('  HTML:', node.html);
        console.log('  Failure:', node.failureSummary);
      }
    }

    // Check Design page
    await page.goto('http://localhost:4173/design', { waitUntil: 'networkidle' });
    const axeDesign = await new AxeBuilder({ page }).analyze();
    console.log('\n=== DESIGN PAGE VIOLATIONS ===');
    for (const v of axeDesign.violations) {
      console.log(`[${v.id}] ${v.help}`);
      for (const node of v.nodes) {
        console.log('  Target:', JSON.stringify(node.target));
        console.log('  HTML:', node.html);
        console.log('  Failure:', node.failureSummary);
      }
    }

    await context.close();
    await browser.close();
  } finally {
    try {
      previewProcess.kill();
    } catch {
      // ignore
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
