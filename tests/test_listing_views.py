from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from django.contrib.auth.models import User
from .integration_test import SeleniumTestCase
from file.models import Sell, Rent
from django.test import Client

import time
import random

class ListingViewsTest(SeleniumTestCase):
    '''
    tests all views of listing app
    '''
    files_with_parking = 0
    files_with_elevator = 0
    files_with_storage = 0
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = User.objects.filter(username='test').get()
        price = [4000, 5000, 1500, 6500, 7000, 3800, 2400, 3300]
        price_up = [400, 500, 1500, 650, 700, 380, 240, 330]
        price_rent = [4, 5, 1.5, 6.5, 7, 3, 2, 3]
        m2 = [80, 55, 43, 79, 110, 82, 38, 70]
        year = [1380, 1400, 1375, 1390, 1395, 1397, 1385, 1370]
        bedroom = [1, 2, 3]
        for _ in range(10):
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
        for _ in range(10):
                Rent.objects.create(owner_name='test',
                                    owner_phone='test',
                                    address='test',
                                    m2=random.choice(m2),
                                    price_up=random.choice(price_up),
                                    price_rent=random.choice(price_rent),
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
              
        cls.sell_files_with_parking = Sell.objects.filter(parking=True).count()
        cls.sell_files_with_elevator = Sell.objects.filter(elevator=True).count()
        cls.sell_files_with_storage = Sell.objects.filter(storage=True).count()
        
    def test_panel_sell_filter(self) -> None:
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
        self.driver.find_element(By.ID, 'submit').click()
        price_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[2]')
        price_elements = [int(element.text.replace('بودجه: ', '')) for element in price_elements]
        assert any(price <= 4000 for price in price_elements)

        self.driver.find_element(By.ID, 'm2').send_keys(75)
        self.driver.find_element(By.ID, 'submit').click()
        m2_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[1]')
        m2_elements = [int(element.text.replace('متراژ: ', '')) for element in m2_elements]
        assert any(m2 >= 75 for m2 in m2_elements)
        

        self.driver.find_element(By.ID, 'year').send_keys(1390)
        self.driver.find_element(By.ID, 'submit').click()
        year_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[3]')
        year_elements = [int(element.text.replace('سال ساخت: ', '')) for element in year_elements]
        assert any(year >= 1390 for year in year_elements)

        self.driver.find_element(By.ID, 'bedroom').send_keys(1)
        self.driver.find_element(By.ID, 'submit').click()
        bedroom_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[5]')
        bedroom_elements = [int(element.text.replace('تعداد اتاق خواب: ', '')) for element in bedroom_elements]
        assert any(bedroom >= 1 for bedroom in bedroom_elements)

        self.driver.find_element(By.ID, 'parking').click()
        self.driver.find_element(By.ID, 'submit').click()
        parking_elements = self.driver.find_elements(By.ID, 'has_parking')
        assert len(parking_elements) == self.sell_files_with_parking
        
        self.driver.find_element(By.ID, 'elevator').click()
        self.driver.find_element(By.ID, 'submit').click()
        elevator_elements = self.driver.find_elements(By.ID, 'has_elevator')
        assert len(elevator_elements) == self.sell_files_with_elevator
        
        self.driver.find_element(By.ID, 'storage').click()
        self.driver.find_element(By.ID, 'submit').click()
        storage_elements = self.driver.find_elements(By.ID, 'has_storage')
        assert len(storage_elements) == self.sell_files_with_storage

        #!SECTION 
        
    def test_panel_rent_filter(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        #SECTION - filter
        self.driver.find_element(By.XPATH, '//*[@id="file_type"]').click()
        self.driver.find_element(By.XPATH, '//*[@id="rent"]').click()
        self.driver.implicitly_wait(5)
        self.driver.find_element(By.ID, 'up_price').send_keys(700)
        self.driver.find_element(By.ID, 'rent_price').send_keys(7)
        self.driver.find_element(By.ID, 'submit').click()
        price_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[2]')
        price_elements = [int(element.text.replace('ودیعه: ', '')) for element in price_elements]
        assert any(price <= 700 for price in price_elements)

        price_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[3]')
        price_elements = [float(element.text.replace('اجاره: ', '')) for element in price_elements]
        assert any(price <= 7 for price in price_elements)


        self.driver.find_element(By.ID, 'm2').send_keys(75)
        self.driver.find_element(By.ID, 'submit').click()
        m2_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[1]')
        m2_elements = [int(element.text.replace('متراژ: ', '')) for element in m2_elements]
        assert any(m2 >= 75 for m2 in m2_elements)
        

        self.driver.find_element(By.ID, 'year').send_keys(1390)
        self.driver.find_element(By.ID, 'submit').click()
        year_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[3]')
        year_elements = [int(element.text.replace('سال ساخت: ', '')) for element in year_elements]
        assert any(year >= 1390 for year in year_elements)

        self.driver.find_element(By.ID, 'bedroom').send_keys(1)
        self.driver.find_element(By.ID, 'submit').click()
        bedroom_elements = self.driver.find_elements(By.XPATH, '//*[@id="file"]/div/p[5]')
        bedroom_elements = [int(element.text.replace('تعداد اتاق خواب: ', '')) for element in bedroom_elements]
        assert any(bedroom >= 1 for bedroom in bedroom_elements)

        self.driver.find_element(By.ID, 'parking').click()
        self.driver.find_element(By.ID, 'submit').click()
        parking_elements = self.driver.find_elements(By.ID, 'has_parking')
        assert len(parking_elements) == self.sell_files_with_parking
        
        self.driver.find_element(By.ID, 'elevator').click()
        self.driver.find_element(By.ID, 'submit').click()
        elevator_elements = self.driver.find_elements(By.ID, 'has_elevator')
        assert len(elevator_elements) == self.sell_files_with_elevator
        
        self.driver.find_element(By.ID, 'storage').click()
        self.driver.find_element(By.ID, 'submit').click()
        storage_elements = self.driver.find_elements(By.ID, 'has_storage')
        assert len(storage_elements) == self.sell_files_with_storage

        #!SECTION 
        
    def test_sell_pk_filter(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        self.driver.find_element(By.ID, 'home').click()
        #!SECTION
        #SECTION - filter
        time.sleep(2)
        self.driver.find_element(By.ID, 'pk').send_keys(3)
        self.driver.find_element(By.ID, 'pk_submit').click()
        #!SECTION
        #SECTION - checking
        file_id = self.driver.find_element(By.ID, 'file_id')
        assert file_id.text == '3'
        
    def test_rent_pk_filter(self) -> None:
        self.driver.get(self.live_server_url)
        self.driver.implicitly_wait(10)
        #SECTION - login
        self.driver.find_element(By.ID, 'agents').click()
        self.driver.find_element(By.ID, 'username').send_keys('test')
        self.driver.find_element(By.ID, 'password').send_keys('test')
        self.driver.find_element(By.ID, 'submit').click()
        #!SECTION
        #SECTION - filter
        self.driver.find_element(By.XPATH, '//*[@id="filter_file_type"]').click()
        self.driver.find_element(By.ID, 'pk_rent').click()
        self.driver.find_element(By.ID, 'pk').send_keys(3)
        self.driver.find_element(By.ID, 'pk_submit').click()
        #!SECTION
        #SECTION - checking
        file_id = self.driver.find_element(By.ID, 'file_id')
        assert file_id.text == '3'
        