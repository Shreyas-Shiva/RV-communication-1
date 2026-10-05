import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.resolve(projectRoot, 'frontend');
const screenshotsDir = path.resolve(projectRoot, 'screenshots');

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(frontendDir, 'node_modules', 'playwright'));

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
      // keep waiting
    }
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function ensureOnboardedAndSetPreferences(page, lang, mode, density = 'compact') {
  // If onboarding is visible, complete it first
  const selectEng = page.locator('button[aria-label="Select English"], button:has-text("English")').first();
  if (await selectEng.isVisible({ timeout: 1500 }).catch(() => false)) {
    await selectEng.click();
    await page.waitForTimeout(300);
    const selectAdult = page.locator('button[aria-label*="Adult"], button:has-text("Adults")').first();
    if (await selectAdult.isVisible({ timeout: 1500 }).catch(() => false)) {
      await selectAdult.click();
      await page.waitForTimeout(400);
    }
  }

  // Now set the exact preferences via window.__communiq_db or IndexedDB
  await page.evaluate(async ({ l, m, d }) => {
    const prefData = {
      id: 'current',
      language: l,
      userMode: m,
      screenDensity: d,
      speakOnTap: true,
      wordingForMe: 'neutral',
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
      enableAI: false,
      enableGemini: false,
      demoMode: false
    };

    if (window.__communiq_db) {
      await window.__communiq_db.userPreferences.put(prefData);
      return;
    }

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
  }, { l: lang, m: mode, d: density });

  await page.reload({ waitUntil: 'networkidle' });
}

async function run() {
  console.log('Starting preview server for upgrade verification...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'cmd.exe' : 'npm';
  const npmArgs = isWindows ? ['/c', 'npm', 'run', 'preview', '--', '--port', '4173', '--strictPort'] : ['run', 'preview', '--', '--port', '4173', '--strictPort'];

  const previewServer = spawn(npmCmd, npmArgs, {
    cwd: frontendDir,
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server ready on http://localhost:4173/.');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Initial load to setup database
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    const results = [];

    // -------------------------------------------------------------
    // TEST 1: 1366x768 Adult Mode Card Density & Header Height
    // -------------------------------------------------------------
    {
      await page.setViewportSize({ width: 1366, height: 768 });
      await ensureOnboardedAndSetPreferences(page, 'en', 'adult', 'compact');
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Measure header height
      const headerBox = await page.locator('header').boundingBox();
      const headerHeight = headerBox ? headerBox.height : 999;
      console.log(`[1366x768 Adult] Header height: ${headerHeight}px (Must be <= 56px)`);
      results.push({ name: 'Adult Header <= 56px', pass: headerHeight <= 56.5, val: `${headerHeight}px` });

      // Measure cards visible in initial viewport
      const visibleCardsCount = await page.evaluate(() => {
        const cards = document.querySelectorAll('.card-communiq');
        let count = 0;
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth) {
            count++;
          }
        }
        return count;
      });
      console.log(`[1366x768 Adult] Visible cards in viewport: ${visibleCardsCount} (Target: >= 12)`);
      results.push({ name: 'Adult Cards visible >= 12 at 1366x768', pass: visibleCardsCount >= 12, val: `${visibleCardsCount} cards` });

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      results.push({ name: 'Adult 1366x768 No Horizontal Scroll', pass: !hasHorizontalScroll, val: hasHorizontalScroll ? 'FAILED' : 'PASS' });

      // Check for leaked internal IDs
      const bodyText = await page.locator('body').innerText();
      const hasLeakedId = bodyText.includes('home_place') || bodyText.includes('water_drink') || bodyText.includes('pizza_food');
      results.push({ name: 'No leaked IDs on Communicate page', pass: !hasLeakedId, val: hasLeakedId ? 'LEAKED' : 'CLEAN' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_1366x768_adult_compact.png') });
    }

    // -------------------------------------------------------------
    // TEST 2: 1366x768 Child Mode Card Density
    // -------------------------------------------------------------
    {
      await page.setViewportSize({ width: 1366, height: 768 });
      await ensureOnboardedAndSetPreferences(page, 'en', 'child', 'compact');
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(500);

      const headerBox = await page.locator('header').boundingBox();
      const headerHeight = headerBox ? headerBox.height : 999;
      results.push({ name: 'Child Header <= 56px', pass: headerHeight <= 56.5, val: `${headerHeight}px` });

      const visibleCardsCount = await page.evaluate(() => {
        const cards = document.querySelectorAll('.card-communiq');
        let count = 0;
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            count++;
          }
        }
        return count;
      });
      console.log(`[1366x768 Child] Visible cards in viewport: ${visibleCardsCount} (Target: >= 8)`);
      results.push({ name: 'Child Cards visible >= 8 at 1366x768', pass: visibleCardsCount >= 8, val: `${visibleCardsCount} cards` });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_1366x768_child_compact.png') });
    }

    // -------------------------------------------------------------
    // TEST 3: Defect a (Child mode: tap Yes, verify polite options, NO "I do not like Yes")
    // -------------------------------------------------------------
    {
      // Tap Yes card
      const yesCard = page.locator('button[aria-label="Yes"]').first();
      await yesCard.click();
      await page.waitForTimeout(500);

      const renderedText = await page.locator('body').innerText();
      const hasBadPhrase = renderedText.includes('I do not like Yes') || renderedText.includes('like Yes');
      const hasGoodPhrase = renderedText.includes('Yes, please') || renderedText.includes('Yes, thank you') || renderedText.includes('Yes, I agree');

      console.log(`[Defect a Check] Contains "like Yes": ${hasBadPhrase}. Contains polite confirmation: ${hasGoodPhrase}`);
      results.push({ name: 'Defect a (No "I do not like Yes")', pass: !hasBadPhrase && hasGoodPhrase, val: hasBadPhrase ? 'FAILED' : 'PASS' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_defect_a_yes_options.png') });
    }

    // -------------------------------------------------------------
    // TEST 4: Defect b (Adult mode: feeling Happy, NO "I do not care for Happy")
    // -------------------------------------------------------------
    {
      await ensureOnboardedAndSetPreferences(page, 'en', 'adult', 'compact');
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Select feelings category
      const feelingsCat = page.locator('button:has-text("Feelings")').first();
      if (await feelingsCat.isVisible({ timeout: 2000 }).catch(() => false)) {
        await feelingsCat.click();
        await page.waitForTimeout(300);
      }

      // Tap Happy card
      const happyCard = page.locator('button[aria-label="Happy"]').first();
      if (await happyCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await happyCard.click();
        await page.waitForTimeout(500);
      }

      const renderedText = await page.locator('body').innerText();
      const hasBadPhrase = renderedText.includes('I do not care for Happy') || renderedText.includes('like Happy') || renderedText.includes('want Happy');
      const hasGoodPhrase = renderedText.includes('I am feeling happy') || renderedText.includes('I feel happy') || renderedText.includes('happy');

      console.log(`[Defect b Check] Contains "care for Happy": ${hasBadPhrase}. Contains valid feeling: ${hasGoodPhrase}`);
      results.push({ name: 'Defect b (No "I do not care for Happy")', pass: !hasBadPhrase && hasGoodPhrase, val: hasBadPhrase ? 'FAILED' : 'PASS' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_defect_b_happy_options.png') });
    }

    // -------------------------------------------------------------
    // TEST 5: Defect d (Helper line does NOT read "Where am I? COMMUNIQ Home. What should I tap?")
    // -------------------------------------------------------------
    {
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const homeText = await page.locator('body').innerText();
      const hasDefectD = homeText.includes('Where am I? COMMUNIQ Home. What should I tap?');
      const hasNaturalInstruction = homeText.includes('Choose a card or start a conversation');

      console.log(`[Defect d Check] Contains old helper line: ${hasDefectD}. Contains natural instruction: ${hasNaturalInstruction}`);
      results.push({ name: 'Defect d (Helper line rewritten naturally)', pass: !hasDefectD && hasNaturalInstruction, val: hasDefectD ? 'FAILED' : 'PASS' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_defect_d_home_helper.png') });
    }

    // -------------------------------------------------------------
    // TEST 6: Mobile (390x844) Viewport Test
    // -------------------------------------------------------------
    {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      results.push({ name: 'Mobile 390x844 No Horizontal Scroll', pass: !hasHorizontalScroll, val: hasHorizontalScroll ? 'FAILED' : 'PASS' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_390x844_mobile.png') });
    }

    // -------------------------------------------------------------
    // TEST 7: Review Kit Page (/dev/review)
    // -------------------------------------------------------------
    {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.goto('http://localhost:4173/dev/review', { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const reviewText = await page.locator('body').innerText();
      const hasCombinationsCount = reviewText.includes('14,535');
      results.push({ name: 'Review page tracks 14,535 combinations', pass: hasCombinationsCount, val: hasCombinationsCount ? 'PASS' : 'FAILED' });

      await page.screenshot({ path: path.join(screenshotsDir, 'communiq_dev_review_page.png') });
    }

    await context.close();
    await browser.close();

    console.log('\n==================================================');
    console.log('       FOCUSED UPGRADE VERIFICATION RESULTS       ');
    console.log('==================================================');
    let allPassed = true;
    for (const r of results) {
      console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}: ${r.val}`);
      if (!r.pass) allPassed = false;
    }

    if (!allPassed) {
      process.exit(1);
    }
    console.log('\nAll focused upgrade requirements verified successfully!');
  } finally {
    previewServer.kill();
  }
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
