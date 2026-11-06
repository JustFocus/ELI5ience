import { expect, test } from '@playwright/test';
import { routes } from '../support/routes';

test('home page loads @smoke', async ({ page }) => {
  await page.goto(routes.home());
  await expect(page).toHaveTitle('ELI5ience');
  await expect(page.getByRole('heading', { name: 'Welcome to ELI5ience!' })).toBeVisible();
});
