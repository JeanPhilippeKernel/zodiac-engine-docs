import { test, expect } from '@playwright/test';

test('editorial releases page exposes highlights, changelog, and useful links', async ({ page }) => {
  await page.goto('project/releases/');
  await expect(page.locator('.release-hero').getByRole('heading', { name: 'ZEngine 1.0.0' })).toBeVisible();
  await expect(page.locator('.release-feature')).toHaveCount(4);
  await expect(page.locator('.table-of-contents')).toHaveCount(0);
  const navigation = page.getByRole('navigation', { name: 'Release navigation' });
  await expect(navigation.getByRole('link', { name: 'Previous versions' })).toHaveAttribute('href', 'https://github.com/JeanPhilippeKernel/RendererEngine/releases');
  await navigation.getByRole('link', { name: 'Changelog', exact: true }).click();
  await expect(page).toHaveURL(/#changelog$/);
  await expect(navigation.getByRole('link', { name: 'Changelog', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect(page.getByRole('heading', { name: 'Every change has a story.' })).toBeInViewport();
  await page.getByRole('link', { name: 'Read migration notes' }).click();
  await expect(page.getByRole('heading', { name: 'Breaking change: VFS-backed asset import' })).toBeInViewport();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Breaking change: VFS-backed asset import' })).toBeInViewport();
  await page.goto('project/releases/#zengine-100');
  await expect(page.locator('#zengine-100')).toBeInViewport();
});

test('release artwork follows the theme and the editorial layout fits mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('project/releases/');
  await expect(page.locator('.release-hero').getByRole('heading', { name: 'ZEngine 1.0.0' })).toBeVisible();
  await expect(page.locator('.release-hero-art')).toHaveCSS('background-image', /hero-light/);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('.release-hero-art')).toHaveCSS('background-image', /hero-dark/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.release-chapter-links').getByRole('link', { name: /ASSET PIPELINE/ }).click();
  await expect(page.getByRole('heading', { name: 'Give your assets a home.' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.release-feature').filter({ has: page.getByRole('heading', { name: 'Build on your terms.' }) })
    .getByRole('link', { name: 'Find your build instructions' }).click();
  await expect(page.getByRole('heading', { name: 'Build from source', exact: true })).toBeVisible();
});

test('release highlights are searchable and open the correct section', async ({ page }) => {
  await page.goto('project/releases/');
  await page.locator('.release-hero').getByRole('heading', { name: 'ZEngine 1.0.0' }).waitFor();
  await page.keyboard.press('Control+k');
  const input = page.getByRole('combobox', { name: 'Search the documentation' });
  await input.fill('Give your assets a home');
  await expect(page.getByRole('option').first()).toContainText('Releases and changelog');
  await input.press('Enter');
  await expect(page).toHaveURL(/#asset-highlights$/);
  await expect(page.getByRole('heading', { name: 'Give your assets a home.' })).toBeInViewport();
});
