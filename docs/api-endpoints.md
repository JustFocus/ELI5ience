# API Endpoints

## HTML API

### Users

- `GET /users/new`
- `POST /users`
- `PATCH /users`

### Session

- `GET /session/new`
- `POST /session`
- `DELETE /session`

## JSON API

### Articles

- `GET /api/articles`
  - Articles index/search
  - accepts `tag_name` query param to list articles by tag
- `POST /api/articles`
- `GET /api/articles/:id`
- `PATCH /api/articles/:id`
- `DELETE /api/articles/:id`

### Annotations

- `GET /api/annotations`
- `POST /api/annotations`
- `GET /api/annotations/:id`
- `PATCH /api/annotations/:id`
- `DELETE /api/annotations/:id`
- `GET /api/annotations/:id/articles`
  - index of all annotations for an article

### Comments

- `GET /api/comments`
- `POST /api/comments`
- `GET /api/comments/:id`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`
- `GET /api/comments/:id/articles`
  - index of all comments for an article

### Improvements

- `GET /api/improvements`
- `POST /api/improvements`
- `GET /api/improvements/:id`
- `PATCH /api/improvements/:id`
- `DELETE /api/improvements/:id`
- `GET /api/improvements/:id/annotations`
  - index of all improvements for an annotation

### Tags

- An article's tags will be included in the article show template
- `GET /api/tags`
  - includes query param for typeahead suggestions
- `POST /api/articles/:article_id/tags`: add tag to article by name
- `DELETE /api/articles/:article_id/tags/:tag_name`: remove tag from article by
  name
