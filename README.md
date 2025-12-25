# GeoSpur

Real-time intent broadcast platform for local businesses.

## MVP Snapshot

- SvelteKit (client-only)
- Node.js + Express API
- Firebase Auth, Firestore, FCM

Status: 🚧 MVP in active development

## Release readiness checklist

- [ ] Core flows working (sign-in, create offer, browse offers, respond)
- [ ] Offers/chat realtime updates
- [ ] Photo attachments (upload + display)
- [ ] Push notifications (opt-in + receipt)
- [ ] Trust logic (validation and enforcement)
- [ ] No SSR (client-only rendering confirmed)

### Minimal sanity-test checklist (manual)

- [ ] Sign in with a test account.
- [ ] Create an offer and confirm it appears in the list for another user.
- [ ] Open a chat on an offer and verify realtime message delivery.
- [ ] Attach a photo to an offer and confirm it renders.
- [ ] Enable push notifications and confirm a test notification arrives.
- [ ] Trigger a trust rule (e.g., blocked/limited user) and confirm enforcement.
- [ ] Hard refresh and confirm the app stays client-only (no SSR responses).

## Repo Layout

```
apps/
  web/            # SvelteKit client (client-only)
services/
  api/            # Express API
```

## Workspace Decision

No root workspace `package.json` yet. We'll add one once we start managing shared tooling or cross-package scripts.

## Local setup

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (see the next section)

### Firebase project configuration

1. Create a Firebase project in the console.
2. Enable the following Firebase products:
   - **Authentication** (phone provider)
   - **Firestore** (native mode)
   - **Storage** (for offer photos)
   - **Cloud Messaging** (for push notifications)
3. Create a **Web App** in Firebase to generate the client config (used by the SvelteKit app).
4. Create a **Service Account** (or use Application Default Credentials) for the API:
   - Download the JSON key and set `GOOGLE_APPLICATION_CREDENTIALS` to its path, **or**
   - Use `gcloud auth application-default login` locally.

### Environment variables

Create `apps/web/.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_API_BASE_URL=http://localhost:8080
```

For the API, set environment variables in your shell (or use a `.env` loader of your choice):

```
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
PORT=8080
```

### Run the apps

**SvelteKit web app**

```
cd apps/web
npm install
npm run dev
```

**Express API**

The API source lives in `services/api/src`. If you have not set up a `package.json` there yet, you can bootstrap it quickly:

```
cd services/api
npm init -y
npm install express firebase-admin
npm install -D tsx typescript @types/express
npx tsx src/index.ts
```

Once `services/api/package.json` exists, prefer `npm run dev` (or a similar script) to keep the command short.

## Deployment scope

### Web (Firebase Hosting)

- Build with `npm run build` in `apps/web` (adapter-static outputs to `apps/web/build`).
- Deploy the `build/` directory via Firebase Hosting (SPA mode).

### API (Cloud Run or alternative)

- Recommended: **Cloud Run** with the Express server container.
- Alternatives: Render, Fly.io, or any Node.js host that supports environment variables.
- Required runtime configuration:
  - Service account credentials (Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS`).
  - `PORT` set by the host (Cloud Run injects it automatically).

### Required Firebase services

- Firebase Auth (phone)
- Firestore
- Storage
- Cloud Messaging (FCM)
- Hosting
- Cloud Run (or your chosen API host)

## iOS bundling readiness (PWA + optional native wrapper)

### PWA manifest + icons (SvelteKit)

To make the web app installable on iOS:

1. Add a PWA manifest at `apps/web/static/manifest.webmanifest` with the app name, theme color, and icons.
2. Place icons in `apps/web/static/icons/` (at minimum: `icon-192.png` and `icon-512.png`).
3. Update `apps/web/src/app.html` to reference the manifest and Apple touch icon, for example:

```html
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="GeoSpur" />
```

### Installer prompt (iOS Safari)

iOS does not allow a custom install prompt. Instead, guide users to:

- Open the app in Safari
- Tap the **Share** button
- Choose **Add to Home Screen**

You can show a small UI hint after login (or on first visit) that explains these steps.

### Optional: Capacitor packaging (native wrapper)

If you choose to ship a native iOS build, Capacitor is the lightest path:

```
cd apps/web
npm install @capacitor/core @capacitor/cli
npx cap init GeoSpur com.geospur.app
npm run build
npx cap add ios
npx cap sync ios
```

Then open the generated iOS project in Xcode (`apps/web/ios`) and configure signing, icons, and push entitlement settings.


firebase credentials:
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-zw0KdfAhd2SbT8MAdbECr6QdSVJk5LE",
  authDomain: "geospur.firebaseapp.com",
  projectId: "geospur",
  storageBucket: "geospur.firebasestorage.app",
  messagingSenderId: "140846310568",
  appId: "1:140846310568:web:65ecfa8ffb0468cc78ce9d",
  measurementId: "G-PBW45W50QJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
