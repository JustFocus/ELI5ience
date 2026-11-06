import { MutationCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "~/api";

export const LOGIN_PATH = "/session/new";

/** Full page load: the login page is server-rendered, not part of the SPA. */
function redirectToLogin(): void {
  window.location.assign(LOGIN_PATH);
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    // docs/api.md: on 401 the UI sends the user to the server-rendered login page.
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) redirectToLogin();
      },
    }),
    defaultOptions: {
      queries: {
        // 4xx responses are definitive (not found, ...); only retry transient failures.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
