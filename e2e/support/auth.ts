import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from './routes';

// Auth helpers. Locators follow the accessible names used by the login form
// (app/views/shared/_user_form.html.erb): labelled text inputs and submit
// buttons. See signOutControl for the Sign Out link/button difference.

// Sign Out is a link in the legacy navbar and a button (form POST) in the
// rebuilt app; match either so specs work against both.
export function signOutControl(page: Page): Locator {
  return page
    .getByRole('link', { name: 'Sign Out', exact: true })
    .or(page.getByRole('button', { name: 'Sign Out', exact: true }));
}

export async function loginAsGuest(page: Page): Promise<void> {
  await page.goto(routes.login());
  await page.getByRole('button', { name: 'Log In as Guest', exact: true }).click();
  await expect(signOutControl(page)).toBeVisible();
}

export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto(routes.login());
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
}

export async function logout(page: Page): Promise<void> {
  await signOutControl(page).click();
}
