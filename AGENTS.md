ELI5ience agent guide
=====================

ELI5ience is a RapGenius-style site for making hard science articles understandable. Users post articles, select passages of article text to attach "explain like I'm five" annotations, suggest improvements on annotations, and comment on articles. Built in 2016 (App Academy capstone), last deployed on Heroku. It is now being modernized and redeployed - see `docs/upgrade-plan.md` for the plan and current phase, and `docs/test-plan.md` for what must be tested at each layer. Update this file as phases land; sections marked **(legacy)** describe the pre-upgrade code and should be rewritten when that code is replaced.

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
5.  Sign up / log in / log out are server-rendered Rails pages, not part of the SPA.

Architecture (legacy)
---------------------

The backend described below has been removed and replaced by a Rails 8 skeleton (Phase 2, in progress: models, schema, seeds, auth pages and `GET /api/v1/me` exist so far; API controllers are next). The old seed data now lives in `db/seeds.rb`. The frontend description still applies to `frontend/` until Phase 3.

*   Rails 4.2.3 + Postgres. HTML controllers handle auth only (`SessionsController`, `UsersController`); `StaticPagesController#root` serves the shell page that mounts the SPA.
*   JSON API under `/api` (`config/routes.rb`, `app/controllers/api/`, jbuilder views in `app/views/api/`). `GET /api/articles` returns every article with nested comments, annotations and improvements; the frontend refetches it after almost every mutation.
*   Frontend: React 0.14 + Flux + react-router 1 (hash URLs like `/#/articles/3`) in `frontend/`, built by webpack 1 into the committed `app/assets/javascripts/bundle.js`, then served through Sprockets. Styling is Bootstrap 3 plus `app/assets/stylesheets/application.css.sass` (dark space theme).
*   Auth: hand-rolled session-token in `app/controllers/application_controller.rb` and `app/models/user.rb`. CSRF for API writes works only because `jquery_ujs` injects `X-CSRF-Token` into jQuery AJAX - replacing jQuery must preserve this.
*   Tests in `test/` are empty generator stubs with fixtures that do not load. There are no frontend tests.

Known legacy defects (do not port them)
---------------------------------------

*   No server-side auth or ownership checks on any API endpoint.
*   Sign-out crashes (`reset_session_token!` vs `reset_token!`); `api/improvements#show` and `#create` are broken; username is not unique.
*   New annotations use `body.indexOf(selection)`, so selecting a repeated phrase anchors to its first occurrence.
*   `image_link` is rendered as an unvalidated `href` (stored XSS via `javascript:` URLs).
*   Old secrets were committed in early history; they are dead and were removed from the tree, not from history. Never add secrets to the repo; use Rails credentials or ENV.

Development environment
-----------------------

The host has Docker and Node but no Ruby or Postgres. **All Ruby, Rails and database commands run through `docker compose`** (for example `docker compose run --rm app bin/rails db:test:prepare test`); never install Ruby on the host. Commands are in the README "Development" section. Linters and scanners (`bin/rubocop`, `bin/brakeman`, `bin/bundler-audit`) must stay clean; CI is `.github/workflows/ci.yml`.
