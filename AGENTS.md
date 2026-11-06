ELI5ience agent guide
=====================

ELI5ience is a RapGenius-style site for making hard science articles understandable. Users post articles, select passages of article text to attach "explain like I'm five" annotations, suggest improvements on annotations, and comment on articles. Built in 2016 (App Academy capstone), last deployed on Heroku. It is now being modernized and redeployed - see `docs/upgrade-plan.md` for the plan and current phase, and `docs/test-plan.md` for what must be tested at each layer. Update this file as phases land.

Domain
------

Authoritative schema: `db/schema.rb`. Older design docs in `docs/` (schema, API, components, phases) are historical and may be stale.

*   **User** - username, expertise (free-text credential like "Astrophysicist"), bcrypt password. Owns everything below.
*   **Article** - title, plain-text body (stored with `\n` line endings), optional http(s) image link. Immutable once posted (no edit endpoint).
*   **Annotation** - belongs to an article; anchors to the body by `selection_start` + `selection_length` in UTF-16 code units. Must be in bounds and must not overlap other annotations (touching is allowed). Create via `Annotation.create_serialized!`, which locks the article row.
*   **Improvement** - short suggestion attached to an annotation.
*   **Comment** - attached to an article.

Every owned record has `user_id` (no `author_id`, `locked` or `background_link`). Foreign keys cascade on delete. Validation limits, offset rules and error messages are specified in `docs/api.md`; shared test vectors are in `docs/annotation_vectors.json`.

Invariants worth preserving through any rewrite:

*   Annotation offsets index into the raw `body` string, so editing an article body invalidates annotations. Any feature that edits bodies must handle this.
*   Only the owner may delete (or edit) their own content. Ownership must be enforced server-side, not just hidden in the UI.
*   A guest account (`guest_user`, created by `db/seeds.rb`) is offered on the login page for demo access.

Core user flows
---------------

1.  Browse article cards on the home page; open an article.
2.  Article page: body on the left with annotated passages highlighted as links; right panel shows a tooltip, the selected annotation (with its improvements), or the new-annotation form; comments below.
3.  Select text in the body -> if it does not overlap an existing annotation, the new-annotation form opens for that range (logged-in users only).
4.  User profile page lists the user's articles; owners can create and delete articles.
5.  Sign up / log in / log out are server-rendered Rails pages, not part of the SPA. The SPA routes are `/`, `/articles/new`, `/articles/:id`, `/articles/:id/annotations/:annotation_id` and `/users/:id`.

Architecture
------------

*   Rails 8.1 + Postgres. Auth pages (login, signup, guest login, logout) are server-rendered ERB (`SessionsController`, `UsersController`, `app/views/layouts/application.html.erb` with the navbar and footer). JSON API under `/api/v1` (contract: `docs/api.md`).
*   SPA shell: `SpaController#show` renders `app/views/spa/show.html.erb` (an empty `<div id="root">` plus the Vite tags inside the layout's `<main>`). Client routes are listed explicitly in `config/routes.rb` (no catch-all) and must be kept in sync with `app/frontend/App.tsx`. The SPA reads the current user from `GET /api/v1/me`; never inline user data in the HTML.
*   Frontend lives in `app/frontend/` (vite_rails; `~/` aliases it in imports; config in `config/vite.json`, `vite.config.ts`, `vitest.config.ts`). Sprockets is gone; Propshaft only serves leftovers in `app/assets`.
    *   `entrypoints/application.tsx` (React mount: QueryClientProvider, BrowserRouter) and `entrypoints/theme.scss` (stylesheet loaded by the layout for every page, including the server-rendered ones).
    *   `App.tsx` - the route table. `pages/` - one component per route, named `<Name>Page.tsx`; `ArticleShowPage`, `ArticleFormPage` and `UserProfilePage` are placeholders to fill in. `components/` - shared components (`ArticleCard`, `LoadingState`/`ErrorState`). Put custom hooks in `hooks/`.
    *   `api/` - `request()` fetch wrapper (same-origin, JSON, `X-CSRF-Token` from the meta tag on non-GET, `ApiError` with `status`/`code`/`message`/`details`, 204 -> `undefined`) and the typed `api` object with one function per endpoint. `types/api.ts` - every shape from `docs/api.md`. Update both when the API changes.
    *   `queries/` - the only place components get server data: query hooks (`useMe`, `useArticles`, `useArticle(id)`, `useUser(id)`), mutation hooks that patch or invalidate the cache per the documented keys (`queries/keys.ts`), and `createQueryClient` (a 401 on a mutation redirects to `/session/new`). Pages call these hooks, never `fetch` or `api` directly.
    *   `styles/` - Sass: `_variables.scss` (legacy palette + Bootstrap overrides), `_bootstrap.scss` (only the Bootstrap modules and utilities in use; add what you need), one partial per area (`_layout`, `_auth`, `_home`, ...) forwarded in `index.scss`. Annotation highlight colors are CSS custom properties (`--eli-annotation-*`) in `_base.scss`. Images go in `images/` (referenced from SCSS, or from ERB with `vite_image_tag`).
    *   Tests are colocated (`*.test.ts(x)`), use Vitest + React Testing Library, mock `fetch` with `vi.stubGlobal`, and use `test/render.tsx` (`renderWithProviders`, `jsonResponse`, fixtures that follow `docs/api.md`).
*   Conventions: function components and hooks, strict TypeScript (no `any`), real `<a>`/`<Link>` for navigation and `<button>` only for actions, semantic headings, `role="status"`/`role="alert"` for loading and errors. Run `npm run lint && npm run typecheck && npm test` before committing. The Vite dev server runs inside `docker compose up` (`bin/dev`). Rails tests build the frontend once on demand (`test_helper.rb`), so `node_modules` must exist (the compose entrypoint installs it).
*   Playwright acceptance suite in `e2e/` (own package.json); it needs a seeded DB and a running app.

Legacy frontend (`frontend/`, deleted at the end of Phase 3)
------------------------------------------------------------

Reference only; do not port its style. React 0.14 + Flux + react-router 1 with hash URLs. Its CSS is on the `legacy-baseline` tag (`app/assets/stylesheets/`).

Known legacy defects (do not port them)
---------------------------------------

*   No server-side auth or ownership checks on any API endpoint.
*   Sign-out never rotates the server-side session token (it calls a nonexistent `reset_session_token!`, which silently returns nil), so a cookie copied before logout still authenticates. `api/improvements#show` and `#create` are broken; username is not unique.
*   New annotations use `body.indexOf(selection)`, so selecting a repeated phrase anchors to its first occurrence.
*   `image_link` is rendered as an unvalidated `href` (stored XSS via `javascript:` URLs).
*   Old secrets were committed in early history; they are dead and were removed from the tree, not from history. Never add secrets to the repo; use Rails credentials or ENV.

Development environment
-----------------------

The host has Docker and Node but no Ruby or Postgres. **All Ruby, Rails and database commands run through `docker compose`** (for example `docker compose run --rm app bin/rails db:test:prepare test`); never install Ruby on the host. Commands are in the README "Development" section. Linters and scanners (`bin/rubocop`, `bin/brakeman`, `bin/bundler-audit`) must stay clean; CI is `.github/workflows/ci.yml`.
