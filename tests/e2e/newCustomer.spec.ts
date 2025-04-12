import { test, expect } from '@playwright/test';
import { loginFixture } from './login.fixtures'

test.describe('NewCustomer Component', () => {
  test.beforeEach(async ({ page }) => {
    // the fixture for login
    await loginFixture(page)
    // Navigate to the page with the form
    await page.goto('http://localhost:5173/customer/new'); // Adjust URL as necessary
  })

  test('should submit the form with valid data', async ({ page }) => {
    // Fill in the form fields with valid data
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

    // Assert that a success message is displayed or check for redirection
    const successMessage = await page.getByRole('alert');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText(/یک مشتری اضافه شد/); // Adjust based on your success message
  });


  test('should show an error when submitting invalid phone numbers', async ({ page }) => {

    // Fill in the form fields with valid data for rent type
    await page.selectOption('#customer_type', 'rent'); // Select file type
    await page.selectOption('#property_type', 'A'); // Select property type
    await page.fill('#upBudget', '2500'); // For sell type; changed to ID selector
    await page.fill('#rentBudget', '24'); // For sell type; changed to ID selector
    await page.fill('#m2', '100'); // Changed to ID selector
    await page.fill('#bedroom', '3'); // Changed to ID selector
    await page.fill('#year', '2020'); // Changed to ID selector
    await page.fill('#customerPhone', '0912349'); // Valid phone number; changed to ID selector
    await page.fill('#customerName', 'John Doe'); // Changed to ID selector


    // Set up a listener for dialog events (alerts)
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message(); // Capture the alert message
      await dialog.accept(); // Accept the alert to close it
    });

    // Click the submit button which should trigger the alert
    await page.click('button[type="submit"]');

    // Assert that the alert message is as expected
    expect(alertMessage).toEqual("شماره تلفن باید ۱۱ رقم باشد");
  });

});
