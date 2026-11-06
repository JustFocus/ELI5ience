import { expect } from '@playwright/test';

export const IS_LEGACY = (process.env.APP_ENV ?? 'legacy') === 'legacy';

/**
 * Run `action`, retrying until it passes ONLY against the legacy app, whose
 * store/refetch races are documented in the specs that use this. The rebuilt
 * app must pass on the first attempt, so there `action` runs exactly once and
 * any failure is a real bug. `attempt` is 0 on the first run.
 */
export async function legacyRetry(action: (attempt: number) => Promise<void>): Promise<void> {
  if (!IS_LEGACY) {
    await action(0);
    return;
  }
  let attempt = 0;
  await expect(async () => {
    await action(attempt++);
  }).toPass();
}

/**
 * Matches API paths for `resource` in both apps: legacy `/api/<resource>[/id]`
 * and rebuilt `/api/v1/<resource>/id` or nested `/api/v1/<parent>/<id>/<resource>`.
 */
export function isApiPath(url: string, resource: string): boolean {
  return new RegExp(`^/api/(v1/)?([a-z_]+/\\d+/)?${resource}(/\\d+)?$`).test(new URL(url).pathname);
}
