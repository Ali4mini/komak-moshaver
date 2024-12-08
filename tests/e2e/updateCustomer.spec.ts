import { test, expect } from '@playwright/test';
import { loginFixture } from './login.fixtures'
import { newFileFixture } from "./newFile.fixture"
import { newCustomerFixture } from "./newCustomer.fixture"


test.describe('NewCustomer Component', () => {
  test.beforeEach(async ({ page }) => {
    // the fixture for login
    await loginFixture(page)
    await newCustomerFixture(page)
    // Navigate to the page with the form
    await page.goto('http://localhost:5173/customers/');
    await page.locator('#customer_id').first().click();
    await page.click('#updateButton');
  })

  test('should submit the form with valid data', async ({ page }) => {


    // Fill in the form fields with valid data
    await page.selectOption('#property_type', 'A');
    await page.fill('#upBudget', '250000');
    await page.fill('#rentBudget', '10');
    await page.fill('#m2', '100');
    await page.fill('#bedroom', '3');
    await page.fill('#year', '2020');
    await page.fill('#customerPhone', '09123456789');
    await page.fill('#customerName', 'John Doe');
    await page.fill('#description', 'Beautiful apartment in the city center.');

    // Click the submit button
    await page.click('button[type="submit"]');

    // Assert that a success message is displayed or check for redirection
    const successMessage = await page.getByRole('alert');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText(/یک فایل اضافه شد/); // Adjust based on your success message
  });


  test('should show an error when submitting invalid phone numbers', async ({ page }) => {

    // Fill in the form fields with valid data for rent type
    await page.selectOption('#property_type', 'A');
    await page.fill('#upBudget', '250000');
    await page.fill('#rentBudget', '10');
    await page.fill('#m2', '100');
    await page.fill('#bedroom', '3');
    await page.fill('#year', '2020');
    await page.fill('#customerPhone', '09123456789');
    await page.fill('#customerName', 'John Doe');
    await page.fill('#description', 'Beautiful apartment in the city center.');

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
