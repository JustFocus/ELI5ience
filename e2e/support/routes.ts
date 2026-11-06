// Route helpers for the app under test. Chosen by APP_ENV so specs never
// hard-code legacy hash URLs or modern path URLs.

export interface Routes {
  home(): string;
  article(id: number | string): string;
  annotation(articleId: number | string, annotationId: number | string): string;
  newArticle(): string;
  user(id: number | string): string;
  login(): string;
  signup(): string;
}

// Legacy app: React Router 1 hash URLs. Auth pages are server-rendered Rails.
const legacy: Routes = {
  home: () => '/#/',
  article: (id) => `/#/articles/${id}`,
  annotation: (articleId, annotationId) =>
    `/#/articles/${articleId}/annotations/${annotationId}`,
  newArticle: () => '/#/articles/new',
  user: (id) => `/#/users/${id}`,
  login: () => '/session/new',
  signup: () => '/users/new',
};

// Modern app: path-based URLs.
const modern: Routes = {
  home: () => '/',
  article: (id) => `/articles/${id}`,
  annotation: (articleId, annotationId) =>
    `/articles/${articleId}/annotations/${annotationId}`,
  newArticle: () => '/articles/new',
  user: (id) => `/users/${id}`,
  // Modern auth paths may change in Phase 2 (for example to /login or
  // /signup); update these two lines when that happens.
  login: () => '/session/new',
  signup: () => '/users/new',
};

const appEnv = process.env.APP_ENV ?? 'legacy';
if (appEnv !== 'legacy' && appEnv !== 'modern') {
  throw new Error(`APP_ENV must be "legacy" or "modern", got "${appEnv}"`);
}

export const routes: Routes = appEnv === 'modern' ? modern : legacy;
