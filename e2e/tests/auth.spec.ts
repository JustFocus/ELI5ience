import { expect, test, type Page } from '@playwright/test';
import { login, loginAsGuest, logout, signOutControl } from '../support/auth';
import { IS_LEGACY } from '../support/legacy';
import { routes } from '../support/routes';
import { GUEST_USER } from '../support/seed';

// Fills and submits the server-rendered sign-up form (users/new). The page
// stays on the form after success in legacy, so callers assert logged-in state
// on the home page afterwards.
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

function uniqueUsername(): string {
  return `e2e_${Date.now()}`;
}

test('sign up creates a logged-in session for a new user', async ({ page }) => {
  const username = uniqueUsername();
  await signUp(page, username, 'Testing Expertise', 'secret123');

  await page.goto(routes.home());
  await expect(page.getByRole('link', { name: `Welcome, ${username}`, exact: true })).toBeVisible();
  await expect(signOutControl(page)).toBeVisible();
});

// Uses an account created by the test: the seed personas have random
// passwords (db/seeds.rb), only the guest password is known.
test('log in with an existing account shows the welcome link', async ({ page }) => {
  const username = uniqueUsername();
  await signUp(page, username, 'Testing Expertise', 'secret123');
  await page.goto(routes.home());
  await logout(page);
  await login(page, username, 'secret123');

  await expect(page.getByRole('link', { name: `Welcome, ${username}`, exact: true })).toBeVisible();
  await expect(signOutControl(page)).toBeVisible();
});

test('wrong password shows an error and leaves the visitor logged out', async ({ page }) => {
  await login(page, GUEST_USER.username, 'not-the-password');

  await expect(page.getByText(/^Invalid username or password\.?$/)).toBeVisible();

  await page.goto(routes.home());
  await expect(page.getByRole('link', { name: 'Log In / Guest', exact: true })).toBeVisible();
  await expect(signOutControl(page)).toHaveCount(0);
});

test('Log In as Guest signs in the guest user', async ({ page }) => {
  await page.goto(routes.login());
  await page.getByRole('button', { name: 'Log In as Guest', exact: true }).click();

  await expect(page.getByRole('link', { name: `Welcome, ${GUEST_USER.username}`, exact: true })).toBeVisible();
});

test('logged-out navbar offers login and create-account links', async ({ page }) => {
  await page.goto(routes.home());

  await expect(page.getByRole('link', { name: 'Log In / Guest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Account', exact: true })).toBeVisible();
  await expect(signOutControl(page)).toHaveCount(0);
});

test('logging out returns to a logged-out navbar', async ({ page }) => {
  await loginAsGuest(page);
  await logout(page);

  await expect(page.getByRole('link', { name: 'Log In / Guest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Account', exact: true })).toBeVisible();
  await expect(signOutControl(page)).toHaveCount(0);
});

// Regression test for the legacy defect where sign-out never rotated the
// server-side session, so a cookie copied before sign-out kept authenticating.
test('a session cookie copied before sign-out no longer authenticates', async ({ page, context, browser }) => {
  test.fail(IS_LEGACY, 'legacy defect: sign-out never rotates the session token');
  await loginAsGuest(page);
  const sessionCookies = await context.cookies();
  await logout(page);
  await expect(page.getByRole('link', { name: 'Log In / Guest', exact: true })).toBeVisible();

  // Replay the old cookie in a separate browser context. Replaying in the same
  // context races with late Set-Cookie responses from the sign-out, which
  // overwrite the cookie and make the result flaky.
  const replay = await browser.newContext();
  await replay.addCookies(sessionCookies);
  const replayed = await replay.newPage();
  await replayed.goto(routes.home());

  await expect(replayed.getByRole('link', { name: 'Log In / Guest', exact: true })).toBeVisible();
  await expect(replayed.getByRole('link', { name: `Welcome, ${GUEST_USER.username}`, exact: true })).toHaveCount(0);
  await replay.close();
});

// Regression test for the legacy defect where usernames were not unique.
test('sign up with an existing username is rejected', async ({ page }) => {
  test.fail(IS_LEGACY, 'legacy defect: usernames are not unique');
  // Create the first account here rather than reusing a seed name, so a
  // legacy run that accepts the duplicate does not leave an extra guest_user row.
  const username = uniqueUsername();
  await signUp(page, username, 'First Expertise', 'secret123');
  await signUp(page, username, 'Duplicate Expertise', 'secret456');

  await expect(page.getByText(/already (been )?taken|already exists/i)).toBeVisible();
});
