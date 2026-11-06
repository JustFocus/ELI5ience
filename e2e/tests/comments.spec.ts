import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { loginAsGuest } from '../support/auth';
import { routes } from '../support/routes';
import { GUEST_USER, SEED_ARTICLE_TITLES } from '../support/seed';

// Seed article 1 ("Rocket Engines") and its seed comments, from db/seeds.rb.
const SEED_ARTICLE_TITLE = SEED_ARTICLE_TITLES[0];
const SEED_COMMENTS = [
  { body: 'Great article!', author: 'EngineerGuy' },
  { body: "I'd love to see some more annotations on this!", author: 'CSPro' },
  { body: 'Thanks', author: GUEST_USER.username },
] as const;

// Unique per run so created comments never collide with each other or with
// data left behind by earlier runs against the same database.
const RUN_ID = randomUUID().slice(0, 8);

// Seed comments are never deleted. Tests that delete only remove comments they
// posted themselves.
function commentItem(page: Page, text: string) {
  return page.getByRole('listitem').filter({ hasText: text });
}

// Opens an article through the home list, the way a user reaches it. Opening
// /#/articles/:id directly on a fresh load renders the article without its
// comments in the legacy app, so specs never rely on that route.
async function openArticle(page: Page, title: string): Promise<void> {
  await page.goto(routes.home());
  await page
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=..')
    .getByRole('button', { name: 'View article' })
    .click();
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  // The article view refetches its data a few times as it mounts, and the legacy
  // comment form clears whatever the user has typed each time the view re-renders.
  // Let those requests settle before a test types into the form.
  await page.waitForLoadState('networkidle');
}

async function postComment(page: Page, text: string): Promise<void> {
  const draft = page.getByRole('textbox', { name: 'Add a comment...', exact: true });
  await draft.fill(text);
  await expect(draft).toHaveValue(text);
  await page.getByRole('button', { name: 'Post', exact: true }).click();
}

test.describe('comments', () => {
  test('article lists its seed comments with their authors', async ({ page }) => {
    await openArticle(page, SEED_ARTICLE_TITLE);

    for (const seed of SEED_COMMENTS) {
      const item = commentItem(page, seed.body);
      await expect(item).toBeVisible();
      await expect(item.getByRole('link', { name: seed.author, exact: true })).toBeVisible();
    }
  });

  test('logged-in user posts a comment that appears and persists after a fresh load', async ({
    page,
  }) => {
    const text = `E2E comment ${RUN_ID}`;

    await loginAsGuest(page);
    await openArticle(page, SEED_ARTICLE_TITLE);
    await postComment(page, text);

    await expect(commentItem(page, text)).toBeVisible();

    await openArticle(page, SEED_ARTICLE_TITLE);
    await expect(commentItem(page, text)).toBeVisible();
  });

  test('owner sees Delete on their comment and deleting it removes it', async ({ page }) => {
    const text = `E2E delete ${RUN_ID}`;

    await loginAsGuest(page);
    await openArticle(page, SEED_ARTICLE_TITLE);
    await postComment(page, text);

    const item = commentItem(page, text);
    const deleteButton = item.getByRole('button', { name: 'Delete', exact: true });
    await expect(deleteButton).toBeVisible();

    // The confirm() dialog blocks the page until it is answered, so the accept
    // must run alongside the click rather than after it.
    const confirmed = page.waitForEvent('dialog').then(async (confirm) => {
      expect(confirm.message()).toBe('Are you sure you want to delete your comment?');
      await confirm.accept();
    });
    await deleteButton.click();
    await confirmed;

    await expect(item).toHaveCount(0);

    await openArticle(page, SEED_ARTICLE_TITLE);
    await expect(commentItem(page, 'Thanks')).toBeVisible();
    await expect(item).toHaveCount(0);
  });

  test("guest sees no Delete on another user's comment", async ({ page }) => {
    await loginAsGuest(page);
    await openArticle(page, SEED_ARTICLE_TITLE);

    // Wait for the session to load so the Delete button is rendered for the
    // guest's own seed comment. Without this, the absence check could pass early.
    const ownSeed = commentItem(page, 'Thanks');
    await expect(ownSeed.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();

    const otherUsersSeed = commentItem(page, 'Great article!');
    await expect(otherUsersSeed).toBeVisible();
    await expect(otherUsersSeed.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  });

  test('logged-out visitor sees the login prompt instead of the comment form', async ({ page }) => {
    await openArticle(page, SEED_ARTICLE_TITLE);

    // Wait for the comments to load before checking for the absence of the form.
    await expect(commentItem(page, 'Great article!')).toBeVisible();

    // The login prompt takes the place of the Post button. The legacy form still
    // draws the text input for guests, so the submit control is what is checked.
    await expect(page.getByRole('link', { name: 'Login to post a comment!', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Post', exact: true })).toHaveCount(0);
  });
});
