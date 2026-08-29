# Math

Math is a simple English learning site for Grades 7–12. Sting built it as a parent who likes math and wanted a quiet place for his child to learn, practice, and return for review.

The site includes 55 regions, 253 lessons, 1,323 reviewed practice questions, mixed boss checks, spaced review, daily rewards, anonymous identities, an opt-in weekly leaderboard, and a public feedback board whose posts are not connected to learner accounts or progress. Grade 10–12 now includes graph-choice, table-choice, coordinate, number-line, and multi-select reasoning missions across every advanced region. A public Linear Graph Lab lets learners type `y = mx + b` equations and see the graph, slope, intercept, nearby coordinates, and point table update without signing in or saving the input. Its point-to-line mission turns plotted coordinates into a connected line and then asks learners to read coordinates back from the graph.

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

The database stores learning data under anonymous internal IDs. Google name, email, profile photo, and raw `sub` are not stored. Feedback rows contain no learner or account foreign key, and common contact details are rejected before a public post is stored. Authenticated JSON responses are marked private and non-cacheable.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run db:generate
npx wrangler types --check
npx wrangler deploy --dry-run
```

`npm test` builds the production app, validates all 253 lessons and 1,323 reviewed questions, runs 132,300 seeded answer checks, confirms the Grade 8 Quick Sheets, checks all 73 Grade 7, Grade 8, and high-school Common Core clusters plus the Algebra, state, AP, and Kang Chiao/IB extensions, verifies privacy boundaries, and exercises mutation, recovery-mastery, reward, responsive-layout, and security controls.
