ELI5ience test plan
===================

The project currently has zero real tests: `test/` is generator stubs whose empty fixtures cannot even load. This plan defines what we test, at which layer, and when each layer is written relative to the phases in `docs/upgrade-plan.md`.

Principles
----------

*   **Behavior first, implementation second.** The backend and frontend are both being rebuilt, so the most durable tests are black-box tests of user-visible behavior. They are written once, run against the legacy app to prove they describe reality, then become the acceptance gate for the rebuild.
*   **Test the security model explicitly.** The legacy app's worst defects are missing auth and ownership checks. Every write endpoint gets unauthenticated, non-owner and owner cases.
*   **No flakiness tolerated.** Use deterministic seeds, no sleeps (use Playwright auto-waiting and explicit expectations), and isolated databases per test run. A flaky test is a bug and gets fixed, not retried.
*   **Fast feedback.** Unit and request tests run in seconds locally and in CI. E2E runs in CI on every PR and locally on demand.

Layers
------

### 1\. E2E acceptance suite (Playwright, TypeScript) - written in Phase 1

Location: `e2e/` at the repo root, with its own `package.json` so it is independent of the app's frontend tooling.

Runs against a base URL, so the same specs target the legacy app (Phase 1), the rebuilt app (Phases 2-3), and production smoke tests (Phase 4). URL differences between legacy hash routes (`/#/articles/3`) and new routes (`/articles/3`) live in one small `routes.ts` helper chosen by an env var. Specs use role and text locators, never CSS tied to the legacy markup.

Specs, one file per flow:

| Spec | Covers |
|---|---|
| `auth.spec.ts` | Sign up (incl. duplicate username -> error), log in, wrong password, guest login, log out, navbar state per session |
| `articles.spec.ts` | Home lists seed articles, open article, create article (logged in), create blocked when logged out, owner deletes own article from profile |
| `annotations.spec.ts` | Highlighted passages render at correct text; click opens annotation; select text -> form -> create; overlap with existing annotation rejected; logged-out user cannot create; owner can delete, non-owner sees no delete |
| `improvements.spec.ts` | Add and delete own improvement on an annotation; count updates |
| `comments.spec.ts` | Add and delete own comment; logged-out prompt |
| `profile.spec.ts` | Profile shows username, expertise and only that user's articles |
| `visual.spec.ts` | Screenshot comparison of key pages and states (home, article, annotation open, annotation form, profile, login) |

Known legacy bugs are captured as tests marked `test.fail()` against legacy, with a comment linking the defect in `AGENTS.md`. Examples: logout crash, annotating a repeated phrase, deep link to an annotation. They must pass on the rebuild, at which point `test.fail()` is removed. This documents each fix and proves it.

Visual baselines: generated from the legacy app in Phase 1 and committed under `e2e/__screenshots__/legacy/`. In Phase 3 they serve as the reference for a human-reviewed comparison, not an automatic gate, because fonts and Bootstrap 5 rendering will differ slightly. New baselines from the rebuilt app become the gate going forward.

### 2\. Backend tests (Minitest, Rails 8) - written in Phase 2, alongside the code

*   **Model tests** (`test/models/`):
    *   Presence and uniqueness validations, including case-insensitive username.
    *   Annotation offset rules: in bounds, non-negative length, and no overlap on the same article (touching edges allowed or rejected, decided once and matched in the frontend).
    *   `image_link` accepts only http(s).
    *   Dependent destroys.
*   **Request tests** (`test/requests/api/`) for every endpoint:
    *   Happy path with response shape asserted against `docs/api.md`.
    *   401 when logged out.
    *   404 when acting on another user's record.
    *   422 with the standard error shape on invalid input.
    *   CSRF enforced: a request without the token is rejected. Test this in one dedicated test with forgery protection enabled.
*   **Auth tests:**
    *   Login, logout, guest login.
    *   Rate limiting on repeated failed logins.
    *   Session revocation on logout.
    *   Redirect behavior.
*   **Fixtures:** realistic YAML fixtures with associations by label, not ids. Seeds are tested with one test that runs `db:seed` on an empty DB and asserts counts.
*   **Static analysis as tests:** `rubocop`, `brakeman` (zero warnings), and `bundler-audit` (no known CVEs) all fail CI.

### 3\. Frontend unit and component tests (Vitest + React Testing Library) - written in Phase 3

*   **Pure logic, exhaustively:**
    *   Converting a DOM `Range` to body offsets, including repeated phrases, selections spanning highlighted annotation links, and empty or whitespace selections.
    *   Overlap detection, kept identical to the server rule. Share test vectors with the model tests through a JSON fixture file, so both sides prove the same cases.
    *   Splitting the body into text and annotation segments.
*   **Components:**
    *   Annotation panel states.
    *   Forms show a login prompt when logged out.
    *   Owner-only controls.
    *   Error display on failed mutations, using a mocked API client.
*   Type checking (`tsc --noEmit`) and ESLint fail CI.

### 4\. Deploy and production checks - Phase 4

*   **Post-deploy smoke:** a tagged subset of the E2E suite (`@smoke`: home loads, article renders, guest login works) runs against production after every Kamal deploy, read-only except for the guest session.
*   The `/up` health check is verified by kamal-proxy before traffic switches.
*   No backup or restore testing: the data has no value. Rebuilding from seeds is covered by the seeds idempotency test (layer 2) and the post-deploy smoke run.

CI (GitHub Actions)
-------------------

Jobs run on every PR and on `master`:

1.  **lint:** rubocop, eslint, tsc.
2.  **security:** brakeman, bundler-audit, `npm audit --omit=dev` at high severity.
3.  **backend:** Minitest against a Postgres service.
4.  **frontend:** Vitest.
5.  **e2e:** builds the production Docker image, boots it with Postgres via compose, seeds, runs Playwright. Traces and screenshots are uploaded on failure.

Merge to `master` requires all jobs to pass. Deploy (Phase 4) runs only after that.

Coverage targets
----------------

Coverage is a smoke alarm, not a goal.

*   Backend: SimpleCov at 95%+ line coverage on `app/models` and `app/controllers`.
*   Frontend: 100% branch coverage on the offset and overlap modules, with no target for UI components.
*   E2E: every flow in `AGENTS.md` has at least one spec, and every legacy defect has a regression test.

Sequencing summary
------------------

| Phase | Tests produced |
|---|---|
| 1 | Playwright acceptance suite passing on legacy (known bugs marked `test.fail()`) plus legacy visual baselines |
| 2 | Model, request and auth Minitest suite; CI with lint, security and backend; E2E API-shape checks |
| 3 | Vitest unit and component tests; full E2E passing on the rebuild with `test.fail()` markers removed; new visual baselines |
| 4 | `@smoke` subset in the deploy pipeline |
