from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .integration_test import SeleniumTestCase
import time

class AgentsViewsTest(SeleniumTestCase):
    '''
    tests all views of agents app
    '''
    def test_agent_login(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        assert self.driver.current_url == self.live_server_url+'/'
        #!SECTION

        
        

        