# Math

Math is a parent-guided English learning site for Grades 7–12. Sting built it as a parent who likes math and wanted a quiet place to sit beside his child, ask useful questions, practice together, and return for review.

The site includes 55 regions, 253 lessons, 1,346 reviewed practice questions, mixed boss checks, spaced review, private family progress, and in-lesson prompts that help a parent listen before explaining. Only an adult parent or legal guardian signs in; a child does not receive an account. Public rankings, public posts, and advertising are disabled. A reviewed feedback area lets signed-in parents send corrections and ideas to the site owner without creating parent-to-parent messaging. Grade 8–12 includes graph-choice, table-choice, coordinate, number-line, and multi-select reasoning missions across every region. A public Linear Graph Lab lets a family type `y = mx + b` equations and see the graph, slope, intercept, nearby coordinates, and point table update without signing in or saving the input.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set a Google Web client ID in the `GOOGLE_CLIENT_ID` Worker binding, then set a strong random value for `AUTH_HMAC_SECRET`. Set `FEEDBACK_ADMIN_EMAIL` as a Worker secret to the verified Google email that should receive the private site-owner role on its next parent sign-in. The email is compared during sign-in and is not saved in D1. Without a Google client ID, the site offers a browser-only demo and does not persist progress.

## Cloudflare

- Worker name: `math`
- D1 database: `math-db`
- D1 binding: `DB`
- Live custom domain: `https://math.stingtao.info`
- R2 is not required; the teaching and social images are versioned static assets.

The database stores one shared learning record under a pseudonymous internal family ID. Google name, email, profile photo, raw credential, and raw `sub` are not stored. The service does not ask for a child’s name, email, exact birth date, school, photo, or voice. Learning, appearance, rewards, and feedback are deleted after four calendar months without a successful parent sign-in; the remaining account record is deleted after six months. A daily Worker cleanup enforces both deadlines, and Family space also offers category deletion. The feedback API requires a parent session and holds new topics for site-owner review. Authenticated JSON responses are private and non-cacheable.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run db:generate
npx wrangler types --check
npx wrangler deploy --dry-run
```

`npm test` builds the production app, validates all 253 lessons and 1,346 reviewed questions, runs 134,600 seeded answer checks, confirms the Grade 8 Quick Sheets, checks all 73 Grade 7, Grade 8, and high-school Common Core clusters plus the Algebra, state, AP, and Kang Chiao/IB extensions, verifies privacy boundaries, and exercises mutation, recovery-mastery, reward, responsive-layout, and security controls.
