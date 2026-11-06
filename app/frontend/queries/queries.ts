import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import type { Id } from "~/types/api";
import { queryKeys } from "./keys";

/** Current user: `data.user` is null when logged out. Login state only changes through full page loads. */
export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: ({ signal }) => api.getMe(signal), staleTime: Infinity });
}

export function useArticles() {
  return useQuery({ queryKey: queryKeys.articles, queryFn: ({ signal }) => api.getArticles(signal) });
}

export function useArticle(id: Id) {
  return useQuery({ queryKey: queryKeys.article(id), queryFn: ({ signal }) => api.getArticle(id, signal) });
}

export function useUser(id: Id) {
  return useQuery({ queryKey: queryKeys.user(id), queryFn: ({ signal }) => api.getUser(id, signal) });
}
