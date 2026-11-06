import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { loginAsGuest, signOutControl } from '../support/auth';
import { IS_LEGACY, isApiPath, legacyRetry } from '../support/legacy';
import { routes } from '../support/routes';
import { selectText } from '../support/selection';

const BODY = 'Alpha beta gamma delta. Epsilon zeta eta theta. Iota kappa lambda.';

function articleBody(page: Page): Locator {
  return page.locator('.art-body, [data-testid="article-body"]');
}

function annotationPanel(page: Page): Locator {
  return page.locator('#annotation, [data-testid="annotation-panel"]');
}

function uniqueName(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function signUp(page: Page, username: string, expertise: string): Promise<void> {
  await page.goto(routes.signup());
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Expertise', { exact: true }).fill(expertise);
  await page.getByLabel('Password', { exact: true }).fill('password123');
  // Legacy redirects back to the signup page (no navbar there), so wait for
  // the POST to finish and then confirm the session on the home page.
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === '/users'),
    page.getByRole('button', { name: 'Create Account', exact: true }).click(),
  ]);
  await page.goto(routes.home());
  await expect(signOutControl(page)).toBeVisible();
}

/**
 * Sign up a fresh user, create an article and annotate "Alpha beta" on it, then
 * open that annotation. Returns the article id.
 */
async function createOpenAnnotation(page: Page, username: string): Promise<number> {
  await signUp(page, username, 'Ornithologist');
  await page.goto(routes.newArticle());
  await page.getByPlaceholder('Title').fill(uniqueName('Article '));
  await page.getByPlaceholder('Body').fill(BODY);
  await page.getByRole('button', { name: 'Create article' }).click();
  await expect(page).toHaveURL(/articles\/\d+(\?.*)?$/);
  const articleId = Number(/articles\/(\d+)(\?.*)?$/.exec(page.url())![1]);
  await expect(articleBody(page)).toContainText('Alpha beta gamma delta.');

  await selectText(articleBody(page), 'Alpha beta');
  await expect(page.getByText('Creating annotation for:')).toBeVisible();
  await page.getByPlaceholder('Add annotation...').fill('First two letters.');
  await page.getByRole('button', { name: 'Create annotation' }).click();
  await openAnnotation(page);
  return articleId;
}

/**
 * Click the highlighted passage and wait for its annotation to show. Legacy can
 * render an empty panel when the click lands before the router/store settle
 * ("By: undefined"), so retry the click (reloading on later attempts) until
 * the body appears.
 */
async function openAnnotation(page: Page, passage = 'Alpha beta', bodyText = 'First two letters.') {
  await legacyRetry(async (attempt) => {
    // A legacy render exception ("Cannot read properties of undefined") can
    // leave React in a broken state until the page is reloaded.
    if (attempt > 0) await page.reload();
    await page.getByRole('link', { name: passage, exact: true }).click();
    await expect(annotationPanel(page)).toContainText(bodyText, IS_LEGACY ? { timeout: 2000 } : {});
  });
}

/**
 * Legacy refetches articles concurrently with each improvement write (and
 * ignores the broken create response), so the live list can be stale. Wait for
 * the write to finish, then reload and reopen the annotation for a
 * deterministic view of the persisted state.
 */
async function settle(page: Page, write: () => Promise<void>, method: 'DELETE') {
  await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === method && isApiPath(r.url(), 'improvements'),
    ),
    write(),
  ]);
  await page.reload();
  await openAnnotation(page);
}

/**
 * Legacy ImprovementForm clears its text whenever its props update (for
 * example when a background refetch lands), and the input is `required`, so a
 * click after such a reset sends nothing. Retry fill+click until the POST is
 * actually sent, then settle.
 */
async function postImprovement(page: Page, text: string) {
  const panel = annotationPanel(page);
  const response = page.waitForResponse(
    (r) => r.request().method() === 'POST' && isApiPath(r.url(), 'improvements'),
  );
  await legacyRetry(async (attempt) => {
    if (attempt > 0) {
      await page.reload();
      await openAnnotation(page);
    }
    // Let the burst of session/article refetches that follow opening an
    // annotation finish; any of them would clear the typed text.
    await page.waitForLoadState('networkidle');
    await panel.getByPlaceholder('Add an improvement...').fill(text);
    await Promise.all([
      page.waitForRequest((r) => r.method() === 'POST' && isApiPath(r.url(), 'improvements'), {
        timeout: 2000,
      }),
      panel.getByRole('button', { name: 'Post' }).click(),
    ]);
  });
  await response;
  await page.reload();
  await openAnnotation(page);
}

async function otherSession(browser: Browser, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  return { context, page };
}

// The first page load after an app restart can be slow (cold asset pipeline).
// Absorb that once here instead of inside the first test's expectations.
test.beforeAll(async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    await page.goto(routes.article(1));
    await expect(page.getByRole('link', { name: 'Oberth effect' })).toBeVisible({ timeout: 90_000 });
  } finally {
    await context.close();
  }
});

test.describe('improvements', () => {
  test('a logged-in user adds an improvement, the count updates, and the owner deletes it', async ({ page }) => {
    const username = uniqueName('imp');
    await createOpenAnnotation(page, username);
    const panel = annotationPanel(page);
    await expect(panel).toContainText('0 Annotation Improvements');

    await postImprovement(page, 'Say more about beta.');

    await expect(panel).toContainText('1 Annotation Improvements');
    await expect(panel.getByText('Say more about beta.')).toBeVisible();
    await expect(panel.getByRole('listitem').getByRole('link', { name: username })).toBeVisible();

    page.once('dialog', (dialog) => void dialog.accept());
    await settle(
      page,
      () => panel.getByRole('listitem').getByRole('button', { name: 'Delete' }).click(),
      'DELETE',
    );
    await expect(panel).toContainText('0 Annotation Improvements');
    await expect(panel.getByText('Say more about beta.')).toHaveCount(0);
  });

  test('only the author of an improvement sees Delete on it', async ({ page, browser, baseURL }) => {
    const articleId = await createOpenAnnotation(page, uniqueName('imp'));
    const panel = annotationPanel(page);
    await postImprovement(page, 'Owner suggestion.');
    await expect(panel).toContainText('1 Annotation Improvements');

    const guest = await otherSession(browser, baseURL);
    try {
      await loginAsGuest(guest.page);
      await guest.page.goto(routes.article(articleId));
      await openAnnotation(guest.page);
      const guestPanel = annotationPanel(guest.page);
      await expect(guestPanel.getByText('Owner suggestion.')).toBeVisible();
      await expect(guestPanel.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    } finally {
      await guest.context.close();
    }
  });

  test('a logged-out user sees a login prompt instead of a post button', async ({ page }) => {
    // Seed annotation 1 on article 1 ("Oberth effect") has three improvements.
    await page.goto(routes.article(1));
    await openAnnotation(page, 'Oberth effect', '3 Annotation Improvements');
    const panel = annotationPanel(page);
    await expect(panel.getByText('Need more detail').first()).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Login to suggest an improvement!' })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Post' })).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });
});
