from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from django.contrib.auth.models import User
from .integration_test import SeleniumTestCase
from file.models import Sell, Rent

import time
import random

class ListingViewsTest(SeleniumTestCase):
    '''
    tests all views of listing app
    '''
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = User.objects.filter(username='test').get()
        price = [4000, 5000, 1500, 6500, 7000, 3800, 2400, 3300]
        m2 = [80, 55, 43, 79, 110, 82, 38, 70]
        year = [1380, 1400, 1375, 1390, 1395, 1397, 1385, 1370]
        bedroom = [1, 2, 3]
        for _ in range(20):
                Sell.objects.create(owner_name='test',
                                    owner_phone='test',
                                    address='test',
                                    m2=random.choice(m2),
                                    price=random.choice(price),
                                    year=random.choice(year),
                                    floor=6,
                                    elevator=bool(random.getrandbits(1)),
                                    storage=bool(random.getrandbits(1)),
                                    parking=bool(random.getrandbits(1)),
                                    type='A',
                                    added_by = user,
                                    bedroom=random.choice(bedroom),
                                    parking_motor=False,
                                    takhlie='3',
                                    vahedha=8,
                                    komod_divari=True,
                                    bazdid='test',
                                    tabaghat=8,)
                       
    def test_panel_filter(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        #SECTION - filter
        self.driver.find_element(By.ID, 'price').send_keys(4000)
        self.driver.find_element(By.ID, 'm2').send_keys(75)
        self.driver.find_element(By.ID, 'bedroom').send_keys(1)
        self.driver.find_element(By.ID, 'year').send_keys(1390)
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION 
        #SECTION - checking filter results
        m2_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[1]')
        m2_elements = [int(element.text.replace('متراژ: ', '')) for element in m2_elements]
        price_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[2]')
        price_elements = [int(element.text.replace('بودجه: ', '')) for element in price_elements]
        year_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[3]')
        year_elements = [int(element.text.replace('سال ساخت: ', '')) for element in year_elements]
        bedroom_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[5]')
        bedroom_elements = [int(element.text.replace('تعداد اتاق خواب: ', '')) for element in bedroom_elements]
        print(m2_elements)
        assert not len(m2_elements) < 0
        assert any(m2 >= 75 for m2 in m2_elements)
        assert any(price <= 4000 for price in price_elements)
        assert any(year >= 1390 for year in year_elements)
        assert any(bedroom >= 1 for bedroom in bedroom_elements)
        #!SECTION
