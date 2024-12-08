import { test, expect } from '@playwright/test';
import { loginFixture } from './login.fixtures'
import { newFileFixture } from "./newFile.fixture"


test.describe('NewFile Component', () => {
  test.beforeEach(async ({ page }) => {
    // the fixture for login
    await loginFixture(page)
    await newFileFixture(page)
    // Navigate to the page with the form
    await page.goto('http://localhost:5173/');
    await page.locator('#file_id').first().click();
    await page.click('#updateButton');
  })

  test('should submit the form with valid data', async ({ page }) => {


    // Fill in the form fields with valid data
    await page.selectOption('#property_type', 'A'); // Select property type
    await page.fill('#address', '123 Main St'); // Changed to ID selector
    await page.fill('#upPrice', '250000'); // For sell type; changed to ID selector
    await page.fill('#rentPrice', '10'); // For sell type; changed to ID selector
    await page.fill('#m2', '100'); // Changed to ID selector
    await page.fill('#bedroom', '3'); // Changed to ID selector
    await page.fill('#year', '2020'); // Changed to ID selector
    await page.fill('#floor', '2'); // Changed to ID selector
    await page.fill('#floors', '5'); // Changed to ID selector
    await page.fill('#units', '10'); // Changed to ID selector
    await page.fill('#ownerPhone', '09123456789'); // Valid phone number; changed to ID selector
    await page.fill('#ownerName', 'John Doe'); // Changed to ID selector
    await page.fill('#description', 'Beautiful apartment in the city center.'); // Changed to ID selector

    // Click the submit button
    await page.click('button[type="submit"]');

    // Assert that a success message is displayed or check for redirection
    const successMessage = await page.getByRole('alert');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText(/یک فایل اضافه شد/); // Adjust based on your success message
  });


  test('should show an error when submitting invalid phone numbers', async ({ page }) => {

    // Fill in the form fields with valid data for rent type
    await page.selectOption('#property_type', 'A'); // Select property type
    await page.fill('#address', '123 Main St'); // Changed to ID selector
    await page.fill('#upPrice', '250'); // For rent type; changed to ID selector
    await page.fill('#rentPrice', '25'); // For rent type; changed to ID selector
    await page.fill('#m2', '100'); // Changed to ID selector
    await page.fill('#bedroom', '3'); // Changed to ID selector
    await page.fill('#year', '2020'); // Changed to ID selector
    await page.fill('#floor', '2'); // Changed to ID selector
    await page.fill('#floors', '5'); // Changed to ID selector
    await page.fill('#units', '10'); // Changed to ID selector

    // Fill in invalid phone numbers to trigger the alert
    await page.fill('#ownerPhone', '12345'); // Invalid phone number; changed to ID selector
    await page.fill('#ownerName', 'test'); // Invalid phone number; changed to ID selector

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
