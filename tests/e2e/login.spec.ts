import { test, expect } from '@playwright/test';

test.describe('Login Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/agents/login'); // Adjust the URL as necessary
  });

  test('should redirect to login page when accessing home page without logging in', async ({ page }) => {
    // Navigate directly to the home page
    await page.goto('/');

    // Assert that the user is redirected to the login page
    await expect(page).toHaveURL('/agents/login');

    // Optionally check if the login form is visible
    const loginForm = await page.locator('#login');
    await expect(loginForm).toBeVisible();
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Fill in the login form with valid credentials
    await page.fill('input[name="username"]', 'test_username');
    await page.fill('input[name="password"]', 'test_password');

    // Click the submit button
    await page.click('#submit');

    // Assert that the user is redirected to the home page
    await expect(page).toHaveURL('/');

    // Optionally, check if local storage contains tokens
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    const agentsField = await page.evaluate(() => localStorage.getItem('agents_field'));
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(agentsField).toBeTruthy();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Fill in the login form with invalid credentials
    await page.fill('input[name="username"]', 'invalid_username');
    await page.fill('input[name="password"]', 'invalid_password');

    // Click the submit button
    await page.click('#submit');

    // Assert that an error message is displayed
    const errorMessage = await page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('نام کاربری یا ورمز عبور اشتباه است');
  });
});
