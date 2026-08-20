# Math

Math is a simple English learning site for Grades 7–9. Sting built it as a parent who likes math and wanted a quiet place for his child to learn, practice, and return for review.

The site includes 31 four-lesson regions, 124 lessons, 31 mixed boss checks, spaced review, daily rewards, anonymous identities, an opt-in weekly leaderboard, and a public feedback board whose posts are not connected to learner accounts or progress.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set a Google Web client ID in the `GOOGLE_CLIENT_ID` Worker binding, then set a strong random value for `AUTH_HMAC_SECRET`. Without a Google client ID, the site offers a browser-only demo and does not persist progress.

## Cloudflare

- Worker name: `math`
- D1 database: `math-db`
- D1 binding: `DB`
- Live custom domain: `https://math.stingtao.info`
- R2 is not required; the teaching and social images are versioned static assets.

The database stores learning data under anonymous internal IDs. Google name, email, profile photo, and raw `sub` are not stored. Feedback rows contain no learner or account foreign key.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run db:generate
npx wrangler types --check
npx wrangler deploy --dry-run
```

`npm test` builds the production app, validates all 124 lessons and 620 reviewed questions, runs 62,000 seeded answer checks, confirms the 20 Grade 8 Quick Sheets, checks privacy boundaries, and verifies mutation/security controls.
