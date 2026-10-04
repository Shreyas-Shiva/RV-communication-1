import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(frontendDir, '..');
const screenshotsDir = path.resolve(projectRoot, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // Keep waiting
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function setPreferences(page, lang, mode, enableAI = false) {
  await page.evaluate(
    async ({ l, m, ai }) => {
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
            starsCount: 8,
            enableAI: ai,
            enableGemini: false,
            demoMode: false
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        };
      });
    },
    { l: lang, m: mode, ai: enableAI }
  );
  await page.reload({ waitUntil: 'networkidle' });
}

async function main() {
  console.log('Starting Vite preview server on port 4173...');
  const previewProcess = spawn('cmd.exe', ['/c', 'npm', 'run', 'preview', '--', '--port', '4173', '--strictPort'], {
    cwd: frontendDir,
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server is active.');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Initial load to setup database
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const viewports = [
      { name: 'phone', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 850 }
    ];

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'kn', name: 'Kannada' },
      { code: 'hi', name: 'Hindi' }
    ];

    let axeViolationsCount = 0;

    // 1. Audit Talk / Conversation Mode across viewports & languages
    console.log('\n--- Auditing Talk Screen (Conversation Mode) ---');
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const lang of languages) {
        // Child Mode
        await setPreferences(page, lang.code, 'child', false);
        await page.goto('http://localhost:4173/talk', { waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        const childShot = path.join(screenshotsDir, `phase2_talk_child_${lang.code}_${vp.name}.png`);
        await page.screenshot({ path: childShot, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(childShot)}`);

        // Adult Mode
        await setPreferences(page, lang.code, 'adult', false);
        await page.goto('http://localhost:4173/talk', { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);

        const adultShot = path.join(screenshotsDir, `phase2_talk_adult_${lang.code}_${vp.name}.png`);
        await page.screenshot({ path: adultShot, fullPage: true });
        console.log(`Saved screenshot: ${path.basename(adultShot)}`);

        // Run Axe accessibility check on Talk desktop
        if (vp.name === 'desktop') {
          const axeTalk = await new AxeBuilder({ page }).analyze();
          if (axeTalk.violations.length > 0) {
            console.error(`Axe violations on Talk Page (${lang.name} desktop):`, axeTalk.violations);
            axeViolationsCount += axeTalk.violations.length;
          } else {
            console.log(`Axe Accessibility check PASSED: Talk Page (${lang.name} desktop).`);
          }
        }
      }
    }

    // 2. Audit Settings Page with Service Status and Consent
    console.log('\n--- Auditing Settings Page ---');
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setPreferences(page, 'en', 'adult', false);
      await page.goto('http://localhost:4173/settings', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const settingsShot = path.join(screenshotsDir, `phase2_settings_en_${vp.name}.png`);
      await page.screenshot({ path: settingsShot, fullPage: true });
      console.log(`Saved screenshot: ${path.basename(settingsShot)}`);

      if (vp.name === 'desktop') {
        const axeSettings = await new AxeBuilder({ page }).analyze();
        if (axeSettings.violations.length > 0) {
          console.error('Axe violations on Settings Page:', axeSettings.violations);
          axeViolationsCount += axeSettings.violations.length;
        } else {
          console.log('Axe Accessibility check PASSED: Settings Page.');
        }
      }
    }

    // 3. Audit My Day Page with Conversation Threads
    console.log('\n--- Auditing My Day Page with Threads ---');
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setPreferences(page, 'en', 'adult', false);
      await page.goto('http://localhost:4173/myDay', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const myDayShot = path.join(screenshotsDir, `phase2_myday_threads_en_${vp.name}.png`);
      await page.screenshot({ path: myDayShot, fullPage: true });
      console.log(`Saved screenshot: ${path.basename(myDayShot)}`);

      if (vp.name === 'desktop') {
        const axeMyDay = await new AxeBuilder({ page }).analyze();
        if (axeMyDay.violations.length > 0) {
          console.error('Axe violations on My Day Page:', axeMyDay.violations);
          axeViolationsCount += axeMyDay.violations.length;
        } else {
          console.log('Axe Accessibility check PASSED: My Day Page.');
        }
      }
    }

    // 4. Keyboard Navigation Test on Talk Page
    console.log('\n--- Testing Keyboard Accessibility on Talk Screen ---');
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('http://localhost:4173/talk', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Keyboard tab focus successfully navigated to: <${focusedTag}>`);

    await browser.close();

    if (axeViolationsCount > 0) {
      console.error(`\nFAILED: Found ${axeViolationsCount} accessibility violations.`);
      process.exit(1);
    } else {
      console.log('\nALL PHASE 2 SCREENSHOTS CAPTURED AND AXE AUDIT PASSED WITH ZERO VIOLATIONS!');
    }
  } finally {
    previewProcess.kill();
  }
}

main().catch((err) => {
  console.error('Error during Phase 2 audit:', err);
  process.exit(1);
});
