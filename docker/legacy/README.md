# Legacy app via Docker

Runs the unmodified Rails 4.2.3 app (development env) on http://localhost:3000.

- web: ruby:2.3 (2.3.8) + Bundler 1.11.2, node copied from node:8-stretch for execjs
- db: postgres:9.6, configured through `DATABASE_URL` (config/database.yml untouched)
- Entry point runs `db:create db:schema:load db:seed`, then `rails server -b 0.0.0.0`.
  `schema:load` recreates all tables, so every start gives a freshly seeded DB.
- The Dockerfile bumps bootstrap-sass 3.2.0.2 (yanked from rubygems) to 3.2.0.4 in the
  image's Gemfile.lock copy only. The repo's Gemfile.lock is not modified.

Commands (from the repo root; requires the `docker compose` v2 plugin):

    docker compose -f docker/legacy/compose.yml up --build -d   # start (first build takes a few minutes)
    docker compose -f docker/legacy/compose.yml logs -f web     # wait for "WEBrick::HTTPServer#start"
    docker compose -f docker/legacy/compose.yml restart web     # reset DB to seed data
    docker compose -f docker/legacy/compose.yml down -v         # stop and drop the DB volume

Smoke test:

    curl -s localhost:3000/api/articles | head -c 200
    # Guest login: GET /session/new for authenticity_token + cookie, then POST /session with
    # user[username]=guest_user user[password]=guestguest; GET /api/session returns the user.

Code is baked into the image (COPY), so rebuild with `--build` after code changes.
