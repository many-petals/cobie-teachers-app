# Cobie Classroom Companion

**By Many Petals Learning**

> *"This tool reduces your admin so you can spend more time with pupils."*

A complete EYFS & KS1 Teacher Resource Pack built around the story *"Cobie the Cactus: Happy As He Is"*. Classroom-ready resources for emotional literacy, sensory awareness, and inclusion — evidence-based, SEN-first, and designed so teachers can track, support, and follow up without drowning in admin.

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
| **4 Core Lessons** | Step-by-step lesson plans with learning objectives, materials lists, timed steps, and SEN differentiation. Interactive lesson player with built-in timer. |
| **8 Optional Activities** | Sensory, emotional, communication, creative, movement, and reflection activities. Filterable by type, age group, and duration. |
| **18 Printable Resources** | Worksheets, visual aids, display materials, and assessment tools. Categorised by type with lesson cross-references. |
| **4 Parent Letters** | Ready-to-send home communications covering each lesson theme. Customisable with school name and teacher details. |

### Pupil Tracker (GDPR Compliant)

| Feature | Description |
|---------|-------------|
| **Anonymous Pupil Codes** | No child names stored — only teacher-chosen codes (P1, P2, etc.) |
| **Milestone Assessment** | Track pupils against EYFS Development Matters 2021 and KS1 PSHE milestones across 5 development areas |
| **Emotion Logging** | Quick-tap emotion recording with context (morning, circle time, playtime, etc.) and notes |
| **Progress Visualisation** | Per-pupil progress bars, rating summaries, and emotion history timelines |
| **Secure Cloud Storage** | All tracker data stored in Supabase with per-teacher isolation |
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
| **Evidence-Based Banner** | Links to curriculum frameworks and research underpinning the resources |
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
│   ├── QuickAssess.tsx       # Quick milestone assessment modal
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
│   ├── milestones.ts         # EYFS/KS1 milestone framework
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

The following tables are required for the Pupil Tracker:

```sql
-- Tracker Pupils (anonymous codes only)
CREATE TABLE tracker_pupils (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_code TEXT NOT NULL,
  age_group TEXT CHECK (age_group IN ('EYFS', 'KS1')) NOT NULL,
  sen_status BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracker Assessments (milestone ratings)
CREATE TABLE tracker_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pupil_id UUID REFERENCES tracker_pupils(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  area_id TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 4) NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracker Emotion Logs
CREATE TABLE tracker_emotion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pupil_id UUID REFERENCES tracker_pupils(id) ON DELETE CASCADE,
  emotion_id TEXT NOT NULL,
  emotion_name TEXT NOT NULL,
  context TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'EYFS Teacher',
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favourites
CREATE TABLE user_favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- Completed Lessons
CREATE TABLE user_completed_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Saved Calm Configurations
CREATE TABLE user_calm_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emotion TEXT NOT NULL,
  noise TEXT NOT NULL,
  time_available INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE tracker_pupils ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calm_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage own data" ON tracker_pupils
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON tracker_assessments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON tracker_emotion_logs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own data" ON user_favourites
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON user_completed_lessons
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON user_calm_configs
  FOR ALL USING (auth.uid() = user_id);
```

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
> Features include 4 core lesson plans with interactive lesson players, 8 optional activities across sensory, emotional, creative, and movement categories, 18 printable resources, 4 parent letter templates, a GDPR-compliant pupil tracker with milestone assessments and emotion logging, emotion tools with daily check-ins, and a calm corner builder for personalised calming plans.
>
> Every resource includes SEN differentiation and is aligned with the EYFS Development Matters 2021 framework and KS1 PSHE National Curriculum.
>
> This tool reduces your admin so you can spend more time with pupils.

**Keywords:** EYFS, KS1, teacher, classroom, emotional literacy, SEN, SEND, PSED, lesson plans, primary school, wellbeing, emotions, calm corner, pupil tracker

**Category:** Education

**Age Rating:** 4+

**Privacy Policy URL:** *(Add your privacy policy URL)*

---

## GDPR & Data Protection

This app is designed with GDPR compliance as a core principle:

- **No child names** are collected or stored anywhere in the system
- All pupils are identified by **anonymous codes** chosen by the teacher
- All data is **per-teacher isolated** using Supabase Row Level Security
- Teachers can **delete all data** at any time with a single action
- Local emotion check-in data uses **AsyncStorage** (device-only, no cloud sync)
- The Pupil Tracker requires authentication to ensure data is securely associated with a teacher account

---

## Curriculum Alignment

| Framework | Coverage |
|-----------|----------|
| **EYFS Development Matters 2021** | Personal, Social & Emotional Development (PSED) |
| **KS1 PSHE National Curriculum** | Health & Wellbeing, Relationships |
| **Communication & Language** | Speaking, listening, vocabulary development |
| **Understanding the World** | People, culture, communities |
| **SEND Code of Practice** | Sensory needs, inclusion, differentiation |

---

## License

All story and character content © Many Petals Learning. For classroom and educational use. Not for resale or redistribution.

---

## Support

For questions, feedback, or support, contact Many Petals Learning.
