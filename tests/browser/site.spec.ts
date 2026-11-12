import { test, expect } from '@playwright/test';

test('home links, theme persistence, and Markdown navigation work', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Build worlds with Zodiac Engine' })).toBeVisible();
  await expect(page.locator('.pathway-card')).toHaveCount(3);
  await expect(page.locator('.ecosystem-card')).toHaveCount(2);
  await expect(page.locator('main')).not.toContainText('Tetragrama');
  await expect(page.locator('.sidebar').getByRole('link', { name: 'Editor', exact: true })).toHaveCount(0);
  await expect(page.locator('.hero-art')).toHaveCSS('background-image', /hero-light/);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.hero-art')).toHaveCSS('background-image', /hero-dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Install ZEngine', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Install ZEngine with Zodiac Engine Hub', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'project configuration', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Project configuration', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Project configuration', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Install ZEngine with Zodiac Engine Hub', exact: true })).toBeVisible();
});

test('keyboard search navigates to matching sections and reports empty results', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Build worlds with Zodiac Engine' })).toBeVisible();
  await page.keyboard.press('Control+k');
  const input = page.getByRole('combobox', { name: 'Search the documentation' });
  await input.fill('project configuration');
  await expect(page.getByRole('option').first()).toContainText('Project configuration');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: 'Project configuration', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await input.fill('xyz-nonexistent-document-123');
  await expect(page.getByRole('status')).toContainText('No results');
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('deep links render Markdown tables, code, diagrams, and original heading IDs', async ({ page }) => {
  await page.goto('development/build-from-source/#cmake-presets');
  await expect(page.getByRole('heading', { name: 'Build from source', exact: true })).toBeVisible();
  await expect(page.locator('#cmake-presets')).toBeVisible();
  await expect(page.locator('.markdown table').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy code' }).first()).toBeVisible();
  await page.goto('reference/architecture/');
  await expect(page.locator('.mermaid svg').first()).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.markdown h2').first()).toHaveAttribute('id', /.+/);
});

test('mobile navigation is usable and content does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Build worlds with Zodiac Engine' })).toBeVisible();
  await expect(page.locator('.sidebar')).not.toBeInViewport();
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.locator('.sidebar').getByRole('link', { name: 'Reference', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Engine reference', exact: true })).toBeVisible();
  await expect(page.locator('.sidebar')).not.toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('reference/architecture/');
  await expect(page.locator('.mermaid svg').first()).toBeVisible({ timeout: 30000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('unknown pages show an actionable 404 rather than an empty screen', async ({ page }) => {
  await page.goto('not-a-page/');
  await expect(page.getByRole('heading', { name: 'Lost between worlds?' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to documentation' }).click();
  await expect(page.getByRole('heading', { name: 'Build worlds with Zodiac Engine' })).toBeVisible();
});

test('legacy proposal URLs still open documents that moved upstream', async ({ page }) => {
  await page.goto('design/future-plan/editor-grid/');
  await expect(page.getByRole('heading', { name: 'ZEngine — Serialized Editor Grid', exact: true })).toBeVisible();
  await expect(page.locator('.markdown blockquote')).toContainText('Completion scope');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'ZEngine — Serialized Editor Grid', exact: true })).toBeVisible();
});

test('removed Editor pages are no longer served or included in search', async ({ page }) => {
  for (const route of ['editor/', 'editor/assets-and-importing/', 'editor/scenes/']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'Lost between worlds?' })).toBeVisible();
  }
  await page.goto('./');
  await page.getByRole('heading', { name: 'Build worlds with Zodiac Engine' }).waitFor();
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox', { name: 'Search the documentation' }).fill('Tetragrama');
  await expect(page.getByRole('option').first()).toBeVisible();
  await expect(page.locator('#search-results')).not.toContainText('Use the editor');
  await expect(page.locator('#search-results')).not.toContainText('Scenes and authoring');
  await expect(page.locator('#search-results')).not.toContainText('Assets and importing');
});
