import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { loginAsGuest } from '../support/auth';
import { IS_LEGACY, legacyRetry } from '../support/legacy';
import { routes } from '../support/routes';
import { selectText } from '../support/selection';

// Body of the article each test creates for itself. "Since they" occurs twice
// and the two occurrences are not adjacent to anything else.
const BODY =
  'Alpha beta gamma delta. Since they fly, birds sing. ' +
  'Epsilon zeta eta theta. Since they swim, fish glide. Iota kappa lambda.';

// Seed article 1 ("Rocket Engines"): annotation 1 anchors "Oberth effect" and
// annotation 3 anchors "such as cold gas thrusters".
const SEED_ARTICLE_ID = 1;
const OBERTH_BODY =
  'A maneuver in which a rocket falls into a gravitational well, and then accelerates when its fall reaches maximum speed.';

function articleBody(page: Page): Locator {
  return page.locator('.art-body, [data-testid="article-body"]');
}

function annotationPanel(page: Page): Locator {
  return page.locator('#annotation, [data-testid="annotation-panel"]');
}

/**
 * Click a highlighted passage and wait for its annotation to show. Legacy can
 * render an empty panel when the click lands before the router/store settle
 * ("By: undefined"), so retry the click (reloading on later attempts) until
 * the body appears.
 */
async function openAnnotation(page: Page, passage: string, bodyText: string | RegExp) {
  await legacyRetry(async (attempt) => {
    // A legacy render exception ("Cannot read properties of undefined") can
    // leave React in a broken state until the page is reloaded.
    if (attempt > 0) await page.reload();
    await page.getByRole('link', { name: passage, exact: true }).click();
    await expect(annotationPanel(page)).toContainText(bodyText, IS_LEGACY ? { timeout: 2000 } : {});
  });
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
  await expect(page.getByRole('link', { name: 'Sign Out', exact: true })).toBeVisible();
}

/** Sign up a fresh user and create an article owned by them. Returns its id. */
async function createOwnArticle(page: Page, username: string, expertise: string) {
  await signUp(page, username, expertise);
  await page.goto(routes.newArticle());
  await page.getByPlaceholder('Title').fill(uniqueName('Article '));
  await page.getByPlaceholder('Body').fill(BODY);
  await page.getByRole('button', { name: 'Create article' }).click();
  await expect(page).toHaveURL(/articles\/\d+(\?.*)?$/);
  const articleId = Number(/articles\/(\d+)(\?.*)?$/.exec(page.url())![1]);
  await expect(articleBody(page)).toContainText('Alpha beta gamma delta.');
  return articleId;
}

async function annotate(page: Page, phrase: string, body: string, occurrence = 0) {
  await selectText(articleBody(page), phrase, occurrence);
  await expect(page.getByText('Creating annotation for:')).toBeVisible();
  await page.getByPlaceholder('Add annotation...').fill(body);
  await page.getByRole('button', { name: 'Create annotation' }).click();
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

test.describe('seed annotations (read only)', () => {
  test('highlighted passages render as links with the right text', async ({ page }) => {
    await page.goto(routes.article(SEED_ARTICLE_ID));
    await expect(articleBody(page)).toContainText('A rocket engine is a type of jet engine');
    await expect(page.getByRole('link', { name: 'Oberth effect', exact: true })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'such as cold gas thrusters', exact: true }),
    ).toBeVisible();
    // Annotation 2 highlights the whole first two sentences.
    await expect(
      page.getByRole('link', { name: /^A rocket engine is a type of jet engine .* Newton's third law\.\s*$/ }),
    ).toBeVisible();
  });

  test('clicking a highlighted passage shows its body, author and expertise', async ({ page }) => {
    await page.goto(routes.article(SEED_ARTICLE_ID));
    await openAnnotation(page, 'Oberth effect', OBERTH_BODY);
    const panel = annotationPanel(page);
    await expect(panel.getByRole('link', { name: 'TheRocketeer' })).toBeVisible();
    await expect(panel).toContainText('Rocket Science');
    await expect(panel).toContainText('3 Annotation Improvements');
  });

  test('a logged-in user selecting text that overlaps an annotation gets no form', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto(routes.article(SEED_ARTICLE_ID));
    await expect(page.getByRole('link', { name: 'Oberth effect', exact: true })).toBeVisible();
    // Starts in plain text and ends inside the "Oberth effect" highlight.
    await selectText(articleBody(page), 'efficiency and Oberth');
    await expect(page.getByText('Select Text to create an annotation')).toBeVisible();
    await expect(page.getByText('Creating annotation for:')).toHaveCount(0);
  });

  test('a logged-out user selecting text sees a login prompt, not a submit button', async ({ page }) => {
    await page.goto(routes.article(SEED_ARTICLE_ID));
    await expect(articleBody(page)).toContainText('The ideal exhaust');
    await selectText(articleBody(page), 'hydrogen, the lightest');
    await expect(page.getByText('Creating annotation for:')).toBeVisible();
    await expect(page.getByText('"hydrogen, the lightest"')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login to create an annotation!' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create annotation' })).toHaveCount(0);
  });

  // Known legacy defect (docs/api.md legacy-vs-v1 table, AGENTS.md flow 2):
  // deep links to an annotation URL do not open the annotation.
  test.fail('deep link to an annotation URL shows the annotation', async ({ page }) => {
    await page.goto(routes.annotation(SEED_ARTICLE_ID, 1));
    await expect(articleBody(page)).toContainText('A rocket engine is a type of jet engine');
    await expect(annotationPanel(page)).toContainText(OBERTH_BODY);
  });
});

test.describe('creating and deleting annotations', () => {
  test('select a phrase, create an annotation, see it highlighted and persisted', async ({ page }) => {
    const username = uniqueName('ann');
    await createOwnArticle(page, username, 'Ornithologist');

    await selectText(articleBody(page), 'Epsilon zeta');
    await expect(page.getByText('Creating annotation for:')).toBeVisible();
    await expect(page.getByText('"Epsilon zeta"')).toBeVisible();
    await page.getByPlaceholder('Add annotation...').fill('Two greek letters.');
    await page.getByRole('button', { name: 'Create annotation' }).click();

    const link = page.getByRole('link', { name: 'Epsilon zeta', exact: true });
    await expect(link).toBeVisible();

    await page.reload();
    await expect(link).toBeVisible();
    await openAnnotation(page, 'Epsilon zeta', 'Two greek letters.');
    const panel = annotationPanel(page);
    await expect(panel.getByRole('link', { name: username })).toBeVisible();
    await expect(panel).toContainText('Ornithologist');
  });

  test('selecting text overlapping the new annotation does not open the form', async ({ page }) => {
    await createOwnArticle(page, uniqueName('ann'), 'Ornithologist');
    await annotate(page, 'beta gamma', 'Middle bit.');
    await expect(page.getByRole('link', { name: 'beta gamma', exact: true })).toBeVisible();

    await selectText(articleBody(page), 'gamma delta');
    await expect(page.getByText('Creating annotation for:')).toHaveCount(0);
    await selectText(articleBody(page), 'Alpha beta gamma delta');
    await expect(page.getByText('Creating annotation for:')).toHaveCount(0);
  });

  test('owner sees Delete on their annotation and deleting removes it', async ({ page }) => {
    await createOwnArticle(page, uniqueName('ann'), 'Ornithologist');
    await annotate(page, 'Iota kappa', 'Greek again.');
    const link = page.getByRole('link', { name: 'Iota kappa', exact: true });
    await expect(link).toBeVisible();
    await openAnnotation(page, 'Iota kappa', 'Greek again.');

    page.once('dialog', (dialog) => void dialog.accept());
    await annotationPanel(page).getByRole('button', { name: 'Delete' }).click();
    await expect(link).toHaveCount(0);

    await page.reload();
    await expect(articleBody(page)).toContainText('Iota kappa lambda.');
    await expect(page.getByRole('link', { name: 'Iota kappa', exact: true })).toHaveCount(0);
  });

  test('a non-owner sees no Delete on someone else\'s annotation', async ({ page, browser, baseURL }) => {
    const articleId = await createOwnArticle(page, uniqueName('ann'), 'Ornithologist');
    await annotate(page, 'Alpha beta', 'First two letters.');
    await expect(page.getByRole('link', { name: 'Alpha beta', exact: true })).toBeVisible();

    const guest = await otherSession(browser, baseURL);
    try {
      await loginAsGuest(guest.page);
      await guest.page.goto(routes.article(articleId));
      await openAnnotation(guest.page, 'Alpha beta', 'First two letters.');
      const panel = annotationPanel(guest.page);
      await expect(panel.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    } finally {
      await guest.context.close();
    }

    // Logged-out visitors see no Delete either.
    const anon = await otherSession(browser, baseURL);
    try {
      await anon.page.goto(routes.article(articleId));
      await openAnnotation(anon.page, 'Alpha beta', 'First two letters.');
      const panel = annotationPanel(anon.page);
      await expect(panel.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    } finally {
      await anon.context.close();
    }
  });

  // Known legacy defect (AGENTS.md "New annotations use body.indexOf(selection)"):
  // selecting the second occurrence of a repeated phrase anchors to the first.
  test.fail('annotating the second occurrence of a repeated phrase anchors to it', async ({ page }) => {
    await createOwnArticle(page, uniqueName('ann'), 'Ornithologist');
    await annotate(page, 'Since they', 'Second one only.', 1);
    const link = page.getByRole('link', { name: 'Since they', exact: true });
    await expect(link).toHaveCount(1);

    const textBefore = await articleBody(page).evaluate((root) => {
      const a = Array.from(root.querySelectorAll('a')).find((el) => el.textContent === 'Since they')!;
      const range = document.createRange();
      range.setStart(root, 0);
      range.setEndBefore(a);
      return range.toString().length;
    });
    const secondIndex = BODY.indexOf('Since they', BODY.indexOf('Since they') + 1);
    expect(textBefore).toBe(secondIndex);
  });

  // Known legacy defect (docs/api.md "Touching ranges are allowed"): legacy
  // rejects an annotation that exactly touches an existing one.
  test.fail('an annotation touching an existing one is allowed', async ({ page }) => {
    await createOwnArticle(page, uniqueName('ann'), 'Ornithologist');
    await annotate(page, 'Alpha beta', 'First.');
    await expect(page.getByRole('link', { name: 'Alpha beta', exact: true })).toBeVisible();

    // " gamma" starts exactly where "Alpha beta" ends.
    await selectText(articleBody(page), ' gamma');
    await expect(page.getByText('Creating annotation for:')).toBeVisible();
  });
});
