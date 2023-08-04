from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import datetime
import pickle
import time
import logging

logging.basicConfig(filename="divar.log", filemode="w", format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")



class Divar:
    def __init__(self, headless=True):
        self.options = Options()
        self.options.headless = headless
        self.driver = webdriver.Firefox(options=self.options)
        self.terms_agreement_done = False
        self.wait = WebDriverWait(self.driver, 10) # waits up to 10 seconds
        logging.warning("initialized Divar object")

    def exit(self):
        self.driver.close()
        self.driver.quit()
        logging.warning("deleting Divar object")

    def __del__(self):
        self.driver.close()
        self.driver.quit()
        logging.warning("deleting Divar object")

    def __enter__(self):
        self.__init__()
    
    def __exit__(self,x,x2,x3):
        self.__del__()

    def login(self, phone, cookie=None):
        self.driver.get("https://divar.ir/s/tehran")
        if cookie == None:

            self.driver.implicitly_wait(10)
            my_divar = self.driver.find_element(By.XPATH, "/html/body/div[1]/header/nav/div/div[3]/div/button").click()
            self.driver.implicitly_wait(5)
            login_button = self.driver.find_element(By.XPATH, "/html/body/div[1]/header/nav/div/div[3]/div/div/div/button").click()
            self.driver.implicitly_wait(10)
            time.sleep(2)
            phone_input = self.driver.find_element(By.XPATH, "//input[@class='kt-textfield__input kt-textfield__input--empty']").send_keys(phone)
            two_FA_input = input("2FA >>> ")
            two_FA = self.driver.find_element(By.XPATH, "//input[@class='kt-textfield__input kt-textfield__input--empty']").send_keys(two_FA_input)
            #time.sleep(4)
            #notif_message = self.driver.find_element(By.XPATH, "/html/body/div[1]/div[4]/div/div/div/div[2]/button").click()
            logging.warning(f"logged in with phone number: {phone}")

        else:
            self.load_cookie(cookie)
            time.sleep(3)
            #$self.driver.implicitly_wait(10)

            #notif_message = self.driver.find_element(By.XPATH, "/html/body/div[1]/div[4]/div/div/div/div[2]/button").click()
        self.driver.get("https://divar.ir/s/tehran")
        time.sleep(3)

    def load_cookie(self, path):
        with open(path, 'rb') as cookiesfile:
            cookies = pickle.load(cookiesfile)
            for cookie in cookies:
                self.driver.add_cookie(cookie)
        logging.info(f"logged in with cookie: {path}")
    
    def last_post(self,page):
        self.driver.get(page)
        self.driver.implicitly_wait(15)
        post = self.driver.find_element(By.XPATH, "//a[starts-with(@href, '/v/')]")
        return post.get_attribute('href')
        logging.info(f"returned first post of page: {page}")


    def all_posts(self,page):
        self.driver.get(page)
        posts = self.driver.find_elements(By.XPATH, "//a[starts-with(@href, '/v/')]")

        all_posts_links = [post.get_attribute("href")[-8:] for post in posts]
        logging.info(f"found all post of page: {page}")

        return all_posts_links


    def post_details(self, post) -> dict:
        
        logging.info(f"extracting data from '{post}'")
        time.sleep(5)
        self.driver.get(post)
        time.sleep(3)
        phone_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "/html/body/div[1]/div[2]/div/div[1]/div[1]/div[2]/button[1]")))
        phone_button.click()


        # finding a post's category and sub categorys
        category_e = self.driver.find_elements(By.CLASS_NAME, "kt-breadcrumbs__link")
        category = [element.text for element in category_e]

        logging.info("extracted category")
        main_category = category[-1]
        name = category[0]
        # extracting data from post
        group_row_title = self.driver.find_elements(By.CLASS_NAME, "kt-group-row-item__title")
        group_row_value = self.driver.find_elements(By.XPATH, "//span[@class='kt-group-row-item__value']")
        base_row_title = self.driver.find_elements(By.XPATH, "//p[@class='kt-base-row__title kt-unexpandable-row__title']")
        group_row_title = [e.text for e in group_row_title]
        group_row_value = [e.text for e in group_row_value]
        base_row_title = [e.text for e in base_row_title]
        logging.info("extracting group elements")

        titles = group_row_title + base_row_title
        titles = ["شاخه"] + titles
        
        logging.info("merging base_row_title and group_row_title.")
        ## data usually is in two types "link" and "paragraph"
        try:
            base_row_value_a_tag = self.driver.find_elements(By.XPATH, "//a[@class='kt-unexpandable-row__action kt-text-truncate']")
            base_row_value = self.driver.find_elements(By.XPATH, "//p[@class='kt-unexpandable-row__value']")
            base_row_value_a_tag = [e.text for e in base_row_value_a_tag]
            base_row_value = [e.text for e in base_row_value]
            base_row_value = base_row_value_a_tag + base_row_value
            values = group_row_value + base_row_value
            values = [category] + values
        except:

            base_row_value = self.driver.find_elements(By.XPATH, "//p[@class='kt-unexpandable-row__value']")
            base_row_value = [e.text for e in base_row_value]
            values = group_row_value + base_row_value
            values = [category] + values
        description = self.driver.find_element(By.XPATH, "//p[@class='kt-description-row__text kt-description-row__text--primary']").text


        res = dict(zip(titles,values))
        try:
            options = self.driver.find_elements(By.XPATH, '//*[@id="app"]/div[2]/div/div[1]/div[1]/div[4]/div[7]/div/span')
            res["ویژگی ها"] = [option.text for option in options]
        except:
            res["ویژگی ها"] = ["None", "None", "None"]

        res["توضیحات"] = description
        res['توکن'] = post[-8:]
        print(res['توکن'])
        ## deleting useless data from result

        if "شماره مخفی شده است" in res:
            try:
                res["شماره مخفی شده است"] = None
            except:
                pass
        logging.warning(f"done extracting data from {post}")
        return res

    def save_cookie(self, path):
        time.sleep(5)
        cookie1 = self.driver.get_cookies()
        with open(path, 'wb') as filehandler:
            pickle.dump(self.driver.get_cookies(), filehandler)
        logging.warning(f"saved a cookie: {path}")

    

