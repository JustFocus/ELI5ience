ELI5ience API v1
================

Contract for `/api/v1`. The Rails 8 backend (Phase 2) and the React frontend (Phase 3) are built and tested against this document in parallel. Request tests assert these shapes; the frontend API client and its mocks use the same shapes. If code and this file disagree, fix one of them in the same PR.

Conventions
-----------

*   **Format:** JSON only. Requests with a body send `Content-Type: application/json` with a flat object (no `{"article": {...}}` wrapper). Unknown keys are ignored. Malformed JSON returns 400 `bad_request`. Responses are `application/json`, except 204 which has no body.
*   **Auth:** cookie session from the Rails 8 authentication generator. Login, signup, guest login and logout are server-rendered HTML pages, not API endpoints. The only auth-related endpoint is `GET /api/v1/me`. Reads are public; every non-GET request requires a logged-in user.
*   **CSRF:** every non-GET request must send `X-CSRF-Token` with the value of `<meta name="csrf-token">` from the SPA shell page. Missing or wrong token: 403 `invalid_csrf_token`. This is the only use of 403.
*   **Keys:** `snake_case`. **Timestamps:** ISO 8601 UTC with milliseconds, e.g. `"2026-03-02T18:47:44.123Z"`. **Ids:** integers (bigint in the DB; always JSON numbers, safe in JS).
*   **Ownership:** every owned resource (article, annotation, improvement, comment) exposes `user` as an embedded object `{id, username, expertise}`. There are no `author_id`, `user_id`, `username` or `expertise` keys at the resource level. `expertise` is a string or `null`. The DB uses `user_id` everywhere.
*   **Authorization:** anyone logged in may create annotations, improvements and comments on any article. Only the owner of a record may delete it (an annotation owner cannot delete other users' improvements, and an article owner cannot delete other users' comments or annotations). Acting on a record you do not own returns 404, identical to a missing record, so existence is not leaked.
*   **Mutation responses:** POST returns 201 and the created resource in the same shape as when nested in `GET /articles/:id`. DELETE returns 204 with no body. There is no PATCH or PUT anywhere in v1.
*   **Cascades:** deleting an article deletes its annotations, improvements and comments. Deleting an annotation deletes its improvements.
*   **Ordering:** article lists newest first (`created_at desc, id desc`). Within an article: annotations by `selection_start` ascending, comments and improvements by `created_at` ascending, `id` ascending as tiebreak.
*   **N+1:** the backend eager-loads (`includes`) everything a response nests.

### Errors

One shape for every non-2xx JSON response:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Selection start overlaps an existing annotation",
    "details": { "selection_start": ["overlaps an existing annotation"] }
  }
}
```

`code` is a stable machine tag, `message` is human readable (safe to display), `details` is an object of `field -> [messages]` and is `{}` when not field related. Field names in `details` are the request body keys.

| Status | `code` | When |
|---|---|---|
| 400 | `bad_request` | Malformed JSON |
| 401 | `unauthorized` | Non-GET request with no logged-in user |
| 403 | `invalid_csrf_token` | CSRF token missing or wrong |
| 404 | `not_found` | Record missing, **or exists but is not owned by the current user** (DELETE), or unknown route |
| 422 | `validation_failed` | Validation failure on create (`details` populated) |

Order of checks: CSRF (403), authentication (401), existence and ownership (404), validation (422). Rate limiting is only on the HTML login page, not the API.

### Shared object shapes

**User (embedded):** `{ "id": 7, "username": "carl_s", "expertise": "Astrophysicist" }`

**Article summary** (list endpoints):

```json
{
  "id": 3,
  "title": "Why is the sky blue?",
  "excerpt": "Sunlight looks white, but it is really a mix of all colors. When it hits the air, the short blue waves bounce around much more than the long red ones, so blue light ends up com...",
  "image_link": "https://example.com/sky.jpg",
  "comments_count": 2,
  "user": { "id": 7, "username": "carl_s", "expertise": "Astrophysicist" },
  "created_at": "2026-03-02T18:47:44.123Z"
}
```

`excerpt`: the first 200 characters of `body` (Unicode codepoints, never splitting a surrogate pair), with trailing whitespace stripped and `...` appended only if the body was longer than 200. Newlines are collapsed to single spaces. `image_link` is `null` when absent.

**Annotation:**

```json
{
  "id": 11,
  "article_id": 3,
  "selection_start": 0,
  "selection_length": 8,
  "body": "Sunlight is just light from the sun.",
  "user": { "id": 8, "username": "ada", "expertise": "Physicist" },
  "improvements": [],
  "created_at": "2026-03-02T19:00:00.000Z"
}
```

**Improvement:** `{ "id": 5, "annotation_id": 11, "body": "...", "user": {...}, "created_at": "..." }`

**Comment:** `{ "id": 9, "article_id": 3, "body": "...", "user": {...}, "created_at": "..." }`

Fields not listed (`background_link`, `locked`, `updated_at`) are dropped from the API: the frontend never used them.

Validation limits (server-enforced, 422 on violation): article `title` 1-200 chars, article `body` 1-50000 chars, annotation/improvement/comment `body` 1-2000 chars (all after stripping surrounding whitespace). Lengths count Unicode codepoints.

Endpoints
---------

### GET /api/v1/me

Auth: none. Always 200.

```json
{ "user": { "id": 7, "username": "carl_s", "expertise": "Astrophysicist" } }
```

Logged out: `{ "user": null }`. Replaces legacy `GET /api/session`. The frontend uses this for "is logged in" and ownership checks (`article.user.id === me.id`).

### GET /api/v1/users/:id

Auth: none. 200, or 404 `not_found`. Profile plus that user's article summaries (same shape and ordering as the list; capped at 100 like the index).

```json
{
  "id": 7,
  "username": "carl_s",
  "expertise": "Astrophysicist",
  "created_at": "2026-03-01T10:00:00.000Z",
  "articles": [
    {
      "id": 3,
      "title": "Why is the sky blue?",
      "excerpt": "Sunlight looks white...",
      "image_link": null,
      "comments_count": 2,
      "user": { "id": 7, "username": "carl_s", "expertise": "Astrophysicist" },
      "created_at": "2026-03-02T18:47:44.123Z"
    }
  ]
}
```

### GET /api/v1/articles

Auth: none. 200. Summaries for the home cards.

```json
{ "articles": [ { "...article summary..." } ] }
```

**Pagination: none.** The dataset is small (seed data plus a handful of user posts) and the home page renders every card, so the list returns the newest **100** articles with no cursor or page params. The cap is a safety bound, not a feature. The wrapper object (`{"articles": [...]}`) leaves room to add `next_cursor` later without breaking clients. Summaries exclude `body`, annotations and comments, so the payload stays small.

### GET /api/v1/articles/:id

Auth: none. 200, or 404.

```json
{
  "id": 3,
  "title": "Why is the sky blue?",
  "body": "Sunlight looks white, but it is really a mix of all colors...",
  "image_link": "https://example.com/sky.jpg",
  "user": { "id": 7, "username": "carl_s", "expertise": "Astrophysicist" },
  "created_at": "2026-03-02T18:47:44.123Z",
  "annotations": [
    {
      "id": 11,
      "article_id": 3,
      "selection_start": 0,
      "selection_length": 8,
      "body": "Sunlight is just light from the sun.",
      "user": { "id": 8, "username": "ada", "expertise": "Physicist" },
      "created_at": "2026-03-02T19:00:00.000Z",
      "improvements": [
        {
          "id": 5,
          "annotation_id": 11,
          "body": "Maybe say 'the light our sun makes'.",
          "user": { "id": 9, "username": "guest_user", "expertise": null },
          "created_at": "2026-03-02T19:30:00.000Z"
        }
      ]
    }
  ],
  "comments": [
    {
      "id": 9,
      "article_id": 3,
      "body": "Great explanation!",
      "user": { "id": 9, "username": "guest_user", "expertise": null },
      "created_at": "2026-03-02T19:10:00.000Z"
    }
  ]
}
```

`body` is the exact string annotation offsets index into (see Annotation offsets). The server normalizes line endings to `\n` when saving, so what the client reads is what offsets refer to.

### POST /api/v1/articles

Auth: required. Request:

```json
{ "title": "Why is the sky blue?", "body": "Sunlight looks white...", "image_link": "https://example.com/sky.jpg" }
```

`title` and `body` required. `image_link` optional, must be an `http` or `https` URL (parseable, with a host, at most 2048 chars) or `null`/omitted; empty string is treated as `null`. Any other scheme (`javascript:`, `data:`, `ftp:`) gives 422 with `details.image_link`.

Response 201: the full article shape from `GET /articles/:id` with `"annotations": []` and `"comments": []`.

Errors: 401, 403, 422 (`details` keyed by `title`, `body`, `image_link`).

### DELETE /api/v1/articles/:id

Auth: owner. 204. 404 if missing or not owned. 401 if logged out.

### Article editing: PATCH is out of scope for v1

Offsets index into `body`, so any body edit silently corrupts or invalidates annotations. The simplest robust rule is to make articles immutable: no `PATCH`, no body, title or image edits. To change an article, delete it (which deletes its annotations) and post a new one. This keeps the invariant "annotation offsets always match the body they were created against" true by construction, with no migration or re-anchoring logic. If editing is wanted later, the minimum safe design is: allow `title` and `image_link` edits freely, and allow `body` edits only when the article has zero annotations. Not in v1.

### POST /api/v1/articles/:article_id/annotations

Auth: any logged-in user. Request:

```json
{ "selection_start": 0, "selection_length": 8, "body": "Sunlight is just light from the sun." }
```

All three required. `selection_start` and `selection_length` must be JSON integers (strings or floats are 422 `"is not an integer"`). Response 201: the annotation shape with `"improvements": []`. Errors: 401, 403, 404 (article missing), 422.

**Annotation offsets (normative):**

*   **Units: UTF-16 code units**, i.e. the same units as JavaScript `String.prototype.length`, `slice` and DOM `Range` offsets. The browser computes offsets in JS, and the frontend renders with `body.slice(start, end)`, so the server must count the same way or any article containing emoji or other astral characters (each is 2 units) would anchor to the wrong text. Ruby `String#length` counts codepoints and is **not** acceptable. Server-side, compute `body_length = body.encode("UTF-16LE").bytesize / 2`, and treat overlap and bounds purely numerically (the server never slices by these offsets). Both sides use the same numbers, so no slicing mismatch is possible. Offsets landing inside a surrogate pair are not rejected; the browser never produces them.
*   Notation: `start = selection_start`, `len = selection_length`, `end = start + len` (exclusive), `body_length` = UTF-16 length of the article body.
*   Rules, checked in this order, first failure reported:
    1.  `start >= 0`, else `details.selection_start: ["must be greater than or equal to 0"]`.
    2.  `len >= 1`, else `details.selection_length: ["must be greater than or equal to 1"]`.
    3.  `end <= body_length`, else `details.selection_length: ["extends past the end of the article"]`.
    4.  No overlap: for every existing annotation `a` on the article, ranges must satisfy `end <= a.start` or `a.end <= start`, else `details.selection_start: ["overlaps an existing annotation"]`.
*   **Touching ranges are allowed** (`end == a.start` or `a.end == start`). Legacy rejected them. This is the correct interval semantics for half-open ranges and lets users annotate adjacent phrases; the frontend highlights segments independently, so no rendering issue arises.
*   Overlap check races: the backend must serialize annotation creation per article (lock the article row, `with_lock`, around check-and-insert) so two concurrent requests cannot both pass.
*   The server does not store or compare the selected text, only offsets.

Overlap example, 422:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Selection start overlaps an existing annotation",
    "details": { "selection_start": ["overlaps an existing annotation"] }
  }
}
```

(`message` is `"<Field humanized> <first detail>"` for the first failing field.)

### DELETE /api/v1/annotations/:id

Auth: owner. 204. 404 if missing or not owned. Cascades to its improvements.

### POST /api/v1/annotations/:annotation_id/improvements

Auth: any logged-in user. Request: `{ "body": "Maybe say 'the light our sun makes'." }`. Response 201:

```json
{
  "id": 5,
  "annotation_id": 11,
  "body": "Maybe say 'the light our sun makes'.",
  "user": { "id": 9, "username": "guest_user", "expertise": null },
  "created_at": "2026-03-02T19:30:00.000Z"
}
```

Errors: 401, 403, 404 (annotation missing), 422 (`details.body`).

### DELETE /api/v1/improvements/:id

Auth: owner of the improvement. 204. 404 otherwise.

### POST /api/v1/articles/:article_id/comments

Auth: any logged-in user. Request: `{ "body": "Great explanation!" }`. Response 201:

```json
{
  "id": 9,
  "article_id": 3,
  "body": "Great explanation!",
  "user": { "id": 9, "username": "guest_user", "expertise": null },
  "created_at": "2026-03-02T19:10:00.000Z"
}
```

Errors: 401, 403, 404 (article missing), 422 (`details.body`).

### DELETE /api/v1/comments/:id

Auth: owner. 204. 404 otherwise.

Routes summary
--------------

```
GET    /api/v1/me
GET    /api/v1/users/:id
GET    /api/v1/articles
GET    /api/v1/articles/:id
POST   /api/v1/articles
DELETE /api/v1/articles/:id
POST   /api/v1/articles/:article_id/annotations
DELETE /api/v1/annotations/:id
POST   /api/v1/annotations/:annotation_id/improvements
DELETE /api/v1/improvements/:id
POST   /api/v1/articles/:article_id/comments
DELETE /api/v1/comments/:id
```

Nothing else is routed under `/api/v1` (no index/show/update for annotations, improvements, comments; unknown routes return 404 `not_found` JSON).

Frontend client notes
---------------------

*   TanStack Query keys: `["me"]`, `["articles"]`, `["articles", id]`, `["users", id]`. After a mutation, update or invalidate `["articles", id]` (and `["articles"]` for article create/delete and `comments_count`, `["users", id]` for article create/delete). No refetch-everything.
*   The fetch wrapper sends `credentials: "same-origin"`, `Accept: application/json`, and on non-GET `X-CSRF-Token`. It throws a typed `ApiError` carrying `status`, `code`, `message`, `details` parsed from the error shape; 204 resolves to `undefined`.
*   On 401 the UI sends the user to the server-rendered login page.

Changes from legacy API
-----------------------

| Legacy | v1 |
|---|---|
| `/api/...` unversioned | `/api/v1/...` |
| `GET /api/session` returns array-ish user or null | `GET /api/v1/me` returns `{"user": ... \| null}` |
| `GET /api/articles` returned every article with nested comments, annotations, improvements | Summaries only (excerpt, comments_count), newest 100; full data via `GET /articles/:id` |
| Mixed `author_id` / `user_id`, flattened `username`, `expertise` on each object | Uniform embedded `user: {id, username, expertise}` |
| `background_link`, `locked`, `updated_at` exposed | Dropped |
| Create: `{annotation: {...}}` wrapper, `author_id`/`user_id` client-supplied | Flat body, user taken from the session; client cannot set ownership |
| Annotation create returned all annotations of the article; delete returned the record | POST returns the created annotation; DELETE returns 204 |
| Comment/improvement `created_at` was the user's `created_at` (bug) | The record's own `created_at` |
| Annotation offsets by `indexOf` on selected text, any units | Explicit `selection_start`/`selection_length` in UTF-16 code units, validated (bounds, overlap) |
| Touching annotations rejected | Touching allowed |
| Article `PATCH`, `index`/`show`/`update` for other resources, unrouted actions | Removed; articles immutable, no PATCH anywhere |
| No auth or ownership checks; failures were 500s or silent | 401, 404 (not owned), 422, 403 (CSRF) with one error shape |
| `image_link` unvalidated (`javascript:` XSS) | http(s) only |
| Mutations returned arbitrary shapes (`render json: ...`, error arrays) | Created resource in the nested shape, or standard error |

Shared test vectors
-------------------

Machine-readable source of truth: `docs/annotation_vectors.json`. Minitest (Annotation model and request tests) and Vitest (frontend overlap module) both load this file and must pass every vector. Add a vector there whenever a rule changes or a bug is found.

Vector schema: `name`, `body_length` (UTF-16 units), optional `body` (when present, `body_length` equals its JS `.length`), `existing` (list of `[start, length]`), `proposed` (`[start, length]`), `valid`, and for invalid cases `error_field` (key in `error.details`) and `reason` (`invalid_start`, `invalid_length`, `out_of_bounds`, `overlap`). Backend tests build a body of `body_length` UTF-16 units (use `body` when given), create the `existing` annotations directly, then assert validity and, when invalid, the `error_field`.

Summary (body length 10 unless noted; existing as `[start,len]`):

| Existing | Proposed | Result | Reason |
|---|---|---|---|
| none | [0,10] | valid | whole body |
| none | [-1,3] | invalid | `invalid_start` |
| none | [2,0] | invalid | `invalid_length` |
| none | [7,3] | valid | ends exactly at body end |
| none | [7,4] | invalid | `out_of_bounds` |
| [0,5] (len 20) | [5,5] | valid | touching after |
| [5,5] (len 20) | [0,5] | valid | touching before |
| [0,5] (len 20) | [4,5] | invalid | `overlap` by one unit |
| [2,10] (len 20) | [4,2] | invalid | `overlap`, inside |
| [4,2] (len 20) | [2,10] | invalid | `overlap`, contains |
| [3,4] (len 20) | [3,4] | invalid | `overlap`, identical |
| [0,5],[10,5] (len 20) | [5,5] | valid | exact gap fit |
| [0,5],[10,5] (len 20) | [5,6] | invalid | `overlap`, too long for gap |
| none, body `"a😀b"` (len 4) | [0,4] | valid | astral char is 2 units (a codepoint-counting server wrongly rejects this) |
| none, body `"a😀b"` (len 4) | [0,5] | invalid | `out_of_bounds` |
