import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import pickle

class Divar:
    def __init__(self, headless=True):
        self.options = Options()
        self.options.headless = headless
        self.driver = webdriver.Firefox(options=self.options)
        self.terms_agreement_done = False
        self.wait = WebDriverWait(self.driver, 10)

    def exit(self):
        self.driver.close()
        self.driver.quit()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.driver.close()
        self.driver.quit()

    def login(self, phone, cookie=None):
        self.driver.get("https://divar.ir/s/tehran")
        if cookie is None:
            self.driver.implicitly_wait(random.randint(1, 10))
            my_divar = self.driver.find_element(By.XPATH, "/html/body/div[1]/header/nav/div/div[3]/div/button")
            my_divar.click()

            self.driver.implicitly_wait(random.randint(1, 5))
            login_button = self.driver.find_element(By.XPATH, "/html/body/div[1]/header/nav/div/div[3]/div/div/div/button")
            login_button.click()

            self.driver.implicitly_wait(random.randint(1, 10))
            time.sleep(random.uniform(1, 3))
            phone_input = self.driver.find_element(By.XPATH, "//input[@class='kt-textfield__input kt-textfield__input--empty']")
            phone_input.send_keys(phone)

            two_fa_input = input("2FA >>> ")
            two_fa = self.driver.find_element(By.XPATH, "//input[@class='kt-textfield__input kt-textfield__input--empty']")
            two_fa.send_keys(two_fa_input)
        else:
            self.load_cookie(cookie)
            time.sleep(random.uniform(1, 3))

        self.driver.get("https://divar.ir/s/tehran")
        time.sleep(random.uniform(1, 3))

    def load_cookie(self, path):
        with open(path, 'rb') as cookiesfile:
            cookies = pickle.load(cookiesfile)
            for cookie in cookies:
                self.driver.add_cookie(cookie)

    def last_post(self, page):
        self.driver.get(page)
        self.driver.implicitly_wait(random.randint(1, 15))
        post = self.driver.find_element(By.XPATH, "//a[starts-with(@href, '/v/')]")
        return post.get_attribute('href')

    def all_posts(self, page):
        self.driver.get(page)
        post_links = self.driver.find_elements(By.XPATH, "//a[starts-with(@href, '/v/')]")
        return [link.get_attribute("href")[-8:] for link in post_links]

    def post_details(self, post) -> dict:
        self.driver.get(post)
        time.sleep(random.uniform(1, 3))
        
        try:
            phone_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "/html/body/div[1]/div[2]/div/div[1]/div[1]/div[2/button[1]")))
            phone_button.click()
        except:
            pass

        categories = [e.text for e in self.driver.find_elements(By.CLASS_NAME, "kt-breadcrumbs__link")]
        group_titles = [e.text for e in self.driver.find_elements(By.CLASS_NAME, "kt-group-row-item__title")]
        group_values = [e.text for e in self.driver.find_elements(By.XPATH, "//span[@class='kt-group-row-item__value']")]
        base_titles = [e.text for e in self.driver.find_elements(By.XPATH, "//p[@class='kt-base-row__title kt-unexpandable-row__title']")]

        titles = ["شاخه"] + group_titles + base_titles

        base_values = []
        try:
            base_values += [e.text for e in self.driver.find_elements(By.XPATH, "//a[@class='kt-unexpandable-row__action kt-text-truncate']")]
            base_values += [e.text for e in self.driver.find_elements(By.XPATH, "//p[@class='kt-unexpandable-row__value']")]
        except:
            base_values = [e.text for e in self.driver.find_elements(By.XPATH, "//p[@class='kt-unexpandable-row__value']")]
        
        values = [categories] + group_values + base_values

        result = dict(zip(titles, values))
        
        try:
            options = [e.text for e in self.driver.find_elements(By.XPATH, '//*[@id="app"]/div[2]/div/div[1]/div[1]/div[4]/div[7]/div/span')]
            result["ویژگی ها"] = options
        except:
            result["ویژگی ها"] = ["None", "None", "None"]
        
        description = self.driver.find_element(By.XPATH, "//p[@class='kt-description-row__text kt-description-row__text--primary']").text
        
        result["توضیحات"] = description
        result['توکن'] = post[-8:]

        if "شماره مخفی شده است" in result:
            result["شماره مخفی شده است"] = None
        
        if 'شمارهٔ موبایل' not in result:
            raise KeyError("phone number key is not in the result dictionary.")


        return result

    def save_cookie(self, path):
        time.sleep(random.uniform(1, 5))
        with open(path, 'wb') as filehandler:
            pickle.dump(self.driver.get_cookies(), filehandler)

