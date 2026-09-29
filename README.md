# GymLog PWA — Offline-First Workout Tracker

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZainuddin110%2FGymLog&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

A zero-latency, mobile-first workout tracking Progressive Web App (PWA) purpose-built for poor cellular environments (gym basements and shielded zones). The architecture strictly maintains zero cloud operating costs ($0 / infinite free tier) through a **Dual-Tier Hybrid Storage Model**.

---

## 🌟 Key Architecture & Highlights

- **Dual-Tier Hybrid Storage**:
  - **Supabase Cloud (PostgreSQL)**: Retains strictly the 3 latest workouts per split via automated PostgreSQL triggers (`trigger_prune_excess_workouts`), keeping cloud row counts under ~60 rows per user.
  - **Dexie.js (IndexedDB)**: Stores an **infinite lifetime workout archive** locally on your mobile device with zero server footprint.
- **Gym-Floor Ergonomics**:
  - Minimum 44×44px touch targets across all buttons and pill chips to prevent mis-taps with sweaty hands or straps.
  - **Rapid-Increment Steppers**: One-tap pill chips (`+1.25`, `+2.5`, `+5`, `+10` kg/lbs and `+1`/`-1` reps) eliminating manual keypad typing.
  - **Ghost-Text Previous Targets**: Automatically displays previous performance (`Prev: 100 kg × 5`) as subtle placeholders in set inputs.
  - **Equipment Micro-Notes**: Auto-saves seat heights, pin holes, and handle notches directly to the exercise record on blur.
- **Rest Timer & Hardware Web APIs**:
  - **Screen Wake Lock API**: Automatically keeps your screen awake mid-workout to prevent sleep during rest periods.
  - **Synthesized Web Audio API**: Crisp audio chimes generated in real-time via `AudioContext` oscillators (no audio file downloads, works 100% offline, streams directly to Bluetooth headphones).
  - **Haptic Feedback**: Tactile vibration feedback on set completion and timer expiration.
- **Zero-Data-Loss Architecture**: Real-time auto-saving active workout draft in `localStorage` and IndexedDB. Refreshing or switching apps never loses in-progress sets.
- **1-Tap "Clone Last Workout" Quickstart**: Re-populates the exact exercise sequence and previous weights from your last session for any split.
- **Data Freedom**: 1-Tap client-side `.CSV` and `.JSON` export directly through the browser.

---

## 🚀 1-Click Deployment to Vercel

### Option 1: Automatic Vercel Import (Recommended)
1. Click the button below:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZainuddin110%2FGymLog&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

2. Connect your GitHub account and select repository `Zainuddin110/GymLog`.
3. Fill in your Supabase environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**!

### Option 2: Using Vercel CLI
```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Follow prompts to link and deploy to production
npx vercel --prod
```

---

## 🗄️ Database Setup (Supabase)

To initialize the automated 3-workout pruning trigger and database schema:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy and run the entire script in [`supabase/schema.sql`](./supabase/schema.sql).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production with PWA generation
npm run build
```

---

## 📱 Mobile PWA Installation

- **iOS (Safari)**: Open the deployed Vercel URL, tap the **Share** button, and select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the in-app **"Install GymLog"** banner or select **"Install App"** from the browser menu.
