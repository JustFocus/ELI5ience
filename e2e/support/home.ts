import type { Locator, Page } from '@playwright/test';

// Home page controls. Legacy renders these as role=button anchors; the rebuilt
// app renders real links styled as buttons, so match either.

export function viewArticleControl(page: Page, title: string): Locator {
  const card = page.getByRole('heading', { name: title, exact: true }).locator('xpath=..');
  return card
    .getByRole('link', { name: 'View article' })
    .or(card.getByRole('button', { name: 'View article' }));
}

export function createArticleControl(page: Page): Locator {
  return page
    .getByRole('link', { name: /Create article/ })
    .or(page.getByRole('button', { name: /Create article/ }));
}
