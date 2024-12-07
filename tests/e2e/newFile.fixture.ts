import { Page } from 'playwright';

//NOTE: because the detail function is the same on sell and rent we don't need to write tests for both

/**
 * you should call this function after the login fixture 
 * */
async function newFileFixture(page: Page) {
  // Define the form data directly within the fixture
  await page.goto("http://localhost:5173/file/new")
  const formData = {
    fileType: 'sell',
    propertyType: 'A',
    address: 'test address',
    price: '250000',
    m2: '100',
    bedroom: '3',
    year: '2020',
    floor: '2',
    floors: '5',
    units: '10',
    ownerPhone: '09123456789',
    ownerName: 'John Doe',
    description: 'Beautiful apartment in the city center.',
  };

  // Fill in the form fields with valid data
  await page.selectOption('#file_type', formData.fileType);
  await page.selectOption('#property_type', formData.propertyType);
  await page.fill('#address', formData.address);
  await page.fill('#price', formData.price);
  await page.fill('#m2', formData.m2);
  await page.fill('#bedroom', formData.bedroom);
  await page.fill('#year', formData.year);
  await page.fill('#floor', formData.floor);
  await page.fill('#floors', formData.floors);
  await page.fill('#units', formData.units);
  await page.fill('#ownerPhone', formData.ownerPhone);
  await page.fill('#ownerName', formData.ownerName);
  await page.fill('#description', formData.description);

  // Click the submit button
  await page.click('button[type="submit"]');

}

export { newFileFixture }
