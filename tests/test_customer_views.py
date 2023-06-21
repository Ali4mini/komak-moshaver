from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .integration_test import SeleniumTestCase
import time

class CustomerViewsTest(SeleniumTestCase):
    '''
    tests all views of customer app
    '''
    def test_buy_customer(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        #SECTION - adding customer
        self.driver.find_element(By.ID, 'new_customer').click()
        self.driver.implicitly_wait(10)
        self.driver.find_element(By.ID, 'budget').send_keys(6000)
        self.driver.find_element(By.ID, 'm2').send_keys(80)
        self.driver.find_element(By.ID, 'bedroom').send_keys(80)
        self.driver.find_element(By.ID, 'year').send_keys(80)
        self.driver.find_element(By.ID, 'floor').send_keys(80)
        self.driver.find_element(By.ID, 'customer_phone').send_keys('test')
        self.driver.find_element(By.ID, 'customer_name').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - checking new file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع مشتری: خرید' in elements
        assert 'بودجه: 6000' in elements
        #!SECTION
        #SECTION - updating customer
        self.driver.find_element(By.ID, 'update').click()

        self.driver.find_element(By.ID, 'budget').clear()
        self.driver.find_element(By.ID, 'budget').send_keys(5000)
        
        self.driver.find_element(By.ID, 'm2').clear()
        self.driver.find_element(By.ID, 'm2').send_keys(50)
        
        self.driver.find_element(By.ID, 'bedroom').clear()
        self.driver.find_element(By.ID, 'bedroom').send_keys(50)
        
        self.driver.find_element(By.ID, 'year').clear()
        self.driver.find_element(By.ID, 'year').send_keys(50)
        
        self.driver.find_element(By.ID, 'floor').clear()
        self.driver.find_element(By.ID, 'floor').send_keys(50)
        
        self.driver.find_element(By.ID, 'customer_phone').clear()
        self.driver.find_element(By.ID, 'customer_phone').send_keys('updated')
        
        self.driver.find_element(By.ID, 'customer_name').clear()
        self.driver.find_element(By.ID, 'customer_name').send_keys('updated')
        
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - checking updated file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع مشتری: خرید' in elements
        assert 'بودجه: 5000' in elements
        #!SECTION
        # SECTION - deleting file
        self.driver.find_element(By.ID, 'delete').click()
        #!SECTION
        # SECTION - checking deleted file
        files = self.driver.find_elements(By.ID, 'file')
        assert len(files) is 0
        #!SECTION
        
    def test_rent_customer(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        #SECTION - adding customer
        self.driver.find_element(By.ID, 'new_customer').click()
        self.driver.implicitly_wait(10)
        self.driver.find_element(By.ID, 'customer_type').click()
        time.sleep(4)
        self.driver.find_element(By.XPATH, '//*[@value="rent"]').click()
        time.sleep(2)
        self.driver.find_element(By.ID, 'up_budget').send_keys(600)
        self.driver.find_element(By.ID, 'rent_budget').send_keys(5)
        self.driver.find_element(By.ID, 'm2').send_keys(80)
        self.driver.find_element(By.ID, 'bedroom').send_keys(80)
        self.driver.find_element(By.ID, 'year').send_keys(80)
        self.driver.find_element(By.ID, 'floor').send_keys(80)
        self.driver.find_element(By.ID, 'customer_phone').send_keys('test')
        self.driver.find_element(By.ID, 'customer_name').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - checking new file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع مشتری: اجاره' in elements
        assert 'ودیعه: 600' in elements
        #!SECTION
        #SECTION - updating customer
        self.driver.find_element(By.ID, 'update').click()

        self.driver.find_element(By.ID, 'up_budget').clear()
        self.driver.find_element(By.ID, 'up_budget').send_keys(500)
        self.driver.find_element(By.ID, 'rent_budget').clear()
        self.driver.find_element(By.ID, 'rent_budget').send_keys(5)
        
        self.driver.find_element(By.ID, 'm2').clear()
        self.driver.find_element(By.ID, 'm2').send_keys(50)
        
        self.driver.find_element(By.ID, 'bedroom').clear()
        self.driver.find_element(By.ID, 'bedroom').send_keys(50)
        
        self.driver.find_element(By.ID, 'year').clear()
        self.driver.find_element(By.ID, 'year').send_keys(50)
        
        self.driver.find_element(By.ID, 'floor').clear()
        self.driver.find_element(By.ID, 'floor').send_keys(50)
        
        self.driver.find_element(By.ID, 'customer_phone').clear()
        self.driver.find_element(By.ID, 'customer_phone').send_keys('updated')
        
        self.driver.find_element(By.ID, 'customer_name').clear()
        self.driver.find_element(By.ID, 'customer_name').send_keys('updated')
        
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        # SECTION - checking updated file
        element = WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, "/html/body/a[1]/div/div")))
        element.click()
        elements = [element.text for element in self.driver.find_elements(By.TAG_NAME, 'p')]
        assert 'نوع مشتری: اجاره' in elements
        assert 'ودیعه: 500' in elements
        #!SECTION
        # SECTION - deleting file
        self.driver.find_element(By.ID, 'delete').click()
        #!SECTION
        # SECTION - checking deleted file
        files = self.driver.find_elements(By.ID, 'file')
        assert len(files) is 0
        #!SECTION
         

        