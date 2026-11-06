import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { loginAsGuest } from '../support/auth';
import { createArticleControl, viewArticleControl } from '../support/home';
import { routes } from '../support/routes';
import { SEED_ARTICLE_TITLES } from '../support/seed';

// Seed article 3 ("Electrical Engineering") is authored by EngineerGuy. Its body
// starts with an annotation over characters 0-150, and the next annotation begins
// at 433. The sentence below sits in the unannotated gap, so it renders as plain
// text in one element.
const SEED_ARTICLE_TITLE = 'Electrical Engineering';
const SEED_AUTHOR = 'EngineerGuy';
const SEED_BODY_PHRASE = 'This field first became an identifiable occupation';

// Unique per run so created records never collide with each other or with
// data left behind by earlier runs against the same database.
const RUN_ID = randomUUID().slice(0, 8);

test.describe('articles', () => {
  test('home lists every seed article title', async ({ page }) => {
    await page.goto(routes.home());

    for (const title of SEED_ARTICLE_TITLES) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
  });

  test('View article opens the article with its title, author and body', async ({ page }) => {
    await page.goto(routes.home());

    // Each card is a heading followed by its own "View article" control, so the
    // control is found through the card heading.
    await viewArticleControl(page, SEED_ARTICLE_TITLE).click();

    await expect(page.getByRole('heading', { name: SEED_ARTICLE_TITLE, level: 1 })).toBeVisible();
    // The author also appears on comments, so scope to the "Submitted by" line.
    await expect(
      page
        .getByText('Submitted by:')
        .locator('xpath=..')
        .getByRole('link', { name: SEED_AUTHOR, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(SEED_BODY_PHRASE)).toBeVisible();
  });

  test('logged-in user creates an article and sees it on the article page and home list', async ({
    page,
  }) => {
    const title = `E2E article ${RUN_ID}`;
    const body = `E2E body ${RUN_ID}. Written by the articles spec.`;

    await loginAsGuest(page);
    await page.goto(routes.home());
    await createArticleControl(page).click();

    await page.getByRole('textbox', { name: 'Title', exact: true }).fill(title);
    await page.getByRole('textbox', { name: 'Body', exact: true }).fill(body);
    await page.getByRole('button', { name: 'Create article', exact: true }).click();

    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(page.getByText(body, { exact: true })).toBeVisible();

    await page.goto(routes.home());
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  });

  test('logged-out visitor sees a login link instead of the create button on the new article page', async ({
    page,
  }) => {
    await page.goto(routes.newArticle());

    await expect(page.getByRole('link', { name: 'Login to create an article!', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create article', exact: true })).toHaveCount(0);
  });
});
