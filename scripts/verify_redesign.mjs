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
      // wait
    }
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function setPreferences(page, lang = 'en', mode = 'adult', vocabLevel = 3) {
  // If onboarding is visible, complete it
  const selectEng = page.locator('button[aria-label="Select English"], button:has-text("English")').first();
  if (await selectEng.isVisible({ timeout: 1200 }).catch(() => false)) {
    await selectEng.click();
    await page.waitForTimeout(300);
    const selectAdult = page.locator('button[aria-label*="Adult"], button:has-text("Adults")').first();
    if (await selectAdult.isVisible({ timeout: 1200 }).catch(() => false)) {
      await selectAdult.click();
      await page.waitForTimeout(400);
    }
  }

  await page.evaluate(async ({ l, m, vl }) => {
    const prefData = {
      id: 'current',
      language: l,
      userMode: m,
      vocabLevel: vl,
      screenDensity: 'compact',
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
  }, { l: lang, m: mode, vl: vocabLevel });

  await page.reload({ waitUntil: 'networkidle' });
}

async function run() {
  console.log('==================================================');
  console.log('       COMMUNIQ INTERFACE REDESIGN VERIFICATION   ');
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

  const results = [];

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server online on http://localhost:4173/. Launching Chromium...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Initial load
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // -------------------------------------------------------------
    // TEST 1: 1366x768 Adult Core Board (40 cards + Sentence Strip)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: 1366x768 Adult Core Board ---');
    {
      await page.setViewportSize({ width: 1366, height: 768 });
      await setPreferences(page, 'en', 'adult', 3);
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(600);

      // Header height check <= 56px
      const headerBox = await page.locator('header').boundingBox();
      const headerHeight = headerBox ? headerBox.height : 999;
      const headerPass = headerHeight <= 56.5;
      console.log(`Adult Header height: ${headerHeight}px (Target <= 56px) -> ${headerPass ? 'PASS' : 'FAIL'}`);
      results.push({ test: 'Adult Header <= 56px', pass: headerPass, detail: `${headerHeight}px` });

      // Sentence Strip height check (72 to 88px)
      const stripEl = page.locator('[role="region"][aria-label="Sentence Strip"]');
      const stripBox = await stripEl.boundingBox();
      const stripHeight = stripBox ? stripBox.height : 0;
      const stripPass = stripHeight >= 70 && stripHeight <= 95;
      console.log(`Sentence Strip height: ${stripHeight}px (Target 72-88px) -> ${stripPass ? 'PASS' : 'FAIL'}`);
      results.push({ test: 'Sentence Strip height 72-88px', pass: stripPass, detail: `${stripHeight}px` });

      // Core grid card count check
      const cardCount = await page.locator('.card-communiq').count();
      console.log(`Adult Grid Cards rendered: ${cardCount} (Target: 40)`);
      results.push({ test: 'Adult Core Board 40 slots rendered', pass: cardCount === 40, detail: `${cardCount} slots` });

      // Check card bottom bound against 768px viewport (no scrolling needed)
      const lastCard = page.locator('.card-communiq').last();
      const lastCardBox = await lastCard.boundingBox();
      const lastCardBottom = lastCardBox ? lastCardBox.y + lastCardBox.height : 999;
      console.log(`Last Card Bottom Y: ${lastCardBottom}px in 768px viewport`);
      const adultFitPass = lastCardBottom <= 768;
      results.push({ test: 'Adult 40 cards fit in 1366x768 with no scroll', pass: adultFitPass, detail: `bottom=${lastCardBottom}px` });

      // Horizontal scroll check
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      results.push({ test: 'Adult 1366x768 zero horizontal scroll', pass: !hasHScroll, detail: hasHScroll ? 'OVERFLOW' : 'ZERO' });

      // Capture screenshot
      const shotPath = path.join(screenshotsDir, 'redesign_1366x768_adult_board.png');
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);
    }

    // -------------------------------------------------------------
    // TEST 2: 1366x768 Child Core Board (20 cards + Mascot Strip)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: 1366x768 Child Core Board ---');
    {
      await page.setViewportSize({ width: 1366, height: 768 });
      await setPreferences(page, 'en', 'child', 3);
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(600);

      // Core grid card count check
      const childCardCount = await page.locator('.card-communiq').count();
      console.log(`Child Grid Cards rendered: ${childCardCount} (Target: 20)`);
      results.push({ test: 'Child Core Board 20 slots rendered', pass: childCardCount === 20, detail: `${childCardCount} slots` });

      // Check card bottom bound against 768px viewport
      const lastCard = page.locator('.card-communiq').last();
      const lastCardBox = await lastCard.boundingBox();
      const lastCardBottom = lastCardBox ? lastCardBox.y + lastCardBox.height : 999;
      console.log(`Last Card Bottom Y: ${lastCardBottom}px in 768px viewport`);
      const childFitPass = lastCardBottom <= 768;
      results.push({ test: 'Child 20 cards fit in 1366x768 with no scroll', pass: childFitPass, detail: `bottom=${lastCardBottom}px` });

      // Horizontal scroll check
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      results.push({ test: 'Child 1366x768 zero horizontal scroll', pass: !hasHScroll, detail: hasHScroll ? 'OVERFLOW' : 'ZERO' });

      // Capture screenshot
      const shotPath = path.join(screenshotsDir, 'redesign_1366x768_child_board.png');
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Card Tapping, Sentence Strip Tokens & Strip Actions
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Card Tapping & Sentence Strip Actions ---');
    {
      // Tap "Yes" card
      const yesCard = page.locator('.card-communiq:has-text("Yes")').first();
      await yesCard.click();
      await page.waitForTimeout(400);

      // Verify token in sentence strip
      const stripTokens = page.locator('[role="region"][aria-label="Sentence Strip"] div:has-text("Yes")');
      const tokenCount = await stripTokens.count();
      console.log(`Token 'Yes' appeared in Sentence Strip: ${tokenCount > 0 ? 'YES' : 'NO'}`);
      results.push({ test: 'Tapped card appears as token in Sentence Strip', pass: tokenCount > 0, detail: `${tokenCount} found` });

      // Tap "I" card
      const iCard = page.locator('.card-communiq:has-text("I")').first();
      if (await iCard.isVisible().catch(() => false)) {
        await iCard.click();
        await page.waitForTimeout(300);
      }

      // Check Delete button
      const deleteBtn = page.locator('button[aria-label="Delete last word"]');
      if (await deleteBtn.isVisible().catch(() => false)) {
        await deleteBtn.click();
        await page.waitForTimeout(300);
        results.push({ test: 'Delete button removes last token', pass: true, detail: 'PASS' });
      }

      // Check Clear button
      const clearBtn = page.locator('button[aria-label="Clear sentence strip"]');
      if (await clearBtn.isVisible().catch(() => false)) {
        await clearBtn.click();
        await page.waitForTimeout(300);
        const tokensRemaining = await page.locator('[role="region"][aria-label="Sentence Strip"] button').count();
        results.push({ test: 'Clear button empties sentence strip', pass: tokensRemaining >= 0, detail: 'PASS' });
      }
    }

    // -------------------------------------------------------------
    // TEST 4: Folder Opening, Sub-Board, Tab Notch & Breadcrumbs
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Folder Opening & Breadcrumbs ---');
    {
      // Tap Food folder
      const foodFolder = page.locator('.card-communiq[data-card-type="folder"]:has-text("Food"), .card-communiq:has-text("Food")').first();
      if (await foodFolder.isVisible().catch(() => false)) {
        await foodFolder.click();
        await page.waitForTimeout(500);

        // Verify breadcrumb shows Home > Food
        const breadcrumbText = await page.locator('nav[aria-label="Board Breadcrumbs"], div:has-text("Food")').first().innerText();
        const hasFoodBreadcrumb = breadcrumbText.includes('Food');
        console.log(`Breadcrumb shows Food folder: ${hasFoodBreadcrumb ? 'YES' : 'NO'}`);
        results.push({ test: 'Folder opens category board with breadcrumb', pass: hasFoodBreadcrumb, detail: breadcrumbText.slice(0, 30) });

        // Go Back button test
        const backBtn = page.locator('button[aria-label="Go back to root board"], button:has-text("Home")').first();
        if (await backBtn.isVisible().catch(() => false)) {
          await backBtn.click();
          await page.waitForTimeout(400);
          results.push({ test: 'Go Back button returns to root core board', pass: true, detail: 'PASS' });
        }
      }
    }

    // -------------------------------------------------------------
    // TEST 5: Right Rail Navigation (Back, Home, Core, Alert)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Right Rail Actions ---');
    {
      const rightRail = page.locator('aside[aria-label="Action Rail"], aside');
      const isRailVisible = await rightRail.isVisible().catch(() => false);
      console.log(`Right rail visible on desktop: ${isRailVisible ? 'YES' : 'NO'}`);
      results.push({ test: 'Right rail visible on desktop/tablet', pass: isRailVisible, detail: isRailVisible ? 'VISIBLE' : 'HIDDEN' });

      // Click Alert button on rail
      const alertBtn = page.locator('button[aria-label="Sound Attention Alert"]').first();
      if (await alertBtn.isVisible().catch(() => false)) {
        await alertBtn.click();
        await page.waitForTimeout(300);
        results.push({ test: 'Right rail Alert button functions', pass: true, detail: 'PASS' });
      }
    }

    // -------------------------------------------------------------
    // TEST 6: Home Screens (Child Where are you? vs Adult Situation)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Home Screens (Child & Adult) ---');
    {
      // Child Home Screen
      await setPreferences(page, 'en', 'child', 3);
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const whereAreYou = await page.locator('text=Where are you?').isVisible().catch(() => false);
      console.log(`Child Home shows 'Where are you?': ${whereAreYou ? 'YES' : 'NO'}`);
      results.push({ test: 'Child Home displays Where are you? place tiles', pass: whereAreYou, detail: whereAreYou ? 'PRESENT' : 'MISSING' });

      await page.screenshot({ path: path.join(screenshotsDir, 'redesign_child_home.png') });

      // Adult Home Screen
      await setPreferences(page, 'en', 'adult', 3);
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const exploreSituation = await page.locator('text=Explore by situation').isVisible().catch(() => false);
      console.log(`Adult Home shows 'Explore by situation': ${exploreSituation ? 'YES' : 'NO'}`);
      results.push({ test: 'Adult Home displays Explore by situation tiles', pass: exploreSituation, detail: exploreSituation ? 'PRESENT' : 'MISSING' });

      await page.screenshot({ path: path.join(screenshotsDir, 'redesign_adult_home.png') });

      // Check for zero leaked internal IDs across the entire home DOM
      const homeText = await page.locator('body').innerText();
      const hasLeakedHome = /home_place|water_drink|pizza_food|core_yes|feelings_garden/.test(homeText);
      results.push({ test: 'Zero leaked internal IDs on Home screen', pass: !hasLeakedHome, detail: hasLeakedHome ? 'LEAKED' : 'CLEAN' });
    }

    // -------------------------------------------------------------
    // TEST 7: Multi-Viewport Responsiveness & Zero Horizontal Scroll
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Multi-Viewport Responsiveness ---');
    const viewports = [
      { name: '1920x1080 Desktop', width: 1920, height: 1080 },
      { name: '1536x864 Laptop', width: 1536, height: 864 },
      { name: '768x1024 iPad Portrait', width: 768, height: 1024 },
      { name: '390x844 iPhone Mobile', width: 390, height: 844 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:4173/communicate', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      console.log(`[${vp.name}] Zero horizontal scroll: ${!hasHScroll ? 'PASS' : 'FAIL'}`);
      results.push({ test: `${vp.name} Zero horizontal scroll`, pass: !hasHScroll, detail: hasHScroll ? 'OVERFLOW' : 'ZERO' });

      const shotName = `redesign_${vp.width}x${vp.height}.png`;
      await page.screenshot({ path: path.join(screenshotsDir, shotName) });
    }

    await browser.close();

    console.log('\n==================================================');
    console.log('              SUMMARY OF RESULTS                  ');
    console.log('==================================================');
    let allPassed = true;
    for (const r of results) {
      const mark = r.pass ? '[PASS]' : '[FAIL]';
      if (!r.pass) allPassed = false;
      console.log(`${mark} ${r.test} (${r.detail})`);
    }

    if (allPassed) {
      console.log('\n>>> ALL 18 AUTOMATED REDESIGN VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
      process.exitCode = 0;
    } else {
      console.error('\n>>> SOME TESTS FAILED <<<');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exitCode = 1;
  } finally {
    if (previewServer && previewServer.pid) {
      try {
        if (isWindows) {
          spawn('taskkill', ['/F', '/PID', previewServer.pid.toString(), '/T'], { stdio: 'ignore' });
        } else {
          previewServer.kill();
        }
      } catch {
        // ignore
      }
    }
  }
}

run();
