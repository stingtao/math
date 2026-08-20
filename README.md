# Math

An English-language Grade 8 learning trail built around the promise “Small steps. Real progress.” The first release includes 13 Common Core regions, 52 short lessons, 13 boss quests, spaced review, daily rewards, anonymous identities, and opt-in weekly leagues.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set a Google Web client ID in both `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, then set a strong `AUTH_HMAC_SECRET`. Without a Google client ID, the local site offers a browser-only demo trail and does not persist progress.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run db:generate
```

`npm test` performs a production build, validates all 52 lessons and 260 reviewed questions, runs 26,000 seeded answer checks, confirms the 20 Quick Sheets are present, checks that the persistent schema contains no Google profile data, and verifies mutation/security controls.

## Privacy and identity

- Google ID tokens are verified server-side for signature, issuer, audience, and expiry.
- Only the Google `sub` claim is used, and it is HMAC-derived before storage.
- Google email, name, avatar, and raw `sub` are never stored.
- Sessions use random opaque tokens; only SHA-256 token hashes are stored in D1.
- Public identities are generated from a safe nickname dictionary and abstract avatar parts.
- Weekly leaderboard participation is opt-in and exposes no internal learner ID.

## Deployment bindings

The Sites deployment declares a D1 binding named `DB` in `.openai/hosting.json`. Apply the SQL files in `drizzle/` and configure these production secrets/variables:

- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `AUTH_HMAC_SECRET`
- `SESSION_SECRET`

After deployment, add the public host to the Google OAuth client’s Authorized JavaScript origins.
