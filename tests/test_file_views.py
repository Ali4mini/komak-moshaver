from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .integration_test import SeleniumTestCase
import time


class FileViewsTest(SeleniumTestCase):
    '''
    tests all views of file app
    '''
    
    def test_sell_file(self) -> None:

        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        # SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        self.driver.implicitly_wait(10)
        #!SECTION
        # SECTION - adding file
        self.driver.find_element(By.ID, 'new_file').click()
        self.driver.implicitly_wait(10)
        self.driver.find_element(By.ID, 'address').send_keys('test')
        self.driver.find_element(By.ID, 'price').send_keys(8000)
        self.driver.find_element(By.ID, 'm2').send_keys(80)
        self.driver.find_element(By.ID, 'bedroom').send_keys(2)
        self.driver.find_element(By.ID, 'year').send_keys(1396)
        self.driver.find_element(By.ID, 'floor').send_keys(3)
        self.driver.find_element(By.ID, 'tabaghat').send_keys(4)
        self.driver.find_element(By.ID, 'vahedha').send_keys(8)
        self.driver.find_element(By.ID, 'bazdid').send_keys('test')
        self.driver.find_element(By.ID, 'owner_phone').send_keys('test')
        self.driver.find_element(By.ID, 'owner_name').send_keys('test')
        time.sleep(2)
        self.driver.find_element(By.ID, 'submit').click()
        
        #!SECTION
        # SECTION - checking new file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع فایل: فروش' in elements
        assert 'قیمت: 8000' in elements
        #!SECTION
        # SECTION - updating file
        self.driver.find_element(By.ID, 'update').click()
        self.driver.find_element(By.ID, 'address').clear()
        self.driver.find_element(By.ID, 'address').send_keys('updated')

        self.driver.find_element(By.ID, 'price').clear()
        self.driver.find_element(By.ID, 'price').send_keys(8800)
        self.driver.find_element(By.ID, 'm2').clear()
        self.driver.find_element(By.ID, 'm2').send_keys(88)

        self.driver.find_element(By.ID, 'bedroom').clear()
        self.driver.find_element(By.ID, 'bedroom').send_keys(2)

        self.driver.find_element(By.ID, 'year').clear()
        self.driver.find_element(By.ID, 'year').send_keys(1402)

        self.driver.find_element(By.ID, 'floor').clear()
        self.driver.find_element(By.ID, 'floor').send_keys(3)

        self.driver.find_element(By.ID, 'tabaghat').clear()
        self.driver.find_element(By.ID, 'tabaghat').send_keys(4)

        self.driver.find_element(By.ID, 'vahedha').clear()
        self.driver.find_element(By.ID, 'vahedha').send_keys(12)

        self.driver.find_element(By.ID, 'bazdid').clear()
        self.driver.find_element(By.ID, 'bazdid').send_keys('updated')

        self.driver.find_element(By.ID, 'owner_phone').clear()
        self.driver.find_element(By.ID, 'owner_phone').send_keys('updated')

        self.driver.find_element(By.ID, 'owner_name').clear()
        self.driver.find_element(By.ID, 'owner_name').send_keys('updated')

        self.driver.find_element(By.ID, 'submit').click()
        # SECTION - checking updated file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع فایل: فروش' in elements
        assert 'قیمت: 8800' in elements
        #!SECTION
        # SECTION - deleting file
        self.driver.find_element(By.ID, 'delete').click()
        #!SECTION
        # SECTION - checking deleted file
        files = self.driver.find_elements(By.ID, 'file')
        assert len(files) is 0
        #!SECTION

    def test_rent_file(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        # SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - adding file
        self.driver.find_element(By.ID, 'new_file').click()
        self.driver.implicitly_wait(10)
        self.driver.find_element(By.ID, 'file_type').click()
        self.driver.find_element(By.XPATH, '//*[@value="rent"]').click()
        
        self.driver.find_element(By.ID, 'address').send_keys('test')
        self.driver.find_element(By.ID, 'price_up').send_keys(800)
        self.driver.find_element(By.ID, 'price_rent').send_keys(8)
        self.driver.find_element(By.ID, 'm2').send_keys(80)
        self.driver.find_element(By.ID, 'bedroom').send_keys(2)
        self.driver.find_element(By.ID, 'year').send_keys(1396)
        self.driver.find_element(By.ID, 'floor').send_keys(3)
        self.driver.find_element(By.ID, 'tabaghat').send_keys(4)
        self.driver.find_element(By.ID, 'vahedha').send_keys(8)
        self.driver.find_element(By.ID, 'bazdid').send_keys('test')
        self.driver.find_element(By.ID, 'owner_phone').send_keys('test')
        self.driver.find_element(By.ID, 'owner_name').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - checking new file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع فایل: اجاره' in elements
        assert 'ودیعه: 800' in elements
        #!SECTION
        # SECTION - updating file
        self.driver.find_element(By.ID, 'update').click()
        time.sleep(5)
        self.driver.find_element(By.ID, 'address').clear()
        self.driver.find_element(By.ID, 'address').send_keys('updated')

        self.driver.find_element(By.ID, 'price_up').clear()
        self.driver.find_element(By.ID, 'price_up').send_keys(500)
        self.driver.find_element(By.ID, 'price_rent').clear()
        self.driver.find_element(By.ID, 'price_rent').send_keys(5)
        self.driver.find_element(By.ID, 'm2').clear()
        self.driver.find_element(By.ID, 'm2').send_keys(88)

        self.driver.find_element(By.ID, 'bedroom').clear()
        self.driver.find_element(By.ID, 'bedroom').send_keys(2)

        self.driver.find_element(By.ID, 'year').clear()
        self.driver.find_element(By.ID, 'year').send_keys(1402)

        self.driver.find_element(By.ID, 'floor').clear()
        self.driver.find_element(By.ID, 'floor').send_keys(3)

        self.driver.find_element(By.ID, 'tabaghat').clear()
        self.driver.find_element(By.ID, 'tabaghat').send_keys(4)

        self.driver.find_element(By.ID, 'vahedha').clear()
        self.driver.find_element(By.ID, 'vahedha').send_keys(12)

        self.driver.find_element(By.ID, 'bazdid').clear()
        self.driver.find_element(By.ID, 'bazdid').send_keys('updated')

        self.driver.find_element(By.ID, 'owner_phone').clear()
        self.driver.find_element(By.ID, 'owner_phone').send_keys('updated')

        self.driver.find_element(By.ID, 'owner_name').clear()
        self.driver.find_element(By.ID, 'owner_name').send_keys('updated')

        self.driver.find_element(By.ID, 'submit').click()
        # SECTION - checking updated file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع فایل: اجاره' in elements
        assert 'ودیعه: 500' in elements
        #!SECTION
        # SECTION - deleting file
        self.driver.find_element(By.ID, 'delete').click()
        #!SECTION
        # SECTION - checking deleted file
        files = self.driver.find_elements(By.ID, 'file')
        assert len(files) is 0
        #!SECTION
        
