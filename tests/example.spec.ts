import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Fantasy Football Auction Draft Tool/);

  // Expect the main heading to be visible
  await expect(page.getByRole('heading', { name: /Fantasy Football Auction Draft Tool/ })).toBeVisible();

  // Expect the player search to be present
  await expect(page.getByPlaceholder('Search for players...')).toBeVisible();

  // Expect the budget tracker to be present
  await expect(page.getByText('Remaining Budget')).toBeVisible();
});

test('player search functionality', async ({ page }) => {
  await page.goto('/');

  // Type in the search box
  await page.fill('input[placeholder="Search for players..."]', 'Patrick');

  // Wait for search results
  await expect(page.getByText('Patrick Mahomes')).toBeVisible();
});

test('budget tracker displays correctly', async ({ page }) => {
  await page.goto('/');

  // Check that budget components are visible
  await expect(page.getByText('$200')).toBeVisible(); // Total budget
  await expect(page.getByText('Remaining Budget')).toBeVisible();
});