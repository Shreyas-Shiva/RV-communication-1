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
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function setPreferences(page, lang = 'en', mode = 'adult', vocabLevel = 3) {
  if (page.url() === 'about:blank' || !page.url().startsWith('http://localhost:4173')) {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  }
  await page.evaluate(
    ({ l, m, vl }) => {
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
        soundEffects: false,
        parentConsentGiven: true,
        dailyStreak: 3,
        starsCount: 8,
        enableAI: false
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
    },
    { l: lang, m: mode, vl: vocabLevel }
  );

  await page.reload({ waitUntil: 'networkidle' });
}

async function run() {
  console.log('==================================================');
  console.log('       COMMUNIQ FINAL ACCEPTANCE VERIFICATION     ');
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

  const summary = [];
  let browser;

  try {
    await waitForServer('http://localhost:4173/');
    console.log('Preview server ready on http://localhost:4173/.');

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // 1. VIEWPORT & ZERO PAGE SCROLL TESTS (Chat & Board)
    // -------------------------------------------------------------
    console.log('\n--- 1. Viewport & Zero Vertical Page Scroll Audit ---');
    const viewports = [
      { name: '1366x650 Laptop space', w: 1366, h: 650 },
      { name: '1536x730 Scaled screen', w: 1536, h: 730 },
      { name: '1920x1000 Desktop', w: 1920, h: 1000 },
      { name: '768x1024 Tablet', w: 768, h: 1024 },
      { name: '390x844 Mobile phone', w: 390, h: 844 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.w, height: vp.h });

      // Test CHAT screen
      await setPreferences(page, 'en', 'adult', 3);
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const chatScroll = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollHeight: doc.scrollHeight,
          clientHeight: doc.clientHeight,
          hasVScroll: doc.scrollHeight > doc.clientHeight + 2
        };
      });

      // Find lowest edge on Chat
      const chatLowest = await page.evaluate(() => {
        let maxY = 0;
        document.querySelectorAll('button, input, [role="log"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom > maxY && r.height > 0) maxY = r.bottom;
        });
        return Math.round(maxY);
      });

      console.log(`Chat [${vp.name}]: lowest edge = ${chatLowest}px, clientHeight = ${chatScroll.clientHeight}px, zero scroll = ${!chatScroll.hasVScroll ? 'PASS' : 'FAIL'}`);
      summary.push({
        test: `Chat zero page scroll (${vp.name})`,
        pass: !chatScroll.hasVScroll,
        detail: `lowest=${chatLowest}px / h=${vp.h}px`
      });

      // Test BOARD screen
      await page.goto('http://localhost:4173/board', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const boardScroll = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollHeight: doc.scrollHeight,
          clientHeight: doc.clientHeight,
          hasVScroll: doc.scrollHeight > doc.clientHeight + 2
        };
      });

      const boardLowest = await page.evaluate(() => {
        let maxY = 0;
        document.querySelectorAll('button, .card-communiq, aside').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom > maxY && r.height > 0) maxY = r.bottom;
        });
        return Math.round(maxY);
      });

      console.log(`Board [${vp.name}]: lowest edge = ${boardLowest}px, clientHeight = ${boardScroll.clientHeight}px, zero scroll = ${!boardScroll.hasVScroll ? 'PASS' : 'FAIL'}`);
      summary.push({
        test: `Board zero page scroll (${vp.name})`,
        pass: !boardScroll.hasVScroll,
        detail: `lowest=${boardLowest}px / h=${vp.h}px`
      });
    }

    // -------------------------------------------------------------
    // 2. ONE RED BUTTON ONLY AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 2. Single Red Button Audit ---');
    await page.setViewportSize({ width: 1366, height: 650 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const redButtons = await page.evaluate(() => {
      const redList = [];
      document.querySelectorAll('button').forEach((b) => {
        const style = window.getComputedStyle(b);
        const bg = style.backgroundColor;
        // Check for red (#D62828 is rgb(214, 40, 40))
        if (/214,\s*40,\s*40/.test(bg) || /rgb\(2[0-5]\d,\s*[0-5]\d,\s*[0-5]\d\)/.test(bg)) {
          redList.push({ text: b.textContent.trim(), label: b.getAttribute('aria-label') });
        }
      });
      return redList;
    });

    console.log(`Red buttons detected in header and chat: count = ${redButtons.length}`, redButtons);
    const oneRedPass = redButtons.length === 1 && /help|sos/i.test(redButtons[0]?.label || redButtons[0]?.text);
    summary.push({
      test: 'Exactly one red button in UI (Header Help)',
      pass: oneRedPass,
      detail: redButtons.map((b) => b.label || b.text).join(', ')
    });

    // -------------------------------------------------------------
    // 3. NO OLD SIDEBAR AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 3. Old Sidebar Removal Audit ---');
    const oldSidebarExists = await page.evaluate(() => {
      const asideNav = document.querySelector('aside[aria-label="Main Navigation"]');
      return !!asideNav;
    });
    console.log(`Old Navigation aside present: ${oldSidebarExists ? 'FAIL' : 'PASS (Removed)'}`);
    summary.push({
      test: 'Old sidebar completely removed from desktop',
      pass: !oldSidebarExists,
      detail: oldSidebarExists ? 'Present' : 'Removed'
    });

    // -------------------------------------------------------------
    // 4. NO DESCRIPTIONS ON CARDS AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 4. Card Anatomy Audit (Labels only, no descriptions) ---');
    await page.goto('http://localhost:4173/board', { waitUntil: 'networkidle' });
    const cardDescriptions = await page.evaluate(() => {
      const descList = [];
      document.querySelectorAll('.card-communiq span.text-\\[11px\\]').forEach((s) => {
        descList.push(s.textContent.trim());
      });
      return descList;
    });
    console.log(`Card subtitle/description count: ${cardDescriptions.length}`);
    summary.push({
      test: 'No card descriptions (Labels only on grid cards)',
      pass: cardDescriptions.length === 0,
      detail: `${cardDescriptions.length} descriptions found`
    });

    // -------------------------------------------------------------
    // 5. NO LEAKED RAW INTERNAL IDS
    // -------------------------------------------------------------
    console.log('\n--- 5. No Leaked Raw Internal IDs Audit ---');
    const leakedIds = await page.evaluate(() => {
      const text = document.body.innerText;
      const banned = ['home_place', 'food_pizza', 'drink_water', 'core_yes', 'core_no'];
      return banned.filter((id) => text.includes(id));
    });
    console.log(`Leaked IDs found in text: ${leakedIds.length === 0 ? 'None (PASS)' : leakedIds.join(', ')}`);
    summary.push({
      test: 'Zero raw internal IDs leaked in visible copy',
      pass: leakedIds.length === 0,
      detail: leakedIds.join(', ') || 'Clean'
    });

    // -------------------------------------------------------------
    // 6. CHAT CONVERSATION WORKFLOW & REPLIES
    // -------------------------------------------------------------
    console.log('\n--- 6. Chat Space Interaction & 4-5 Replies ---');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Enter partner statement "Are you hungry?" into input
    const partnerInput = page.locator('input[placeholder*="Type what they said"]');
    if (await partnerInput.isVisible().catch(() => false)) {
      await partnerInput.fill('Are you hungry?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
    }

    // Check replies count (options + Something else inside options group)
    const replyButtons = page.locator('[data-testid="reply-options"] button[type="button"]');
    const replyCount = await replyButtons.count();
    console.log(`Reply buttons rendered (options + Something else): ${replyCount}`);
    // Exactly 4 or 5 sentence options + 1 "Something else" = 5 or 6 buttons
    const replyCountPass = replyCount >= 5 && replyCount <= 6;
    summary.push({
      test: 'Chat provides 4 to 5 replies plus Something else',
      pass: replyCountPass,
      detail: `${replyCount} buttons`
    });

    // -------------------------------------------------------------
    // 7. SCREENSHOTS COLLECTION (1366x650 and 390x844 in 3 languages & modes)
    // -------------------------------------------------------------
    console.log('\n--- 7. Capturing Final Visual Acceptance Screenshots ---');

    // Screenshot A: 1366x650 Child Empty Chat (with Mascot)
    await page.setViewportSize({ width: 1366, height: 650 });
    await setPreferences(page, 'en', 'child', 3);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'chat_empty_1366x650_child_en.png') });

    // Screenshot B: 1366x650 Adult Conversation Chat
    await setPreferences(page, 'en', 'adult', 3);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const inputB = page.locator('input[placeholder*="Type what they said"]');
    if (await inputB.isVisible().catch(() => false)) {
      await inputB.fill('Are you hungry?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'chat_convo_1366x650_adult_en.png') });

    // Screenshot C: 1366x650 Kannada Conversation Chat
    await setPreferences(page, 'kn', 'student', 3);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const inputKn = page.locator('input[placeholder*="Type what they said"]');
    if (await inputKn.isVisible().catch(() => false)) {
      await inputKn.fill('ಹಸಿವಾಗಿದೆಯೇ?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'chat_convo_1366x650_student_kn.png') });

    // Screenshot D: 1366x650 Hindi Conversation Chat
    await setPreferences(page, 'hi', 'adult', 3);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const inputHi = page.locator('input[placeholder*="Type what they said"]');
    if (await inputHi.isVisible().catch(() => false)) {
      await inputHi.fill('क्या आपको भूख लगी है?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'chat_convo_1366x650_adult_hi.png') });

    // Screenshot E: 1366x650 Adult Core Board (40 cards, zero scroll)
    await setPreferences(page, 'en', 'adult', 3);
    await page.goto('http://localhost:4173/board', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'board_1366x650_adult_en.png') });

    // Screenshot F: 1366x650 Child Board (20 cards)
    await setPreferences(page, 'en', 'child', 3);
    await page.goto('http://localhost:4173/board', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'board_1366x650_child_en.png') });

    // Screenshot G: 1366x650 Folder Board (Food Folder)
    const foodCard = page.locator('.card-communiq:has-text("Food")').first();
    if (await foodCard.isVisible().catch(() => false)) {
      await foodCard.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'board_folder_food_1366x650_en.png') });

    // Screenshot H: 390x844 Mobile Chat
    await page.setViewportSize({ width: 390, height: 844 });
    await setPreferences(page, 'en', 'adult', 3);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'chat_390x844_mobile_en.png') });

    // Screenshot I: 390x844 Mobile Board
    await page.goto('http://localhost:4173/board', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'board_390x844_mobile_en.png') });

    console.log('All acceptance screenshots captured successfully.');
  } catch (err) {
    console.error('Acceptance verification error:', err);
    summary.push({ test: 'Execution', pass: false, detail: err.message });
  } finally {
    if (browser) await browser.close();
    previewServer.kill();
  }

  console.log('\n==================================================');
  console.log('              ACCEPTANCE TEST SUMMARY             ');
  console.log('==================================================');
  let allPass = true;
  summary.forEach((item, i) => {
    console.log(`${i + 1}. [${item.pass ? 'PASS' : 'FAIL'}] ${item.test} -> ${item.detail}`);
    if (!item.pass) allPass = false;
  });

  if (!allPass) {
    console.log('\n[FAIL] Some acceptance checks failed.');
    process.exit(1);
  } else {
    console.log('\n[PASS] ALL ACCEPTANCE CHECKS PASSED.');
    process.exit(0);
  }
}

run();
