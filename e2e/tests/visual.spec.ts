import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsGuest } from '../support/auth';
import { routes } from '../support/routes';
import { SEED_ARTICLE_TITLES, SEED_USERS } from '../support/seed';

// Visual baselines for the key pages and states (docs/test-plan.md, layer 1).
// Every screen is captured full page at a fixed viewport on a freshly seeded
// database. Each test waits for the content it shows, so the capture never
// races the SPA or the network.

test.use({ viewport: { width: 1280, height: 800 } });

// Motion is stopped with an injected style on top of the config's
// `animations: 'disabled'`: the tooltip's headShake loop and transitions must
// not move between captures.
const FREEZE_MOTION_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

// Comment timestamps come from the browser clock and timezone, so they are
// masked wherever they appear.
const DATE_MASK = (page: Page): Locator[] => [page.locator('.comment-date')];

async function freezeAndSettle(page: Page): Promise<void> {
  await page.addStyleTag({ content: FREEZE_MOTION_CSS });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? img.decode().catch(() => undefined)
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve());
              img.addEventListener('error', () => resolve());
            }),
      ),
    );
    // The page background is a CSS image on body (see application.css.sass).
    const match = /url\("?([^")]+)"?\)/.exec(getComputedStyle(document.body).backgroundImage);
    if (match) {
      await new Promise<void>((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve();
        probe.onerror = () => resolve();
        probe.src = match[1];
      });
    }
  });
}

// Selects a phrase that sits inside one plain text run of the article body
// with a real mouse drag, the way a reader would select it.
async function dragSelectPhrase(page: Page, phrase: string): Promise<void> {
  const rect = await page.evaluate((text) => {
    const walker = document.createTreeWalker(
      document.querySelector('.art-body') as Element,
      NodeFilter.SHOW_TEXT,
    );
    let node = walker.nextNode();
    while (node && !(node.textContent ?? '').includes(text)) {
      node = walker.nextNode();
    }
    if (!node) throw new Error(`phrase not found in article body: ${text}`);
    const start = (node.textContent ?? '').indexOf(text);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + text.length);
    const box = range.getBoundingClientRect();
    return { left: box.left, right: box.right, midY: box.top + box.height / 2 };
  }, phrase);

  await page.mouse.move(rect.left + 1, rect.midY);
  await page.mouse.down();
  await page.mouse.move(rect.right - 1, rect.midY, { steps: 5 });
  await page.mouse.up();

  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? '');
  expect(selected).toBe(phrase);
}

test('home page, logged out', async ({ page }) => {
  await page.goto(routes.home());
  await expect(page.getByRole('heading', { name: 'Welcome to ELI5ience!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: SEED_ARTICLE_TITLES[0], exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('home-logged-out.png', { fullPage: true });
});

test('home page, logged in as guest', async ({ page }) => {
  await loginAsGuest(page);
  await page.goto(routes.home());
  await expect(page.getByRole('link', { name: 'Welcome, guest_user' })).toBeVisible();
  await expect(page.getByRole('heading', { name: SEED_ARTICLE_TITLES[0], exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('home-logged-in-guest.png', { fullPage: true });
});

test('article page with default tooltip', async ({ page }) => {
  await page.goto(routes.article(1));
  await expect(page.getByRole('heading', { level: 1, name: SEED_ARTICLE_TITLES[0], exact: true })).toBeVisible();
  await expect(page.locator('a.ann-link')).toHaveCount(4);
  await expect(page.getByText('Select Text to create an annotation')).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('article-default-tooltip.png', {
    fullPage: true,
    mask: DATE_MASK(page),
  });
});

test('article page with a seed annotation open', async ({ page }) => {
  await page.goto(routes.article(1));
  await expect(page.getByRole('heading', { level: 1, name: SEED_ARTICLE_TITLES[0], exact: true })).toBeVisible();
  const link = page.getByRole('link', { name: /^A rocket engine is a type of jet engine/ });
  await link.click();
  await expect(
    page.getByText('A garden hose shows how moving fluid can create a force.'),
  ).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('article-annotation-open.png', {
    fullPage: true,
    mask: DATE_MASK(page),
  });
});

test('annotation form after selecting text, logged in', async ({ page }) => {
  await loginAsGuest(page);
  await page.goto(routes.article(1));
  await expect(page.getByRole('heading', { level: 1, name: SEED_ARTICLE_TITLES[0], exact: true })).toBeVisible();
  await expect(page.getByText('Select Text to create an annotation')).toBeVisible();
  // Plain text between the first and second seed annotations, so the
  // selection does not overlap an existing annotation.
  await dragSelectPhrase(page, 'Vehicles propelled by rocket engines');
  await expect(page.getByRole('button', { name: 'Create annotation', exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('annotation-form.png', {
    fullPage: true,
    mask: DATE_MASK(page),
  });
});

test('login page', async ({ page }) => {
  await page.goto(routes.login());
  await expect(page.getByRole('button', { name: 'Log In as Guest', exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('login.png', { fullPage: true });
});

test('signup page', async ({ page }) => {
  await page.goto(routes.signup());
  await expect(page.getByRole('button', { name: 'Create Account', exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('signup.png', { fullPage: true });
});

test('seed user profile page', async ({ page }) => {
  const author = SEED_USERS[1];
  await page.goto(routes.user(2));
  await expect(page.getByRole('heading', { name: `${author.username}'s Articles:` })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Electrical Engineering', exact: true })).toBeVisible();
  await freezeAndSettle(page);
  await expect(page).toHaveScreenshot('profile.png', { fullPage: true });
});
