import { expect, test, type Page } from '@playwright/test';
import { login } from '../support/auth';
import { routes } from '../support/routes';
import { SEED_ARTICLE_TITLES, SEED_ARTICLE_TITLES_BY_AUTHOR, SEED_USER_IDS, SEED_USERS } from '../support/seed';

const ENGINEER = SEED_USERS[1];
const CS_PRO = SEED_USERS[2];

// Checks the profile lists exactly the seeded titles that user authored: each
// seeded title appears once if owned and never otherwise.
async function expectExactlyArticles(page: Page, username: string): Promise<void> {
  // Wait for the articles panel, which renders once the profile's user is loaded.
  await expect(page.getByRole('heading', { name: `${username}'s Articles:`, exact: true })).toBeVisible();
  const owned = SEED_ARTICLE_TITLES_BY_AUTHOR[username];
  for (const title of SEED_ARTICLE_TITLES) {
    const expected = owned.includes(title) ? 1 : 0;
    await expect(page.getByRole('link', { name: title, exact: true })).toHaveCount(expected);
  }
}

async function signUp(page: Page, username: string, expertise: string, password: string): Promise<void> {
  await page.goto(routes.signup());
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Expertise', { exact: true }).fill(expertise);
  await page.getByLabel('Password', { exact: true }).fill(password);
  const posted = page.waitForResponse(
    (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/users',
  );
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await posted;
}

// Creates an article through the article form and waits for the save to
// complete. The app's own navigation after the save is not awaited, because
// the next step reloads the home page anyway.
async function createArticle(page: Page, title: string): Promise<void> {
  await page.goto(routes.newArticle());
  await page.getByPlaceholder('Title', { exact: true }).fill(title);
  await page.getByPlaceholder('Body', { exact: true }).fill(`Body text for ${title}.`);
  const saved = page.waitForResponse(
    (res) => res.request().method() === 'POST' && /\/articles$/.test(new URL(res.url()).pathname),
  );
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await saved;
}

test('profile shows username, expertise and only that user\'s articles', async ({ page }) => {
  await page.goto(routes.user(SEED_USER_IDS[ENGINEER.username]));

  await expect(page.getByRole('listitem').filter({ hasText: 'Username:' })).toHaveText(`Username: ${ENGINEER.username}`);
  await expect(page.getByRole('listitem').filter({ hasText: 'Expertise:' })).toHaveText(`Expertise: ${ENGINEER.expertise}`);
  await expectExactlyArticles(page, ENGINEER.username);
});

test('profile of a user with no seeded articles lists none', async ({ page }) => {
  await page.goto(routes.user(SEED_USER_IDS.TheRocketeer));

  await expect(page.getByRole('listitem').filter({ hasText: 'Username:' })).toHaveText('Username: TheRocketeer');
  await expectExactlyArticles(page, 'TheRocketeer');
});

test('logged-out visitor sees articles but no Delete buttons', async ({ page }) => {
  await page.goto(routes.user(SEED_USER_IDS[ENGINEER.username]));
  await expect(page.getByRole('link', { name: SEED_ARTICLE_TITLES_BY_AUTHOR[ENGINEER.username][0], exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create article', exact: false })).toHaveCount(0);
});

test('logged-in non-owner sees articles but no Delete buttons on another user\'s profile', async ({ page }) => {
  await login(page, CS_PRO.username, CS_PRO.password);
  await expect(page.getByRole('link', { name: `Welcome, ${CS_PRO.username}`, exact: true })).toBeVisible();

  await page.goto(routes.user(SEED_USER_IDS[ENGINEER.username]));
  await expect(page.getByRole('link', { name: SEED_ARTICLE_TITLES_BY_AUTHOR[ENGINEER.username][0], exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create article', exact: false })).toHaveCount(0);
});

test('owner sees a Delete button per own article and deleting one removes it from the profile', async ({ page }) => {
  const username = `e2e_del_${Date.now()}`;
  const keep = `Keep me ${username}`;
  const doomed = `Delete me ${username}`;

  await signUp(page, username, 'Profile Tester', 'secret123');
  await createArticle(page, keep);
  await createArticle(page, doomed);

  // Go through a non-app page first so the home page is a fresh document. A
  // hash-only goto from the article page would keep the old app state.
  await page.goto(routes.signup());
  await page.goto(routes.home());
  await page.getByRole('link', { name: `Welcome, ${username}`, exact: true }).click();

  await expect(page.getByRole('link', { name: keep, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: doomed, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(2);

  // Each Delete button sits in the row of its own article, so pick the row by title.
  const doomedRow = page
    .locator('div')
    .filter({ hasText: doomed })
    .filter({ has: page.getByRole('button', { name: 'Delete', exact: true }) })
    .last();
  page.once('dialog', (dialog) => dialog.accept());
  const deleted = page.waitForResponse(
    (res) => res.request().method() === 'DELETE' && /\/articles\/\d+$/.test(new URL(res.url()).pathname),
  );
  await doomedRow.getByRole('button', { name: 'Delete', exact: true }).click();
  await deleted;

  // The legacy profile does not drop a deleted article from its list in place,
  // so the removal is checked after a reload, which reads the server state.
  await page.reload();
  await expect(page.getByRole('link', { name: keep, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: doomed, exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(1);
});
