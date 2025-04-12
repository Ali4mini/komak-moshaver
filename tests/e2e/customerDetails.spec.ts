import { test, expect } from '@playwright/test';
import { loginFixture } from './login.fixtures';
import { newCustomerFixture } from './newCustomer.fixture';

test.describe('Sell customer Details Component', () => {
  test.beforeEach(async ({ page }) => {
    // The fixture for login
    await loginFixture(page);
    // The fixture for creating a new sell customer
    await newCustomerFixture(page);

    await page.locator('#customer_id').first().click();
  });

  test('should display sell customer details correctly', async ({ page }) => {
    // Check if the customer type is displayed correctly
    const customerTypeVisible = await page.locator('#customerType').isVisible();
    expect(customerTypeVisible).toBe(true);

    // Check if other details are displayed
    const propertyTypeVisible = await page.locator('#propertyType').isVisible();
    expect(propertyTypeVisible).toBe(true);
    const propertyType = await page.locator('#propertyType').innerText();
    expect(propertyType).not.toBe('');

    const ownerNameVisible = await page.locator('#customerName').isVisible();
    expect(ownerNameVisible).toBe(true);
    const ownerName = await page.locator('#customerName').innerText();
    expect(ownerName).not.toBe('');

  });

  test('should open delete confirmation dialog', async ({ page }) => {
    // Click on the delete button

    await page.click("text=گزینه ها")
    await page.click('text=حذف');

    // Verify that the delete confirmation dialog is visible
    const deleteConfirmTitleVisible = await page.locator('text=آیا از پاک کردن این فایل مطمعنید؟').isVisible(); // Assuming delete confirmation has an ID
    expect(deleteConfirmTitleVisible).toBe(true);
  });

  test('should navigate to edit page on edit button click', async ({ page }) => {
    // Click on the edit button
    await page.click('#updateButton'); // Updated to match the new ID

    // Check if navigated to the edit page
    await page.waitForURL(/.*\/edit\//); // Wait for URL to contain '/edit/'
  });


  test('toggles matched files display', async ({ page }) => {
    await page.goto('/customer/buy/1');

    // Click on matched customers option in menu
    await page.click('text=گزینه ها'); // Open dropdown menu
    await page.click('text=فایل های مرتبط'); // Click matched customers option


    // Click again to toggle off
    await page.click('text=فایل های مرتبط');

    // Verify that matched files component is hidden
    expect(await page.isVisible('.matched-files')).toBeFalsy();
  });

});
