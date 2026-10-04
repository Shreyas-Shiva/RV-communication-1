# COMMUNIQ Launch Checklist and Readiness Audit

**Tagline:** Everyone deserves a voice.  
**Supporting Line:** Communicate naturally. Connect confidently.  
**Launch Target Date:** October 2026.  
**Status:** Launch Ready (All Engineering Gates Passed).

---

> [!IMPORTANT]
> **LEGAL AND HUMAN ACTIONS BEFORE PUBLIC RELEASE**:
> 1. Run `npm run setup:site` to populate `site.config.json` with your real registered legal entity, physical address, contact email, and production domain.
> 2. The Privacy Policy (`/privacy`) and Terms of Use (`/terms`) must be reviewed and finalized by a qualified legal professional before commercial release.
> 3. Native speaker translation review of `translations_review.csv` must be conducted by fluent speakers for Kannada and Hindi, followed by `npm run import:review`.
> 4. Real user evaluation sessions must be conducted using the testing kit in `docs/testing/`, and observations recorded in `docs/testing/RESULTS_SUMMARY_TEMPLATE.md`.

---

## 1. Automated Prelaunch Quality Gates

All automated engineering gates are verified via `npm run prelaunch`:

| Gate | Verification Check | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Gate 1: Secret Scan** | Repo, git history, and `dist/` scanned for private keys (`gsk_`, `AIza`, `sk-`). Confirm `.env` in `.gitignore`. | **PASSED** | 0 secrets detected. `.env` strictly ignored by git. |
| **Gate 2: Negative Constraints** | `scripts/audit_codebase.py` enforces: no purple, no gradients, no pill buttons, no emoji in UI code, no em/en dashes, no builder marks. | **PASSED** | Scanned 63 frontend files. All checks passed. |
| **Gate 3: Template Branding** | `scripts/check_branding.mjs` verifies zero builder badges, tags, or template watermarks in `/dist`. | **PASSED** | 0 template marks in `/dist`. |
| **Gate 4: Production Build** | `tsc -b && vite build` generates clean production client bundle. | **PASSED** | Clean bundle built in `frontend/dist`. |
| **Gate 5: Code Quality (Linter)** | `oxlint` runs across all frontend TypeScript and React files. | **PASSED** | 0 errors, 0 warnings across 63 files. |
| **Gate 6: Frontend Tests** | Vitest test suite runs speech, templates, db, offline, and conversation tests. | **PASSED** | 36 / 36 tests passed. |
| **Gate 7: Backend Tests** | Pytest test suite runs endpoints, safety, cache, rate limits, drawing, and sign tests. | **PASSED** | 31 / 31 tests passed. |
| **Gate 8: Accessibility Audit** | Playwright + Axe-core accessibility test runs across phone, tablet, and desktop in EN, KN, HI. | **PASSED** | 0 accessibility violations. |
| **Gate 9: PWA & Favicon Set** | Checks `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `site.webmanifest`, `robots.txt`, `sitemap.xml`. | **PASSED** | All 10 required assets exist with non-zero size. |
| **Gate 10: Single Source of Truth** | Site configuration template in `site.config.json` tracks maker, contact, legal, and domain. | **CONFIGURED** | Ready for human input via `npm run setup:site`. |

---

## 2. Completed Product Capabilities

### A. Core Communication & AAC Features
- **Picture Communication Cards:** 52 high-contrast symbols from ARASAAC in flat accessible colors. Full support for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
- **Two-Way Conversation Loop (Talk Screen):**
  1. *Hear:* Web Speech API speech-to-text.
  2. *Understand:* Keyword token extraction.
  3. *Suggest:* 3 to 6 contextual options under "You could say".
  4. *Tap:* Single tap with gentle audio pop and high-contrast outline.
  5. *Speak:* Instant device speech synthesis in native script.
  6. *Save:* Saved to Dexie IndexedDB threads.
  7. *Predict Next:* Loop continues smoothly.
- **Three Age-Appropriate Interface Modes:**
  - *Child Mode (Class 1-7):* Oversized cards, friendly owl mascot, star rewards, cheering confetti, permanent bottom Quick Needs bar.
  - *Student Mode (Class 8-12):* Clean category grid, study vocabulary, sentence assembly bar, streak counters.
  - *Adult & Elder Mode (18+):* Dignified practical space, medical and transit actions, Large & Simple 28px preset.

### B. Final Phase Advanced Assistive Engines
- **Part 1: Draw What You Mean (`DrawingCanvas.tsx` + Backend API):**
  - Full drawing canvas with pencil, eraser, undo, redo, clear, brush sizes, and strict palette colors.
  - Offline heuristic classifier and server-side fallback (`POST /api/drawing/analyze`).
  - Identifies symbols (Apple, Water, Home, Ball, Pizza, Car, Book, Happy).
  - One-tap speech output and addition to sentence bar. Ephemeral in-memory image processing (images never written to disk).
- **Part 2: Sign Language Recognition (`SignRecognizer.tsx` + Backend API):**
  - Camera stream and file upload (JPG/PNG/WEBP/MP4).
  - Recognizes basic communicative signs (Hello, Yes, No, Thank You, Help, Water, Please) with speech output.
  - Transparent beta disclosure.
  - Sign Lab (`/dev/sign-samples`): Local landmark sample collection tool with signer consent checkbox and JSON export.
  - Trainer script `scripts/train_sign.mjs` (`npm run train:sign`).
- **Part 3: Practice Conversation Game (`PracticePage.tsx`):**
  - 8 everyday scenarios: Restaurant, School, Home, Travel, Shopping, Hospital, Playing, Family.
  - 4 to 6 dialogue turns each with partner prompts and AAC response choices.
  - 100% offline scripted dialogue in English, Kannada, and Hindi.
  - Star rewards and milestone badges.
- **Part 4: Voice Quality & Settings:**
  - Per-language voice testing buttons (English, Kannada, Hindi).
  - Platform guides for installing natural offline voices on Android, iOS, Windows, and macOS.
  - Speech rate and voice selector.
- **Part 5: My Day & Settings Enhancements:**
  - Full-text search bar filtering spoken phrases and dialogue logs.
  - Category filter pills (All, Needs, Health, Emergency, Feelings, Practice, Drawing, Sign).
  - Past 7 Days Weekly volume breakdown.
  - Test Session Mode: Live tester timer, utterance counter, and post-session evaluator report card.
- **Part 6 & 7: Public Pages:**
  - `/about`: Mission, AAC principles, who it is for, ARASAAC attribution.
  - `/help`: Detailed guides for users, parents, and therapists.
  - `/accessibility`: WCAG 2.1 AA conformance statement, contrast ratios, touch targets, keyboard navigation.
  - `/contact`: Official contact information and feedback form.
  - `/404`: Clean recovery page.
  - All public pages read from `site.config.json`.
- **Part 8: Translation Review Kit:**
  - Script `scripts/review_kit.mjs`: `npm run export:review` generates `translations_review.csv`; `npm run import:review` applies verified translations.
  - `/dev/review`: Visual dashboard tracking reviewed vs pending strings.
- **Part 9: Real User Testing Kit (`docs/testing/`):**
  - `CONSENT_FORM.md`: Informed participant and guardian consent.
  - `SESSION_SCRIPT.md`: Facilitator protocol (warm-up, needs, conversation, drawing, practice, debrief).
  - `OBSERVATION_SHEET.md`: Rubric for task ratings, touch accuracy, and latency.
  - `FEEDBACK_FORM.md`: Accessible user feedback and caregiver survey.
  - `RESULTS_SUMMARY_TEMPLATE.md`: Cross-cohort synthesis template.

---

## 3. Tasks That Only a Human Can Finish

Before launching COMMUNIQ to the public on a live production domain, complete these tasks:

1. **Configure Live AI Keys (Optional):**
   - Copy `backend/.env.example` to `backend/.env`.
   - Add your free keys: `GROQ_API_KEY` and `GEMINI_API_KEY`.
   - Run `npm run check:keys` to verify connectivity without printing keys.
   - Run `npm run setup:models` to select models from provider model listings.
   - Run `npm run verify:live` to execute live 5-turn tests in English, Kannada, and Hindi.
2. **Populate Production Site Metadata:**
   - Run `npm run setup:site` or edit `site.config.json`.
   - Fill in:
     - Maker / Organization Name
     - Registered Physical Address
     - Official Support / Feedback Email
     - Governing Law jurisdiction
     - Production Domain (e.g., `https://communiq.app`)
3. **Conduct Native Speaker Translation Review:**
   - Run `npm run export:review` to generate `translations_review.csv`.
   - Have fluent Kannada and Hindi speakers review and mark `yes` in the `reviewed` column.
   - Run `npm run import:review` to update the application code.
4. **Conduct Real User Usability Sessions:**
   - Follow the testing protocol in `docs/testing/SESSION_SCRIPT.md`.
   - Administer `CONSENT_FORM.md`, `OBSERVATION_SHEET.md`, and `FEEDBACK_FORM.md`.
   - Synthesize real results in `docs/testing/RESULTS_SUMMARY_TEMPLATE.md`.
5. **Legal & Compliance Review:**
   - Have a qualified attorney review `/privacy` and `/terms`.
   - Verify compliance with the DPDP Act (India), COPPA, and GDPR-K.
6. **DNS & Hosting Deployment:**
   - Follow instructions in `DEPLOY.md` to configure HTTPS, security headers, and domain records.
