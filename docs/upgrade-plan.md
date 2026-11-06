ELI5ience modernization plan
============================

Goal: a secure, tested, modern ELI5ience redeployed to production, ready for new features.

Decisions made:

*   **Deploy:** Kamal 2 to a VPS (Docker, kamal-proxy with automatic TLS, Postgres as a Kamal accessory).
*   **Frontend:** keep the SPA, port to modern React + Vite.
*   **Data:** fresh start with seed data. No legacy data migration, so the schema can be cleaned up freely.

Strategy: rebuild on a fresh Rails 8 skeleton, don't step through the upgrades
---------------------------------------------------------------------------

The app is small: 5 models, 7 API controllers, about 12 React components, and zero real tests. A stepwise 4.2 -> 5.0 -> ... -> 8.0 upgrade would mean keeping Ruby 2.3-era toolchains working at every hop, and it would carry forward defaults, config and bugs we intend to delete anyway. Instead:

1.  Capture the legacy app's behavior and look as an executable reference: a Playwright acceptance suite (see `docs/test-plan.md`) that passes on legacy and becomes the gate for the rebuild.
2.  Generate a fresh Rails 8 app (Ruby 4.0, Rails 8.1) in place on a branch and port the domain onto it deliberately, with tests.
3.  Rewrite the frontend on React 19 against a clean API contract.

The git history is kept, so the port is still a reviewable diff against the old code.

Phase 0 - Security triage and repo hygiene (done)
-------------------------------------------------

*   Deleted the committed private key, New Relic config, dead Cloudinary code, `.DS_Store` files, `.byebug_history`, stray files, and duplicate assets. Extended `.gitignore` to cover them.
*   The leaked credentials are confirmed inactive or dead, so git history is intentionally not rewritten.
*   The committed `bundle.js` and its map still contain the old Cloudinary values. They are kept for the Phase 1 legacy baseline and are deleted in Phase 3.

Phase 1 - Legacy baseline and acceptance suite
----------------------------------------------------------

*   Use a `ruby:2.3` + Postgres 9.x docker compose file that boots the unmodified legacy app and runs `db:seed`. It goes in the scratch area and is not committed long term. The committed `bundle.js` means Node 4 is not needed.
*   Write the Playwright acceptance suite in `e2e/` (see `docs/test-plan.md`, layer 1). It covers every flow in `AGENTS.md`, marks known legacy bugs as `test.fail()`, and captures visual baselines of each page and state as the pixel reference for Phase 3. This phase is no longer throwaway: the suite is kept permanently.
*   Record the exact JSON response shapes of every `/api` endpoint as the starting point for the new API contract.
*   If Rails 4.2 refuses to boot on available images, write the specs from the code reading and run them first against the Phase 2/3 app instead. Don't sink time into reviving the legacy stack.

Phase 2 - Rails 8 backend (done)
-------------------------------

**Skeleton:**

*   Done (step 1): `rails new` in place with Ruby 4.0, Rails 8.1, Postgres 18, Propshaft, Puma + Thruster, Minitest, RuboCop (rails-omakase), Brakeman, bundler-audit, SimpleCov, the generated Dockerfile, Kamal config and CI.
*   Solid Queue, Cache and Cable, configured for Postgres if needed.
*   Docker compose dev environment: `app` + `postgres`. All commands run through it, and the README documents them.

**Schema** (new migrations, bigint keys, real FKs, NOT NULL, indexes):

*   Rename ownership columns to one convention: `author_id` -> `user_id` everywhere, or the reverse. Recommendation: `user_id`.
*   Add a unique index on `lower(username)`.
*   Make `articles.body` NOT NULL.
*   Validate annotation offsets: within the body bounds, and no overlap with other annotations on the same article. Enforce this server-side in the model, not only in the browser.

**Auth:**

*   Use the Rails 8 authentication generator: `has_secure_password`, a `Session` model with one row per device, signed cookie, and `rate_limit` on login.
*   Keep login and signup as server-rendered pages, restyled to match.
*   Keep the guest login.
*   Signup gets a uniqueness check and a sensible password length.

**Authorization:**

*   Use `before_action :require_authentication` on all API writes.
*   Scope ownership via `Current.user.articles.find(...)` and similar, so other users' records return 404.
*   This is small enough that a gem like Pundit is unnecessary.

**API** (`/api/v1`, jbuilder):

*   Write the contract down in `docs/api.md` before the frontend work starts.
*   Article index returns summaries only; article show returns nested annotations, improvements and comments.
*   Mutations return the created or updated resource.
*   Errors use one consistent JSON shape with proper status codes (401/403/404/422).
*   CSRF via the meta tag plus an `X-CSRF-Token` header from `fetch`.
*   Validate `image_link` as http(s) only.

**Fix or drop every legacy defect listed in `AGENTS.md`.** Do not port unrouted or dead actions.

**Seeds:** port `db/seeds.rb` to use associations instead of hardcoded ids, and keep the content.

**Tests:**

*   Model tests for validations and annotation overlap.
*   Request tests for every endpoint, including unauthenticated and non-owner cases.
*   Real fixtures.
*   CI on GitHub Actions: rubocop, brakeman, `bundler-audit`, and tests.

Phase 3 - Frontend on React 19 + Vite (branch off `rails8`)
-----------------------------------------------------------

**Tooling:**

*   `vite_rails`, TypeScript, React 19 with function components and hooks.
*   React Router 7 with browser history (`/articles/3`, not `/#/`). Rails serves the SPA shell for client routes via a catch-all.
*   TanStack Query for server state, replacing Flux stores, refetch-everything, and the races.
*   A small `fetch` wrapper that sends the CSRF header and handles errors. No jQuery.

**Styling:**

*   Keep the dark space theme and layout, matching the Phase 1 screenshots.
*   Move to Bootstrap 5 via cssbundling/Vite, or plain CSS. Recommendation: Bootstrap 5, since the markup already uses its vocabulary.
*   Turn the animate.css excerpt into a few CSS animations.

**Legacy visual defects to fix** (seen in the `e2e/__screenshots__/legacy/` baselines):

*   The fixed footer covers the bottom row of home cards and the end of the comments box. Make it a normal footer, or reserve space for it.
*   Full-page views show a white band below the footer, because the background uses `fixed` attachment. The background must cover the whole page.
*   Annotated text is low contrast (dim blue on black), and a clicked annotation gets a hard white focus box per line. Use a clear highlight and a tasteful `:focus-visible` style.
*   Improvements repeat the author's expertise twice (`ImprovementIndex.jsx`).
*   The improvements panel is narrower than, and offset from, the annotation panel.
*   The tooltip element has duplicate `id` attributes.
*   Article cover images are hotlinked from `res.cloudinary.com`. Decide whether to keep hotlinking them or copy the seed images into the app, so seeds and visual tests don't depend on a third-party host.

**Legacy behavior defects to fix** (found while writing the e2e suite):

*   Opening `/articles/:id` directly, without going through home first, shows an empty comment list.
*   The comment draft is cleared whenever the article view re-renders, so typing right after the page opens can be lost.
*   The comment input is shown to logged-out visitors; only the Post button is swapped for the login prompt.

**Annotation selection rewrite:**

*   Compute offsets from the DOM `Range` relative to the body container, not with `indexOf`, so repeated phrases anchor correctly.
*   Show an explicit message when a selection overlaps an existing annotation.
*   Make `/articles/:id/annotations/:annId` deep links open the annotation.

**Cleanup:**

*   Delete the old `frontend/`, the webpack config, the committed bundle, Sprockets leftovers, and the CoffeeScript and SCSS stubs.
*   Replace the root `package.json` with the Vite setup.

**Tests:**

*   Vitest for the selection and offset logic.
*   Playwright E2E for every flow in `AGENTS.md`: guest login, create article, annotate, improvement, comment, owner-only deletes, logout.
*   Visual comparison against the Phase 1 screenshots.

Phase 4 - Production deploy with Kamal
--------------------------------------

*   **Sizing: bare minimum.** This is a toy site with almost no traffic; it previously ran on Heroku's free tier. Target a single 1 GB RAM server, ideally free:
    *   **Chosen: Google Cloud e2-micro free tier** (x86, 1 GB RAM). To stay free:
        *   The VM must be in `us-west1`, `us-central1` or `us-east1`.
        *   The boot disk must be **standard persistent disk** (the console defaults to balanced, which is not free), 30 GB or less.
        *   Free egress is 1 GB/month, which is plenty for this site.
        *   Confirm whether the external IPv4 address is charged at setup time.
    *   Reserved static external IP: `34.41.85.118` (the VM must be in the same region as the IP). Point the `eli5ience.com` A record at it.
    *   Fallback if GCP does not work out: AWS Lightsail 1 GB (~$7/mo).
*   **Memory budget** (about 400-600 MB total):
    *   One Puma process (`WEB_CONCURRENCY=1`, 3 threads).
    *   Solid Queue inside Puma (`SOLID_QUEUE_IN_PUMA`); no separate job container.
    *   Postgres tuned small (`shared_buffers` ~32 MB, low `max_connections`).
    *   kamal-proxy.
    *   A 1-2 GB swap file on the host.
*   Images are built in CI and only pulled by the server, so no build happens on the 1 GB box.
*   **No backups.** The site's data has no value. Recovery means redeploying with a fresh database volume and running `db:seed` to restore the baseline content. `db:seed` must stay idempotent and runs on every deploy.
*   Set up a container registry (GHCR). The domain is `eli5ience.com`, which the owner still holds.
*   `config/deploy.yml`:
    *   Web role behind kamal-proxy with Let's Encrypt.
    *   Postgres 18 accessory with a persistent volume.
    *   Secrets via `.kamal/secrets` sourced from a password manager or ENV, never committed.
    *   `force_ssl`, a health check at `/up`, and log level `info`.
*   GitHub Actions deploys on merge to `master` after CI passes.
*   Smoke-test production with the Playwright suite pointed at the live URL.
*   Update the README links and screenshots.

Phase 5 - New features
----------------------

Out of scope until Phase 4 is live. Bring feature ideas once the foundation is in place. Phase 2 tests and the API contract are designed to make that cheap.

Subagent strategy
-----------------

*   **Phase 0:** main agent.
*   **Phase 1:** main agent boots the legacy stack. Then parallel agents write E2E specs, split by flow (auth + profile, articles + comments, annotations + improvements).
*   **Phase 2:** one agent for the skeleton, schema and auth. Then parallel agents in separate git worktrees for (a) API controllers + request tests and (b) seeds + CI. Merge via the main agent.
*   **Phase 3:** starts once `docs/api.md` is stable. Parallel worktree agents for (a) shell, routing and API client, (b) article index/show and annotation selection, (c) comments, improvements and profile. Then one agent for Playwright E2E and visual QA.
*   **Phase 4:** main agent with the user, since it needs credentials and a server.
*   Every agent works on a branch or worktree, runs lint and tests before handing back, and the main agent reviews diffs (`/code-review`) before merging.
