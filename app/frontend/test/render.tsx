import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import type { Article, ArticleSummary, User } from "~/types/api";

/** Render with a fresh QueryClient (no retries) and a MemoryRouter at `route`. */
export function renderWithProviders(ui: ReactElement, { route = "/" }: { route?: string } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Resolve `fetch` with JSON (or an empty 204 when `body` is undefined and status is 204). */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Fixtures following docs/api.md.

export const aUser: User = { id: 7, username: "carl_s", expertise: "Astrophysicist" };

export function anArticleSummary(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
  return {
    id: 3,
    title: "Why is the sky blue?",
    excerpt: "Sunlight looks white, but it is really a mix of all colors.",
    image_link: null,
    comments_count: 2,
    user: aUser,
    created_at: "2026-03-02T18:47:44.123Z",
    ...overrides,
  };
}

export function anArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 3,
    title: "Why is the sky blue?",
    body: "Sunlight looks white, but it is really a mix of all colors.",
    image_link: null,
    user: aUser,
    created_at: "2026-03-02T18:47:44.123Z",
    annotations: [],
    comments: [],
    ...overrides,
  };
}
