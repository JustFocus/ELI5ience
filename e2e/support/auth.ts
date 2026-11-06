import { expect, type Page } from '@playwright/test';
import { routes } from './routes';

// Auth helpers. Locators follow the accessible names used by the login form
// (app/views/shared/_user_form.html.erb): labelled text inputs and submit
// buttons. Sign Out is a navbar link (app/views/shared/_navbar.html.erb).

export async function loginAsGuest(page: Page): Promise<void> {
  await page.goto(routes.login());
  await page.getByRole('button', { name: 'Log In as Guest', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Sign Out', exact: true })).toBeVisible();
}

export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto(routes.login());
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Sign Out', exact: true }).click();
}
