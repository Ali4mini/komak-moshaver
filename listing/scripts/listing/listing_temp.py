from django.contrib.auth.models import User
from file import models
from listing.scripts.divar.divar import Divar
import time
import traceback
import logging, logging.handlers
import requests
import pickle
import random

class DivarBot:
    def __init__(self):
        self.bot_user = User.objects.get_by_natural_key('listing_bot')
        self.divar_url = 'https://divar.ir/s/tehran/real-estate/doolab?districts=1017%2C273%2C974%2C1016&user_type=personal&sort=sort_date'
        self.divar_obj = Divar(headless=True)
        self.logger = self._setup_logger()
        self.valid_types = ['A', 'L', 'S', 'H']
        self.cookies = [
            '9212396361.pkl',
            '9373990837.pkl',
            '9205992786.pkl',
        ]
        self.burnt_cookies = []
        self.last_file_added = ''


    @staticmethod
    def _setup_logger():
        logger = logging.getLogger('Divar')
        logger.setLevel(logging.INFO)
        return logger

    def BurntCookie(self, cookie):
        """this method should called when a cookie is burnt"""
        template = f'''
                    we have a burnt cookie
                    cookie: {cookie}
                    '''
        data = {'from':'50004001845778', 'to':['09212396361'], 'text':template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=data)

    def cookie_saver(self, cookie: str) -> None:
        """
        it open's login page and give you 60 sec to login, than it's going to save a cookie
        """
        self.divar_obj1 = Divar(headless=True)

        self.divar_obj1.login('9212396361')
        time.sleep(60)
        self.divar_obj.save_cookie(cookie)
        del self.divar_obj1

    def validation(self, post_detail: dict) -> dict:
        self.logger.info(f'extracted info: {post_detail}')

        if "کوتاه مدت" in post_detail['شاخه'][1]:
            post_detail['ودیعه'] = 0
            post_detail['اجارهٔ ماهانه'] = 0
            post_detail['اجاره'] = 0
        post_detail['نوع'] = 'NOT'
        if "آپارتمان" in post_detail["شاخه"][2]:
            post_detail['نوع'] = 'A'
        elif "زمین و کلنگی" in post_detail["شاخه"][2]:
            post_detail['نوع'] = 'L'
        elif 'خانه و ویلا' in post_detail["شاخه"][2]:
            post_detail['نوع'] = 'H'
        elif 'مغازه و غرفه' in post_detail["شاخه"][2]:
            post_detail['نوع'] = 'S'

        # Remove the unnecessary try-except block
        post_detail['شمارهٔ موبایل'] = post_detail.get('شمارهٔ موبایل', 'None')

        # Improve code readability by breaking down the code into smaller sections
        post_detail['طبقه'] = post_detail.get('طبقه')
        if post_detail['طبقه']:
            post_detail['طبقه'] = post_detail['طبقه'].replace('٬', '').replace('از', '').split(' ')
            post_detail['طبقه'] = [int(_) for _ in post_detail['طبقه']]
        else:
            post_detail['طبقه'] = [999999]

        # Remove the unnecessary try-except block
        post_detail['ساخت'] = post_detail.get('ساخت', 999999)

        # Improve code readability by breaking down the code into smaller sections
        post_detail['متراژ'] = post_detail.get('متراژ')
        if post_detail['متراژ']:
            post_detail['متراژ'] = int(post_detail['متراژ'].replace('٬', '').replace(' متر', ''))
        else:
            post_detail['متراژ'] = 999999

        # Improve code readability by breaking down the code into smaller sections
        post_detail['ساخت'] = post_detail.get('ساخت')
        if post_detail['ساخت']:
            post_detail['ساخت'] = int(post_detail['ساخت'].replace('٬', '').replace(' قبل از ', ''))
        else:
            post_detail['ساخت'] = 999999

        # Improve code readability by breaking down the code into smaller sections
        if "فروش" in post_detail.get("شاخه", [''])[1]:
            post_detail['قیمت کل'] = post_detail.get('قیمت کل')
            if post_detail['قیمت کل']:
                post_detail['قیمت کل'] = int(post_detail['قیمت کل'].replace('٬', '').replace(' تومان', '')) / 1000000
            elif post_detail.get('قیمت کل') == 'توافقی':
                post_detail['قیمت کل'] = 9999999

        elif "اجاره" in post_detail.get("شاخه", [''])[1]:
            post_detail['ودیعه'] = post_detail.get('ودیعه')
            if post_detail['ودیعه']:
                try:
                    post_detail['ودیعه'] = int(post_detail['ودیعه'].replace('٬', '').replace(' تومان', '')) / 1000000
                except:
                    post_detail['ودیعه'] = int(post_detail['ودیعه (تومان)'].replace('٬', '').replace(' میلیون', ''))
            elif post_detail.get('ودیعه') == 'توافقی':
                post_detail['ودیعه'] = 9999999

            post_detail['اجاره'] = post_detail.get('اجارهٔ ماهانه')
            if post_detail['اجاره']:
                try:
                    post_detail['اجاره'] = float(post_detail['اجاره'].replace('٬', '').replace(' تومان', '')) / 1000000
                except:
                    post_detail['اجاره'] = float(post_detail['اجارهٔ ماهانه (تومان)'].replace('٬', '').replace(' میلیون', ''))
            else:
                post_detail['اجاره'] = 0
                
            post_detail['ویژگی ها'] = post_detail.get('ویژگی ها', ["None", "None", "None"])
            post_detail['ویژگی ها'] = [
                True if item == "آسانسور" else False for item in post_detail['ویژگی ها']
            ]
            post_detail['ویژگی ها'] = [
                True if item == "پارکینگ" else False for item in post_detail['ویژگی ها']
            ]
            post_detail['ویژگی ها'] = [
                True if item == "انباری" else False for item in post_detail['ویژگی ها']
            ]
                
            post_detail['تگ ها'] = 'دیوار'  
            self.logger.info(f'ready to use info: {post_detail}')
            
            return post_detail
        


    def last_24_files(self) -> None:
            self.divar_obj.login('9212396361', cookie='9373990837.pkl')
            posts = self.divar_obj.all_posts(page=self.divar_url)
            time.sleep(3)

            for post in posts:
                self.logger.info(f'in => {post}  ')
                res = self.divar_obj.post_details(post)
                res = self.validation(res)
                self.logger.debug(f'extracted data: {res}')

                if "فروش" in res["شاخه"][1] and res['نوع'] in self.valid_types:
                    self.handle_sell(res)
                elif "اجاره" in res["شاخه"][1] and res['نوع'] in self.valid_types:
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
                                                    property_type=res['نوع'],
                                                    added_by=self.bot_user,
                                                    divar_token=res['توکن'])                            
            if not created:
                self.logger.info('it was in DB')

            file.tag_manager.add(res['تگ ها'])
            self.last_file_added = res['توکن']

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
                                                    property_type=res['نوع'],
                                                    added_by=self.bot_user,
                                                    divar_token=res['توکن'])  
            if not created:
                self.logger.info('it was in DB')
                                        
            file.tags_manager.add(res['تگ ها'])
            self.last_file_added = res['توکن']
        except:
            self.logger.exception('an Error hapend while adding rent file')

    def id_generator(self, link: str) -> str:
        return link[-8:]

    def elements_before_arg(my_list: list, target_element: any) -> list:
        result_list = []
        for element in my_list:
            if element == target_element:
                break
            result_list.append(element)
        return result_list

    def scanner(self):
        try:
            while True:
                for cookie in self.cookies:
                    print(cookie)
                    self.logger.warning('starting the loop')
                    self.divar_obj.login('9373990837', cookie=cookie)
                    posts = self.divar_obj.all_posts(page=self.divar_url)
                    self.logger.info(f'files are {post}') 
                    posts_to_add = self.elements_before_arg(posts, self.last_file_added)
                    self.searcher(post=post_id)
                    
                    time.sleep(random.randint(900, 1300))
                
                
        except Exception as e:
            self.logger.exception(f'we have a Error in scanner: {e}')



    def run(self) -> None:
        # self.logger.warning('running Divar bot.')
        # self.last_24_files()
        # self.logger.info('done extracting last 24 files.')
        self.scanner()
        # self.cookie_saver('9212396361.pkl')
