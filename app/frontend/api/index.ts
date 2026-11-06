import type {
  Annotation,
  Article,
  ArticlesResponse,
  Comment,
  CreateAnnotationInput,
  CreateArticleInput,
  CreateCommentInput,
  CreateImprovementInput,
  Id,
  Improvement,
  MeResponse,
  UserProfile,
} from "~/types/api";
import { request } from "./client";

export { ApiError } from "./client";

const base = "/api/v1";

/** One typed function per endpoint in docs/api.md. Components use the hooks in ~/queries, not this. */
export const api = {
  getMe: (signal?: AbortSignal) => request<MeResponse>(`${base}/me`, { signal }),
  getArticles: (signal?: AbortSignal) => request<ArticlesResponse>(`${base}/articles`, { signal }),
  getArticle: (id: Id, signal?: AbortSignal) => request<Article>(`${base}/articles/${id}`, { signal }),
  getUser: (id: Id, signal?: AbortSignal) => request<UserProfile>(`${base}/users/${id}`, { signal }),

  createArticle: (input: CreateArticleInput) =>
    request<Article>(`${base}/articles`, { method: "POST", body: input }),
  deleteArticle: (id: Id) => request<undefined>(`${base}/articles/${id}`, { method: "DELETE" }),

  createAnnotation: (articleId: Id, input: CreateAnnotationInput) =>
    request<Annotation>(`${base}/articles/${articleId}/annotations`, { method: "POST", body: input }),
  deleteAnnotation: (id: Id) => request<undefined>(`${base}/annotations/${id}`, { method: "DELETE" }),

  createImprovement: (annotationId: Id, input: CreateImprovementInput) =>
    request<Improvement>(`${base}/annotations/${annotationId}/improvements`, { method: "POST", body: input }),
  deleteImprovement: (id: Id) => request<undefined>(`${base}/improvements/${id}`, { method: "DELETE" }),

  createComment: (articleId: Id, input: CreateCommentInput) =>
    request<Comment>(`${base}/articles/${articleId}/comments`, { method: "POST", body: input }),
  deleteComment: (id: Id) => request<undefined>(`${base}/comments/${id}`, { method: "DELETE" }),
};
