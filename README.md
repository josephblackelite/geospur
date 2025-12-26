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

### Local development configuration

- Place `.env` files alongside each app:
  - `apps/web/.env` for the SvelteKit client.
  - `services/api/.env` (or shell env vars) for the Express API.
- Set `GOOGLE_APPLICATION_CREDENTIALS` to an absolute path for your service account JSON
  (for example, `/Users/you/.config/gcloud/geospur-service-account.json`).
- ⚠️ **Never commit private keys or service account JSON files**. Keep them in your local
  secrets manager or ignored `.env` files only.

### Firebase project configuration

1. Create a Firebase project in the console.
2. Enable the following Firebase products:
   - **Authentication** (phone provider)
   - **Firestore** (native mode)
   - **Storage** (for offer photos)
   - **Cloud Messaging** (for push notifications)
   - **Hosting** (for the web client)
3. Decide where the API will be hosted (recommended: **Cloud Run**).
4. Create a **Web App** in Firebase to generate the client config (used by the SvelteKit app).
5. Create a **Service Account** (or use Application Default Credentials) for the API:
   - Download the JSON key and set `GOOGLE_APPLICATION_CREDENTIALS` to its path, **or**
   - Use `gcloud auth application-default login` locally.

### Environment variables

Copy `.env.example` to your preferred secrets manager or local env files (for example, `apps/web/.env` for the SvelteKit app and shell env vars for the API). **Do not commit real secrets**.

Firebase web config → SvelteKit `VITE_` env mapping:

```
apiKey            -> VITE_FIREBASE_API_KEY
authDomain        -> VITE_FIREBASE_AUTH_DOMAIN
projectId         -> VITE_FIREBASE_PROJECT_ID
storageBucket     -> VITE_FIREBASE_STORAGE_BUCKET
messagingSenderId -> VITE_FIREBASE_MESSAGING_SENDER_ID
appId             -> VITE_FIREBASE_APP_ID
measurementId     -> VITE_FIREBASE_MEASUREMENT_ID
vapidPublicKey    -> VITE_FIREBASE_VAPID_PUBLIC_KEY
```

Server-only env vars (API-only, never expose to the client):

```
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
WEB_PUSH_PRIVATE_KEY=your-web-push-private-key
PORT=8080
```

API base URL (frontend calls the API with this base):

```
VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_SERVICE_URL
```

The SvelteKit app calls endpoints like `POST /respond-offer` and `POST /register-push-token`
using `fetch(`${VITE_API_BASE_URL}/respond-offer`)` in the browser.

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

### Deploy configuration

- Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set in the API runtime environment (or use
  Application Default Credentials in your host platform).
- Hosting domains:
  - `geospur.web.app`
  - `geospur.firebaseapp.com`
- ⚠️ **Never commit private keys or service account JSON files** to the repo.
- API hosting (recommended): Cloud Run service URL (for example, `https://geospur-api-xyz.a.run.app`).
  The frontend points `VITE_API_BASE_URL` at this URL so browser `fetch()` calls reach the API.

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

### API hosting + frontend integration (explicit)

- The API is hosted on **Cloud Run** (or another Node.js host). The canonical base URL is the
  Cloud Run service URL (for example, `https://geospur-api-xyz.a.run.app`).
- The frontend calls the API directly from the browser using `fetch()` and the
  `VITE_API_BASE_URL` environment variable (see `apps/web/src/lib/components/OfferResponseForm.svelte`
  and `apps/web/src/lib/push.ts` for examples).

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
