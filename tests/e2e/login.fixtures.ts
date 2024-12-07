// fixtures.ts
import { Page } from 'playwright';

async function loginFixture(page: Page) {
  try {
    // Navigate to the login page
    await page.goto("http://localhost:5173/agents/login");

    // Fill in the login form with valid credentials
    await page.fill('#username', 'test_username');
    await page.fill('#password', 'test_password');

    // Click the submit button
    await page.click('#submit');

    // Wait for navigation or any specific element that indicates login success
    await page.waitForNavigation();

  } catch (error) {
    console.error("Error during login fixture:", error);
  }
}


export { loginFixture }
