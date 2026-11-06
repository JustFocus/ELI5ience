import type { Id } from "~/types/api";

/** TanStack Query keys, as documented in docs/api.md "Frontend client notes". */
export const queryKeys = {
  me: ["me"] as const,
  articles: ["articles"] as const,
  article: (id: Id) => ["articles", id] as const,
  user: (id: Id) => ["users", id] as const,
  users: ["users"] as const,
};
