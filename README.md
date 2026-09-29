# Cobie Classroom Companion

**By Many Petals Learning**

> *"This tool reduces your admin so you can spend more time with pupils."*

A complete EYFS & KS1 Teacher Resource Pack built around the story *"Cobie the Cactus: Happy As He Is"*. Classroom-ready resources for emotional literacy, sensory awareness, and inclusion — evidence-informed, SEN-first, and designed so teachers can track, support, and follow up without drowning in admin.

---

## App Logo & Icon

The app uses the official Cobie the Cactus mascot as the logo:

**Logo URL:** `https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1772906598277_0a0e41ba.png`

The logo is configured centrally in `app/data/brand.ts` and automatically appears in the app header, hero section, footer, and privacy page.

### App Store Icon & Splash Screen

Before publishing, save the logo image as the app icon and splash screen:

| Asset | Instructions | Save To |
|-------|-------------|---------|
| **App Icon** (1024x1024) | Download the logo above, resize to 1024x1024 | `assets/images/icon.png` |
| **Splash Screen** | Download the logo above, place on white background | `assets/images/splash-icon.png` |
| **Adaptive Icon** (Android) | Use same as App Icon | `assets/images/adaptive-icon.png` |
| **Favicon** (Web) | Resize logo to 32x32 | `assets/images/favicon.png` |
| **In-App Logo** (local) | Save as-is for bundled local logo | `assets/images/logo.png` |

**How to replace:**
1. Download the Cobie logo from the URL above
2. Save as PNG format
3. Rename and save to the paths listed above, replacing the existing files
4. For the App Icon, ensure it is at least **1024x1024 pixels** (required by App Store & Google Play)

**How to use a local logo (instead of CDN URL):**
1. Save the logo to `assets/images/logo.png`
2. In `app/data/brand.ts`, add: `export const LOCAL_LOGO = require('../../assets/images/logo.png');`
3. In each file that uses `BRAND.logoUrl`, change `source={{ uri: BRAND.logoUrl }}` to `source={LOCAL_LOGO}`

---

## Features

### Core Teaching Resources

| Feature | Description |
|---------|-------------|
| **8 Lessons** | Eight lesson plans across EYFS and KS1, with learning objectives, materials, timed steps, differentiation and an interactive lesson player. |
| **8 Optional Activities** | Sensory, emotional, communication, creative, movement, and reflection activities. Filterable by type, age group, and duration. |
| **18 Printable Resources** | Worksheets, visual aids, display materials, and observation tools. Categorised by type with lesson cross-references. |
| **4 Parent Letters** | Ready-to-send home communications covering each lesson theme. Customisable with school name and teacher details. |

### Pupil Tracker (school approval required)

| Feature | Description |
|---------|-------------|
| **Pupil Codes** | Teacher-chosen codes such as P1 or P2; coded records may still be personal data |
| **Observation Tracker** | Record teacher observations using Many Petals programme indicators across 6 areas; these are not statutory assessment criteria |
| **Emotion Logging** | Quick-tap emotion recording with context (morning, circle time, playtime, etc.) and notes |
| **Observation Overview** | Per-pupil observation counts, individual statuses, and emotion history timelines |
| **Cloud Storage** | Tracker records are stored through the configured cloud database; schools should verify live provider and access arrangements |
| **Full Data Deletion** | Teachers can delete all pupil data at any time |

### Emotion & Wellbeing Tools

| Feature | Description |
|---------|-------------|
| **Emotion Cards** | 8 emotions with child-friendly explanations, body clues, and calming strategies |
| **Daily Check-In** | Quick emotion check-in tool for whole-class or individual use |
| **Check-In History** | Local storage of all emotion check-ins with timeline view |
| **Calm Corner Builder** | Personalised calming plans based on emotion, noise level, and available time |
| **Saveable Calm Plans** | Save and quick-load frequently used calm configurations |

### Additional Features

| Feature | Description |
|---------|-------------|
| **SEN Mode** | Toggle to show SEN differentiation, adaptations, and accessibility notes throughout the app |
| **Differentiation Wizard** | Guided tool for adapting activities to different needs |
| **User Authentication** | Secure sign-up/sign-in with email and password |
| **Favourites & Progress** | Bookmark lessons, activities, and printables. Track completed lessons. |
| **Today's Activity** | Daily rotating activity suggestion on the home screen |
| **Evidence-Informed Banner** | Links to curriculum frameworks and research relevant to the resources |
| **Pricing/Support Section** | Tiered support options for the resource pack |
| **Voice Notes** | Audio recording tool for quick observations |
| **Weekly Planner** | Planning tool for scheduling lessons and activities |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo SDK 54** | Build tooling, routing, and native modules |
| **Expo Router** | File-based navigation with tabs and dynamic routes |
| **TypeScript** | Type safety throughout |
| **Supabase** | Authentication, database, and real-time data |
| **AsyncStorage** | Local data persistence for offline-first features |
| **@expo/vector-icons** | Ionicons icon library |

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go on a physical device

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd cobie-classroom-companion

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web Browser
npx expo start --web

# Expo Go (scan QR code from terminal)
npx expo start
```

---

## Project Structure

```
app/
├── (tabs)/                    # Tab-based navigation screens
│   ├── _layout.tsx           # Tab bar configuration
│   ├── index.tsx             # Home screen
│   ├── lessons.tsx           # Core lessons list
│   ├── activities.tsx        # Activities with filters
│   ├── tracker.tsx           # Pupil tracker (auth required)
│   ├── printables.tsx        # Printable resources
│   ├── parents.tsx           # Parent letter generator
│   ├── tools.tsx             # Emotion tools (cards, check-in, history)
│   └── calm.tsx              # Calm corner builder
│
├── activity/[id].tsx         # Activity detail screen (dynamic route)
├── lesson/[id].tsx           # Lesson player screen (dynamic route)
├── planner.tsx               # Weekly planner
├── voice-notes.tsx           # Voice notes recorder
│
├── components/               # Reusable UI components
│   ├── AddPupilModal.tsx     # Add pupil form modal
│   ├── AuthModal.tsx         # Sign in / sign up modal
│   ├── CalmCornerBuilder.tsx # Calm plan generator
│   ├── CheckInScreen.tsx     # Emotion check-in flow
│   ├── DifferentiationWizard.tsx # SEN differentiation tool
│   ├── EmotionCard.tsx       # Expandable emotion card
│   ├── EmotionHistory.tsx    # Emotion log timeline
│   ├── EmotionLogModal.tsx   # Quick emotion log for tracker
│   ├── EvidenceBanner.tsx    # Research/curriculum evidence
│   ├── FilterChips.tsx       # Reusable filter chip component
│   ├── PricingSection.tsx    # Pricing modal
│   ├── ProgressView.tsx      # Pupil progress visualisation
│   ├── QuickAssess.tsx       # Quick observation modal
│   ├── QuickTile.tsx         # Home screen quick access tile
│   ├── ResourceCard.tsx      # Generic resource card
│   ├── SENBanner.tsx         # SEN mode toggle banner
│   ├── SearchBar.tsx         # Search input component
│   ├── Timer.tsx             # Countdown timer for lessons
│   ├── TodayActivity.tsx     # Daily activity suggestion
│   └── WorkbookPromo.tsx     # Workbook promotional card
│
├── context/                  # React Context providers
│   ├── AuthContext.tsx        # Authentication, favourites, progress
│   ├── SENContext.tsx         # SEN mode toggle state
│   └── ToastContext.tsx       # Toast notifications & confirmations
│
├── data/                     # Static data and configuration
│   ├── activities.ts         # 8 activity definitions
│   ├── brand.ts              # Brand configuration (logo, name, tagline)
│   ├── emotions.ts           # Emotion definitions & calming resources
│   ├── lessons.ts            # 4 lesson plan definitions
│   ├── milestones.ts         # EYFS/KS1 observation indicators
│   ├── parentLetters.ts      # 4 parent letter templates
│   ├── printables.ts         # 18 printable resource definitions
│   └── theme.ts              # Colours, spacing, typography, shadows
│
├── lib/                      # Utility libraries
│   ├── parentLetterGenerator.ts  # Generate customised parent letters
│   ├── printableGenerator.ts     # Generate printable content
│   ├── storage.ts                # AsyncStorage helpers
│   └── supabase.ts               # Supabase client configuration
│
└── _layout.tsx               # Root layout with providers
```

---

## Customisation

### Branding

All branding is centralised in `app/data/brand.ts`:

```typescript
export const BRAND = {
  logoUrl: 'https://your-logo-url.png',  // Used in header & footer
  name: 'Many Petals Learning',
  shortName: 'Many Petals',
  tagline: 'Cobie Teacher Pack',
  storyTitle: 'Cobie the Cactus: Happy As He Is',
  packDescription: 'EYFS & KS1 Teacher Resource Pack',
  copyright: 'All story and character content © Many Petals Learning',
};
```

### Theme

Colours, spacing, typography, and shadows are defined in `app/data/theme.ts`. Update the `COLORS` object to change the colour scheme across the entire app.

### Supabase

Configure your Supabase project in `app/lib/supabase.ts` with your project URL and anon key.

---

## Database Schema (Supabase)

The live app uses these Supabase tables:

- `teachers`
- `favourites`
- `completed_lessons`
- `saved_calm_configs`
- `tracker_pupils`
- `tracker_assessments`
- `tracker_emotion_logs`

Apply [`migrations/20260929_pilot_database_baseline.sql`](migrations/20260929_pilot_database_baseline.sql) from the database owner's SQL console before inviting pilot schools. The baseline creates the required tables where missing, enables row-level security, grants authenticated access, adds per-teacher policies, and installs `save_tracker_observations` for tracker saves.

After applying the migration, run [`migrations/20260929_pilot_database_verify.sql`](migrations/20260929_pilot_database_verify.sql). Every row should return `ok`. Then verify the account journey with two disposable teacher accounts before entering real pupil records: signup, confirmation email, password reset, tracker save, observation save, emotion log save, parent report generation, cross-account isolation, deletion, Stripe checkout, access refresh, sign-out/sign-in, billing portal and cancellation.

---

## Building for Production

### Web Build

```bash
npx expo export --platform web --clear
```

The output will be in the `dist/` directory, ready for deployment to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

### iOS Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android Build (EAS)

```bash
# Build for Android
eas build --platform android
```

### App Store Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

---

## App Store Metadata

Use the following for your app store listings:

**App Name:** Cobie Classroom Companion

**Subtitle:** EYFS & KS1 Teacher Resource Pack

**Description:**
> Cobie Classroom Companion is a complete teaching resource pack built around the story "Cobie the Cactus: Happy As He Is". Designed for EYFS and KS1 teachers, it provides classroom-ready resources for emotional literacy, sensory awareness, and inclusion.
>
> Features include 8 lesson plans across EYFS and KS1 with interactive lesson players, 8 activities across sensory, emotional, creative, and movement categories, 18 printable resources, 4 parent letter templates, a school-review-required pupil tracker with teacher observations and emotion logging, emotion tools with daily check-ins, and a calm corner builder for personalised calming plans.
>
> The programme includes SEND support and is informed by EYFS PSED, Development Matters (non-statutory guidance), and primary Relationships Education and Health Education in England. This is not a claim of formal curriculum mapping or endorsement.
>
> This tool reduces your admin so you can spend more time with pupils.

**Keywords:** EYFS, KS1, teacher, classroom, emotional literacy, SEN, SEND, PSED, lesson plans, primary school, wellbeing, emotions, calm corner, pupil tracker

**Category:** Education

**Age Rating:** 4+

**Privacy Policy URL:** *(Add your privacy policy URL)*

---

## GDPR & Data Protection

The app supports data minimisation, but schools must verify the live service arrangements and their own responsibilities before entering pupil records:

- Pupil codes are recommended, but coded records may still be personal data
- Free-text notes must not contain names or identifying information
- Per-teacher access controls are implemented in the app; schools should verify the deployed database policies
- Teachers can **delete all data** at any time with a single action
- Local emotion check-in data uses **AsyncStorage** (device-only, no cloud sync)
- The Pupil Tracker requires authentication to ensure data is securely associated with a teacher account

---

## Curriculum Alignment

| Framework | Coverage |
|-----------|----------|
| **[EYFS statutory framework](https://www.gov.uk/government/publications/early-years-foundation-stage-framework--2)** | England; includes Personal, Social and Emotional Development (PSED) |
| **[Development Matters](https://www.gov.uk/government/publications/development-matters--2)** | Non-statutory curriculum guidance for the EYFS in England |
| **[Relationships Education and Health Education](https://www.gov.uk/government/publications/relationships-education-relationships-and-sex-education-rse-and-health-education)** | Primary provision in England; revised statutory guidance effective 1 September 2026 |
| **Communication & Language** | Speaking, listening, vocabulary development |
| **Understanding the World** | People, culture, communities |
| **SEND Code of Practice** | Sensory needs, inclusion, differentiation |

---

## License

All story and character content © Many Petals Learning. For classroom and educational use. Not for resale or redistribution.

---

## Support

For questions, feedback, or support, contact Many Petals Learning.
