# GeoSpur

Real-time intent broadcast platform for local businesses.

## MVP Snapshot

- SvelteKit (client-only)
- Node.js + Express API
- Firebase Auth, Firestore, FCM

Status: 🚧 MVP in active development

## Repo Layout

```
apps/
  web/            # SvelteKit client (client-only)
services/
  api/            # Express API
```

## Workspace Decision

No root workspace `package.json` yet. We'll add one once we start managing shared tooling or cross-package scripts.
