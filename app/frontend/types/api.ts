// Every JSON shape of /api/v1. Source of truth: docs/api.md. Keep in sync.

/** Ids are JSON numbers. Timestamps are ISO 8601 UTC strings with milliseconds. */
export type Id = number;
export type Timestamp = string;

/** Embedded owner of every owned resource. */
export interface User {
  id: Id;
  username: string;
  expertise: string | null;
}

/** GET /me. `user` is null when logged out. */
export interface MeResponse {
  user: User | null;
}

/** Item of the list endpoints (GET /articles, GET /users/:id). */
export interface ArticleSummary {
  id: Id;
  title: string;
  /** First 200 characters of the body, newlines collapsed, "..." if truncated. */
  excerpt: string;
  image_link: string | null;
  comments_count: number;
  user: User;
  created_at: Timestamp;
}

/** GET /articles */
export interface ArticlesResponse {
  articles: ArticleSummary[];
}

export interface Improvement {
  id: Id;
  annotation_id: Id;
  body: string;
  user: User;
  created_at: Timestamp;
}

/** Offsets are UTF-16 code units into `Article.body`. */
export interface Annotation {
  id: Id;
  article_id: Id;
  selection_start: number;
  selection_length: number;
  body: string;
  user: User;
  improvements: Improvement[];
  created_at: Timestamp;
}

export interface Comment {
  id: Id;
  article_id: Id;
  body: string;
  user: User;
  created_at: Timestamp;
}

/** GET /articles/:id and the response of POST /articles. */
export interface Article {
  id: Id;
  title: string;
  body: string;
  image_link: string | null;
  user: User;
  created_at: Timestamp;
  /** Ordered by selection_start. */
  annotations: Annotation[];
  /** Ordered by created_at. */
  comments: Comment[];
}

/** GET /users/:id */
export interface UserProfile extends User {
  created_at: Timestamp;
  articles: ArticleSummary[];
}

// Request bodies (flat JSON objects, no wrapper key).

export interface CreateArticleInput {
  title: string;
  body: string;
  image_link?: string | null;
}

export interface CreateAnnotationInput {
  selection_start: number;
  selection_length: number;
  body: string;
}

export interface CreateImprovementInput {
  body: string;
}

export interface CreateCommentInput {
  body: string;
}

// Errors

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "invalid_csrf_token"
  | "not_found"
  | "validation_failed"
  /** Client-side only: network failure or a non-JSON error response. */
  | "unknown";

/** field -> messages. Field names are request body keys. `{}` when not field related. */
export type ErrorDetails = Record<string, string[]>;

/** Body of every non-2xx JSON response. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details: ErrorDetails;
  };
}
