from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from django.contrib.auth.models import User



class SeleniumTestCase(StaticLiveServerTestCase):
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        options = Options()
        options.add_argument('--headless')
        cls.driver = webdriver.Firefox(options=options)
        cls.driver.implicitly_wait(10)
        user = User.objects.create_user(username='test',
                                        email='test@test.com',
                                        password='test')

    @classmethod
    def tearDownClass(cls):
        cls.driver.close()
        cls.driver.quit()
        super().tearDownClass()



        