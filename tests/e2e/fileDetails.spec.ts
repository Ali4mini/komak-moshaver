import { test, expect } from '@playwright/test';
import { loginFixture } from './login.fixtures';
import { newFileFixture } from './newFile.fixture';

test.describe('Sell File Details Component', () => {
  test.beforeEach(async ({ page }) => {
    // The fixture for login
    await loginFixture(page);
    // The fixture for creating a new sell file
    await newFileFixture(page);

    await page.locator('#file_id').first().click();
  });

  test('should display sell file details correctly', async ({ page }) => {
    // Check if the file type is displayed correctly
    const fileTypeVisible = await page.locator('#fileType').isVisible();
    expect(fileTypeVisible).toBe(true);

    // Check if other details are displayed
    const propertyTypeVisible = await page.locator('#propertyType').isVisible();
    expect(propertyTypeVisible).toBe(true);
    const propertyType = await page.locator('#propertyType').innerText();
    expect(propertyType).not.toBe('');

    const ownerNameVisible = await page.locator('#ownerName').isVisible();
    expect(ownerNameVisible).toBe(true);
    const ownerName = await page.locator('#ownerName').innerText();
    expect(ownerName).not.toBe('');

    const addressVisible = await page.locator('#addressInfo p:nth-child(2)').isVisible(); // Adjusted to target the second <p> under addressInfo
    expect(addressVisible).toBe(true);
    const address = await page.locator('#addressInfo p:nth-child(2)').innerText();
    expect(address).not.toBe('');
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
    await page.click('#updateButton');

    // Check if navigated to the edit page
    await page.waitForURL(/.*\/edit\//); // Wait for URL to contain '/edit/'
  });

  test('should display matched customers when option is selected', async ({ page }) => {
    // Click on the matched customers option (assuming it has a text label)
    await page.click("text=گزینه ها")
    await page.click('text=مشتریان مرتبط');

    // Verify that matched customers component is displayed
    const matchedCustomersVisible = await page.locator('text=مشتریان مرتبط').isVisible(); // Adjusted selector to match ID
    expect(matchedCustomersVisible).toBe(true);
  });

  test('should show call log modal when call log option is selected', async ({ page }) => {
    // Click on the call log option (assuming it has a text label)
    await page.click("text=گزینه ها")
    await page.click('text=لاک تماس');

    // Verify that NewCallLog modal is visible
    const callLogModalVisible = await page.locator('text= لاگ تماس').isVisible(); // Adjusted selector to match ID
    expect(callLogModalVisible).toBe(true);
  });

  test('should show tour log modal when tour log option is selected', async ({ page }) => {
    // Click on the tour log option (assuming it has a text label)
    await page.click("text=گزینه ها")
    await page.getByLabel('گزینه ها').getByText('لاگ بازدید').click();

    // Verify that NewTourLog modal is visible
    const tourLogModalVisible = await page.locator('text=لاگ بازدید').isVisible(); // Adjusted selector to match ID
    expect(tourLogModalVisible).toBe(true);
  });
});
