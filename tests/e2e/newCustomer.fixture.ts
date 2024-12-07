import { Page } from '@playwright/test';

async function newCustomerFixture(page: Page) {
  // Fill in the form fields with valid data
  await page.goto("http://localhost:5173/customer/new")

  await page.selectOption('#customer_type', 'buy'); // Select file type
  await page.selectOption('#property_type', 'A'); // Select property type
  await page.fill('#budget', '250000'); // For sell type; changed to ID selector
  await page.fill('#m2', '100'); // Changed to ID selector
  await page.fill('#bedroom', '3'); // Changed to ID selector
  await page.fill('#year', '2020'); // Changed to ID selector
  await page.fill('#customerPhone', '09123456789'); // Valid phone number; changed to ID selector
  await page.fill('#customerName', 'John Doe'); // Changed to ID selector

  // Click the submit button
  await page.click('button[type="submit"]');

}

export { newCustomerFixture }
