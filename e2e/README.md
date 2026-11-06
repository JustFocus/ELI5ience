# ELI5ience E2E acceptance suite

Playwright + TypeScript black-box tests of user-visible behavior. The same specs
target the legacy app now and the rebuilt app later. See `docs/test-plan.md`
(layer 1) for scope.

## Running against legacy

The suite does not start the app. Start it first per `docker/legacy/README.md`
so it is serving on `http://localhost:3000`, then from this directory:

```sh
npm install
APP_ENV=legacy BASE_URL=http://localhost:3000 npm test
```

- `APP_ENV` (default `legacy`) selects route shapes (`support/routes.ts`) and the
  visual baseline folder (`__screenshots__/<APP_ENV>/`).
- `BASE_URL` (default `http://localhost:3000`) is the app under test.
- `npm run test:smoke` runs only the `@smoke` tagged specs.
- `npm run typecheck` runs `tsc --noEmit`.

The suite expects a freshly seeded database (`db/seeds.rb`). Specs assert on the
constants in `support/seed.ts`.

## Updating visual baselines

Visual specs compare screenshots against `__screenshots__/<APP_ENV>/`. After an
intentional UI change, regenerate and review the baselines:

```sh
APP_ENV=legacy npx playwright test --update-snapshots
git diff -- __screenshots__/
```

Generate baselines in the same environment that compares them (the Linux
container or CI image), because font rendering differs across operating systems.
Review every changed PNG before committing it.

## No retries

`retries` is `0` and must stay that way. A test that fails intermittently is a
bug: find the cause (usually a missing explicit expectation or shared-state
leak) and fix it. Do not add retries, `waitForTimeout` sleeps, or
`test.describe.configure({ retries })`. Specs run one at a time because the app
shares one seeded database.

## Artifacts

On failure Playwright keeps a trace (`test-results/`) and a screenshot. CI also
writes an HTML report to `playwright-report/`. All three are gitignored.

## Layout

- `playwright.config.ts` - projects, reporter, baseURL, snapshot paths.
- `support/routes.ts` - route helpers chosen by `APP_ENV`.
- `support/auth.ts` - `loginAsGuest`, `login`, `logout` helpers.
- `support/seed.ts` - seed users and article titles, mirrored from `db/seeds.rb`.
- `tests/` - spec files, one per flow.
