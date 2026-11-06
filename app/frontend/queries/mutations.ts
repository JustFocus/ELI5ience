import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api";
import type {
  Article,
  CreateAnnotationInput,
  CreateArticleInput,
  CreateCommentInput,
  CreateImprovementInput,
  Id,
} from "~/types/api";
import { queryKeys } from "./keys";

// Mutations patch the cached ["articles", id] entry in place and invalidate the
// list keys that depend on it (docs/api.md "Frontend client notes"). Delete
// endpoints address records by id only, so their variables also carry the
// ids needed to find the cache entry.

function useCache() {
  const queryClient = useQueryClient();
  const patchArticle = (articleId: Id, patch: (article: Article) => Article) => {
    queryClient.setQueryData<Article>(queryKeys.article(articleId), (old) => (old ? patch(old) : old));
  };
  return { queryClient, patchArticle };
}

export function useCreateArticle() {
  const { queryClient } = useCache();
  return useMutation({
    mutationFn: (input: CreateArticleInput) => api.createArticle(input),
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.article(article.id), article);
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(article.user.id) });
    },
  });
}

export function useDeleteArticle() {
  const { queryClient } = useCache();
  return useMutation({
    mutationFn: ({ id }: { id: Id; userId: Id }) => api.deleteArticle(id),
    onSuccess: (_data, { id, userId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.article(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}

export function useCreateAnnotation(articleId: Id) {
  const { patchArticle } = useCache();
  return useMutation({
    mutationFn: (input: CreateAnnotationInput) => api.createAnnotation(articleId, input),
    onSuccess: (annotation) => {
      patchArticle(articleId, (article) => ({
        ...article,
        annotations: [...article.annotations, annotation].sort((a, b) => a.selection_start - b.selection_start),
      }));
    },
  });
}

export function useDeleteAnnotation(articleId: Id) {
  const { patchArticle } = useCache();
  return useMutation({
    mutationFn: (annotationId: Id) => api.deleteAnnotation(annotationId),
    onSuccess: (_data, annotationId) => {
      patchArticle(articleId, (article) => ({
        ...article,
        annotations: article.annotations.filter((a) => a.id !== annotationId),
      }));
    },
  });
}

export function useCreateImprovement(articleId: Id, annotationId: Id) {
  const { patchArticle } = useCache();
  return useMutation({
    mutationFn: (input: CreateImprovementInput) => api.createImprovement(annotationId, input),
    onSuccess: (improvement) => {
      patchArticle(articleId, (article) => ({
        ...article,
        annotations: article.annotations.map((a) =>
          a.id === annotationId ? { ...a, improvements: [...a.improvements, improvement] } : a,
        ),
      }));
    },
  });
}

export function useDeleteImprovement(articleId: Id, annotationId: Id) {
  const { patchArticle } = useCache();
  return useMutation({
    mutationFn: (improvementId: Id) => api.deleteImprovement(improvementId),
    onSuccess: (_data, improvementId) => {
      patchArticle(articleId, (article) => ({
        ...article,
        annotations: article.annotations.map((a) =>
          a.id === annotationId ? { ...a, improvements: a.improvements.filter((i) => i.id !== improvementId) } : a,
        ),
      }));
    },
  });
}

export function useCreateComment(articleId: Id) {
  const { queryClient, patchArticle } = useCache();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => api.createComment(articleId, input),
    onSuccess: (comment) => {
      patchArticle(articleId, (article) => ({ ...article, comments: [...article.comments, comment] }));
      // comments_count on the cards.
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteComment(articleId: Id) {
  const { queryClient, patchArticle } = useCache();
  return useMutation({
    mutationFn: (commentId: Id) => api.deleteComment(commentId),
    onSuccess: (_data, commentId) => {
      patchArticle(articleId, (article) => ({
        ...article,
        comments: article.comments.filter((c) => c.id !== commentId),
      }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
