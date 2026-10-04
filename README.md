# COMMUNIQ

> **"Everyone deserves a voice."**  
> *Communicate naturally. Connect confidently.*

COMMUNIQ is an accessible web application created for people who cannot speak, or find speaking very hard, to talk with people who can.

---

## 1. Overview and Core Principles

- **Person Centered**: The individual is always the center of communication. Assistive tools and AI remain strictly auxiliary.
- **Offline First**: Communication must never depend on an active internet connection or cloud servers. Picture cards, speech pronunciation, and daily activity logs function reliably on the user's device.
- **Immediate Speech Feedback**: Tapping any picture card speaks it aloud immediately in the chosen language using the browser's Web Speech API.
- **Multi-Generational Adaptability**: Three dedicated interface modes calibrated for children (Class 1-7), students (Class 8-12), and adults or elders (18+).

---

## 2. Interface Modes

### 1. Child Mode (Class 1-7)
- **Illustrated Map of Places**: Kitchen, Home, School, Playground, Hospital, Shop, Bus stop, and Feelings garden.
- **Friendly Mascot**: Ollie the Owl drawn as a clean flat SVG (4 distinct poses: wave, point, celebrate, calm).
- **Game Feel without Heavy Motion**: Tap feedback bounce, soft pop acoustic feedback, stars for complete sentences, streaks, and kind messages ("Well done", "Nice choice").
- **Permanent Bottom Quick Needs Bar**: Water, Food, Bathroom, Help, Tired, Sick, Mom or Dad, Home.
- **Large Touch Cards**: 2-column layout, maximum 6 cards per screen, touch targets 80px or higher.

### 2. Student Mode (Class 8-12)
- Clean 3-column card grid with richer vocabulary and phrases for academic and daily social situations.
- Quick phrase access, conversation partner mode, and practice streaks.

### 3. Adult and Elder Mode (18+)
- Calm, neutral design with generous spacing and strong visual hierarchy. No game effects or mascot.
- Two large primary entry points: "Choose and say" and "Talk with someone".
- **Large and Simple Preset**: Increases card text size to 28px with maximum contrast and 1 to 2 items per row.
- Categories covering adult life: Work, College, Travel, Shopping, Healthcare, Public places, Family, Social, Emergency, and Independent living.

---

## 3. Communication Architecture

### Multilingual Support
Built-in native support for:
- English (`en-IN`)
- Kannada (`kn-IN`)
- Hindi (`hi-IN`)

Architecture ready for Tamil (`ta-IN`), Telugu (`te-IN`), and Malayalam (`ml-IN`) by adding translation files in `frontend/src/translations/`. All strings reside in translation files, never hardcoded.

### Core Intent Flow
1. Tap a picture card: The word speaks aloud immediately.
2. The interface presents intent cards ("I want", "I am hungry", "I like", "I do not like", "I do not want", "More", "Something else").
3. Tapping an intent speaks the complete grammatical sentence and displays it with a "Say it again" button.
4. Spoken phrases are automatically recorded to the "My Day" activity log.

### Safety and Confirmation
Emergency, medical, and pain phrases require one clear confirmation prompt before speaking aloud to prevent accidental activation.

---

## 4. Codebase Structure

```text
communiq/
├── frontend/
│   ├── public/              # Favicon set, PWA icons, manifest, robots, sitemap
│   ├── src/
│   │   ├── components/      # Button, Card, Pictogram, MascotView, Header, Navigation
│   │   ├── pages/           # Home, Communicate, Talk, Practice, My Day, Settings, Privacy, Terms, Design
│   │   ├── features/
│   │   │   ├── communication/
│   │   │   ├── conversation/
│   │   │   ├── practice/
│   │   │   ├── sign-language/
│   │   │   ├── drawing/
│   │   │   ├── speech/
│   │   │   └── history/
│   │   ├── services/        # Web Speech, Dexie database, Web Audio sounds, Cloud sync
│   │   ├── data/            # assets.ts, categories.ts, templates.ts, needs.ts, places.ts, mascot.ts
│   │   ├── translations/    # en.ts, kn.ts, hi.ts, ta.ts, te.ts, ml.ts, types.ts
│   │   ├── hooks/           # useCommuniq React context provider and hook
│   │   ├── test/            # Vitest unit and integration test suite
│   │   └── index.css        # Tailwind v4 configuration, flat color tokens, high contrast
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (health, sync, phrases)
│   │   ├── services/        # ai, speech, sign, drawing scaffolds
│   │   ├── database/        # MongoDB connection manager with offline tolerance
│   │   ├── models/          # MongoDB documents
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── config/          # Environment configuration
│   │   └── main.py          # FastAPI application entrypoint
│   └── requirements.txt
├── scripts/
│   ├── generate_assets.py   # Brand icon and Open Graph image generator
│   ├── check_branding.mjs   # Production build branding audit
│   └── audit_codebase.py    # Strict rules and prohibited pattern scanner
├── LAUNCH.md                # Launch checklist and legal review notices
├── DEPLOY.md                # Step-by-step DNS and domain connection guide
└── README.md
```

---

## 5. Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### Backend Setup (Optional Cloud Sync)
```sh
cd backend
pip install -r requirements.txt
python -m app.main
```
The API server will run at `http://localhost:8000`.

---

## 6. Testing and Quality Verification

Run the test suite:
```sh
cd frontend
npm test
```

Run TypeScript compilation check:
```sh
cd frontend
npx tsc -b
```

Run linter:
```sh
cd frontend
npm run lint
```

Audit codebase for forbidden patterns:
```sh
python scripts/audit_codebase.py
```

Build and verify branding compliance:
```sh
cd frontend
npm run build
npm run check:branding
```

---

## 7. Open Source Attributions

- **ARASAAC Symbols**: The pictographic symbols used in this application are the property of the Government of Aragon and have been created by Sergio Palao for ARASAAC (http://www.arasaac.org), which distributes them under the Creative Commons License BY-NC-SA.
- **Icons**: UI iconography provided by Lucide Icons.
- **Fonts**: Nunito, Noto Sans Kannada, and Noto Sans Devanagari (Google Fonts, Open Font License).

---

## 8. Legal and Translation Review Notice

- **Legal Review**: Prior to public launch, the Privacy Policy (`/privacy`) and Terms of Use (`/terms`) must be reviewed and filled with registered business details by a qualified attorney, with special focus on children's data under the Digital Personal Data Protection Act (DPDP Act, India).
- **Native Review Tracking**: Sentence templates in `frontend/src/data/templates.ts` include a `reviewed` property tracking verified native translations for Kannada and Hindi.
