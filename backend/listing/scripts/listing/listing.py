from django.contrib.auth.models import User
from file import models
from listing.scripts.divar.divar import Divar
import time
import traceback
import logging, logging.handlers
import requests
import pickle
# ! Custom exceptions

class DivarBot:
       def __init__(self):
        self.bot_user = User.objects.get_by_natural_key('listing_bot')
        self.divar_url = 'https://divar.ir/s/tehran/real-estate/doolab?districts=1017%2C273%2C974%2C1016&user_type=personal&sort=sort_date'
        self.divar_obj = Divar(headless=False)
        self.logger = self._setup_logger()
        self.available_cookies = {
            '9212031469.pkl': 0,
        }
        self.burnt_cookies
        self.valid_types = ['A', 'L', 'S', 'H']

        @staticmethod
        def _setup_logger():
            logger = logging.getLogger('Divar')
            logger.setLevel(logging.INFO)
            return logger

        def burnt_cookie(self, cookie):
            """this method should called when a cookie is burnt"""
            template = f'''
                        we have a burnt cookie
                        cookie: {cookie}
                        '''
            data = {'from':'50004001845778', 'to':['09212396361'], 'text':template, 'udh':''}
            response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=data)
        
        def validation(self, post_detail: dict) -> dict:
            self.logger.info(f'extracted info: {post_detail}')

            post_detail = self._set_defaults(post_detail)
            post_detail = self._set_type(post_detail)
            post_detail = self._set_mobile_number(post_detail)
            post_detail = self._set_floor(post_detail)
            post_detail = self._set_area(post_detail)
            post_detail = self._set_price(post_detail)
            post_detail = self._set_features(post_detail)
            post_detail['تگ ها'] = 'دیوار'

            self.logger.info(f'ready to use info: {post_detail}')
            return post_detail

            def _set_defaults(self, post_detail):
                if "کوتاه مدت" in post_detail['شاخه'][1]:
                    post_detail['ودیعه'] = 0
                    post_detail['اجارهٔ ماهانه'] = 0
                    post_detail['اجاره'] = 0
                    post_detail['نوع'] = 'NOT'
                return post_detail

            def _set_type(self, post_detail):
                if "آپارتمان" in post_detail["شاخه"][2]:
                    post_detail['نوع'] = 'A'
                elif "زمین و کلنگی" in post_detail["شاخه"][2]:
                    post_detail['نوع'] = 'L'
                elif 'خانه و ویلا' in post_detail["شاخه"][2]:
                    post_detail['نوع'] = 'H'
                elif 'مغازه و غرفه' in post_detail["شاخه"][2]:
                    post_detail['نوع'] = 'S'
                return post_detail

            def _set_mobile_number(self, post_detail):
                post_detail['شمارهٔ موبایل'] = post_detail.get('شمارهٔ موبایل', 'None')
                return post_detail

            def _set_floor(self, post_detail):
                floor = post_detail.get('طبقه', '999999').replace('٬', '').replace('از', '').split(' ')
                post_detail['طبقه'] = [int(_) for _ in floor if _.isdigit()]
                return post_detail

            def _set_area(self, post_detail):
                area = post_detail.get('متراژ', '999999').replace('٬', '').replace(' متر', '')
                post_detail['متراژ'] = int(area) if area.isdigit() else 999999
                return post_detail

            def _set_price(self, post_detail):
                if "فروش" in post_detail["شاخه"][1]:
                    price = post_detail.get('قیمت کل', '9999999').replace('٬', '').replace(' تومان', '')
                    post_detail['قیمت کل'] = int(price) / 1000000 if price.isdigit() else 9999999
                elif "اجاره" in post_detail["شاخه"][1]:
                    deposit = post_detail.get('ودیعه', '9999999').replace('٬', '').replace(' تومان', '')
                    post_detail['ودیعه'] = int(deposit) / 1000000 if deposit.isdigit() else 9999999
                    rent = post_detail.get('اجارهٔ ماهانه', '0').replace('٬', '').replace(' تومان', '')
                    post_detail['اجاره'] = float(rent) / 1000000 if rent.isdigit() else 0
                return post_detail

            def _set_features(self, post_detail):
                features = post_detail.get('ویژگی ها', ["None","None","None"])
                post_detail['ویژگی ها'] = [feature == "آسانسور" for feature in features]
                return post_detail


        def cookie_saver(self, cookie: str) -> None:
            """
            it open's login page and give you 60 sec to login, than it's going to save a cookie
            """
            self.temp_divar_obj = Divar(headless=False)

            self.temp_divar_obj.login('9212031469', cookie='9212396361.pkl')
            time.sleep(60)
            self.divar_obj.save_cookie(cookie)
            del self.temp_divar_obj
            

        def last_24_files(self) -> None:
            self.divar_obj.login('9212396361', cookie='9212396361.pkl')
            posts = self.divar_obj.all_posts(page=self.divar_url)
            time.sleep(3)
            valid_types = ['A', 'L', 'S', 'H']

            for post in posts:
                self.logger.info(f'in => {post}  ')
                res = self.divar_obj.post_details(post)
                res = self.validation(res)
                self.logger.debug(f'extracted data: {res}')

                if "فروش" in res["شاخه"][1] and res['نوع'] in valid_types:
                    self.handle_sell(res)
                elif "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                    self.handle_rent(res)

                self.logger.info(f'done => {post}  ')

        def handle_sell(self, res):
            if res['شمارهٔ موبایل'] == 'None':
                self.logger.warning('phone was None!! ')
                return

            try:
                file, created = models.Sell.objects.get_or_create(owner_name="UNKNOWN",
                                                        owner_phone=res['شمارهٔ موبایل'],
                                                        address=res["شاخه"][-1],
                                                        m2=res['متراژ'],
                                                        price=res['قیمت کل'],
                                                        year=res['ساخت'],
                                                        floor=res['طبقه'][0],
                                                        elevator=res['ویژگی ها'][0],
                                                        parking=res['ویژگی ها'][2],
                                                        storage=res['ویژگی ها'][1],
                                                        type=res['نوع'],
                                                        added_by=self.bot_user)                            
                if not created:
                    self.logger.info('it was in DB')

                file.tag_manager.add(res['تگ ها'])
            except:
                self.logger.exception('an Error hapend while adding sell file')

        def handle_rent(self, res):
            if res["شاخه"][1] == 'اجاره کوتاه مدت':
                print('اجاره کوتاه مدت')
                return

            if res['شمارهٔ موبایل'] == 'None':
                self.logger.warning('phone was None')
                print('   !!!!ejare!!!!  \n')
                return

            try:
                file, created = models.Rent.objects.get_or_create(owner_name="UNKNOWN",
                                                        owner_phone=res['شمارهٔ موبایل'],
                                                        address=res["شاخه"][-1],
                                                        m2=res['متراژ'],
                                                        price_up=res['ودیعه'],
                                                        price_rent=res['اجاره'],
                                                        year=res['ساخت'],
                                                        floor=res['طبقه'][0],
                                                        elevator=res['ویژگی ها'][0],
                                                        parking=res['ویژگی ها'][2],
                                                        storage=res['ویژگی ها'][1],
                                                        type=res['نوع'],
                                                        added_by=self.bot_user)  
                if not created:
                    self.logger.info('it was in DB')
                                            
                file.tags_manager.add(res['تگ ها'])
            except:
                self.logger.exception('an Error hapend while adding rent file')

        def searcher(self, post, outf="checked_links.txt", inf="checked_links.txt"):
            if post in open(inf,"r").readlines():
                self.logger.warning(f"{post} is here!!!")
                return

            file = f'https://divar.ir/v/{post}'
            time.sleep(30)
            res = self.divar_obj.post_details(file)
            res = self.validation(res)

            if "فروش" in res["شاخه"][1] and res['نوع'] in self.valid_types:
                self.handle_sell(res)
            elif "اجاره" in res["شاخه"][1] and res['نوع'] in self.valid_types:
                self.handle_rent(res)
            else:
                print('it is not sell')

            with open(outf, 'w') as f1:
                f1.write(post)
                self.logger.info(f"{post}  is added ")

        def id_generator(self, link: str) -> str:
            return link[-8:]

        def scanner(self):
            fail_counter = 0
            try:
                while True:
                    self.logger.warning('starting the loop')

                    for cookie, fail in available_cookies:
                        self.divar_obj.login('9373990837', cookie='9373990837.pkl')

                        post = self.divar_obj.last_post(page=self.divar_url)
                        self.logger.info(f'scraping info from {post}') 
                        post_id = self.id_generator(post)
                        self.searcher(post=post_id)
                        self.logger.info(f'current cookie: {self.current_cookie}')
                        time.sleep(180)
                        fail_counter 
                    
                    if fail_counter == 5:
                        self.divar_obj.login('9373990837', cookie='9373990837.pkl')
                        self.logger.warning('logged in with "9373990837"')
                        self.current_cookie['cookie']= '9373990837'
                    if fail_counter == 10:
                        fail_counter = 0
                            
                    if self.current_cookie['passed'] > 2:
                        self.burnt_cookie(cookie=self.current_cookie['cookie'])
            except Exception as e:
                self.logger.exception(f'we have a Error: {e}')



        def run(self) -> None:
            # self.logger.warning('running Divar bot.')
            # self.last_24_files()
            # self.logger.info('done extracting last 24 files.')
            # # self.scanner()
            self.cookie_saver('9212396361.pkl')

