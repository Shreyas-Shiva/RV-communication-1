import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const frontendDir = path.resolve(projectRoot, 'frontend');
const screenshotsDir = path.resolve(projectRoot, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

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

async function setPreferences(page, lang, mode) {
  await page.evaluate(async ({ l, m }) => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('CommuniqDatabase');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('userPreferences', 'readwrite');
        const store = tx.objectStore('userPreferences');
        store.put({
          id: 'current',
          language: l,
          userMode: m,
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
  }, { l: lang, m: mode });
  await page.reload({ waitUntil: 'networkidle' });
}

async function main() {
  console.log('Starting Vite preview server on port 4173...');
  const previewProcess = spawn('npm.cmd', ['run', 'preview', '--', '--port', '4173', '--strictPort'], {
    cwd: frontendDir,
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server is active.');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Initial load
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const viewports = [
      { name: 'phone', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 }
    ];

    const languages = ['en', 'kn', 'hi'];

    let axeViolationsCount = 0;

    // 1. Capture Homes across modes, languages, and viewports
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const lang of languages) {
        // Child Mode
        await setPreferences(page, lang, 'child');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);
        const childPath = path.join(screenshotsDir, `home_child_${lang}_${vp.name}.png`);
        await page.screenshot({ path: childPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(childPath)}`);

        // Axe check on Child Home (Desktop only to prevent redundant runs)
        if (vp.name === 'desktop' && lang === 'en') {
          const axeResults = await new AxeBuilder({ page }).analyze();
          if (axeResults.violations.length > 0) {
            console.error('Axe violations found on Child Home:');
            for (const v of axeResults.violations) {
              console.error(`- [${v.id}] ${v.help}`);
              for (const n of v.nodes) {
                console.error(`    Target: ${JSON.stringify(n.target)}, HTML: ${n.html}, Failure: ${n.failureSummary}`);
              }
            }
            axeViolationsCount += axeResults.violations.length;
          } else {
            console.log('Axe Accessibility check passed: Child Home.');
          }
        }

        // Student Mode
        await setPreferences(page, lang, 'student');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const studentPath = path.join(screenshotsDir, `home_student_${lang}_${vp.name}.png`);
        await page.screenshot({ path: studentPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(studentPath)}`);

        // Adult Mode
        await setPreferences(page, lang, 'adult');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const adultPath = path.join(screenshotsDir, `home_adult_${lang}_${vp.name}.png`);
        await page.screenshot({ path: adultPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(adultPath)}`);

        // Quick Communicate Page
        await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const commPath = path.join(screenshotsDir, `communicate_${lang}_${vp.name}.png`);
        await page.screenshot({ path: commPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(commPath)}`);

        // My Day Page
        await page.goto('http://localhost:4173/myDay', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const myDayPath = path.join(screenshotsDir, `myday_${lang}_${vp.name}.png`);
        await page.screenshot({ path: myDayPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(myDayPath)}`);

        // Privacy Policy Page
        await page.goto('http://localhost:4173/privacy', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const privacyPath = path.join(screenshotsDir, `privacy_${lang}_${vp.name}.png`);
        await page.screenshot({ path: privacyPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(privacyPath)}`);

        // Terms of Use Page
        await page.goto('http://localhost:4173/terms', { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const termsPath = path.join(screenshotsDir, `terms_${lang}_${vp.name}.png`);
        await page.screenshot({ path: termsPath, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(termsPath)}`);
      }
    }

    // Design Gallery Screenshot
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:4173/design', { waitUntil: 'networkidle' });
    const designPath = path.join(screenshotsDir, `design_showcase_desktop.png`);
    await page.screenshot({ path: designPath, fullPage: true });
    console.log(`Saved screenshot: ${path.basename(designPath)}`);

    // Axe check on Design page
    const axeDesignResults = await new AxeBuilder({ page }).analyze();
    if (axeDesignResults.violations.length > 0) {
      console.error('Axe violations on Design Gallery:');
      for (const v of axeDesignResults.violations) {
        console.error(`- [${v.id}] ${v.help}`);
        for (const n of v.nodes) {
          console.error(`    Target: ${JSON.stringify(n.target)}, HTML: ${n.html}, Failure: ${n.failureSummary}`);
        }
      }
      axeViolationsCount += axeDesignResults.violations.length;
    } else {
      console.log('Axe Accessibility check passed: Design Gallery.');
    }

    await browser.close();

    if (axeViolationsCount > 0) {
      console.error(`Total Axe Accessibility violations: ${axeViolationsCount}`);
      process.exit(1);
    } else {
      console.log('ALL SCREENSHOTS CAPTURED AND AXE AUDIT PASSED WITH ZERO VIOLATIONS.');
    }
  } finally {
    previewProcess.kill();
  }
}

main().catch(err => {
  console.error('Error during screenshots and axe run:', err);
  process.exit(1);
});
