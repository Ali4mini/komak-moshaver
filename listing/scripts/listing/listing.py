from file import models
from listing.scripts.divar.divar import Divar
import time
import traceback
import logging, logging.handlers
import requests
import pickle
# ! Custom exceptions
  

class Listing:
    def __init__(self) -> None:
        
        self.logger = logging.getLogger('Listing')
        self.logger.info('initialized listing object')
        
    class DivarBot:
        def __init__(self, *args, **kwargs) -> None:
            super().__init__(*args, **kwargs)
            self.divar_url = 'https://divar.ir/s/tehran/real-estate/doolab?districts=1017%2C273%2C974%2C1016&user_type=personal&sort=sort_date'
            self.divar_obj = Divar(headless=True)
            self.logger = logging.getLogger('Divar')
            self.logger.setLevel(logging.INFO)
            
            self.smtphandler = logging.handlers.SMTPHandler(mailhost='localhost',
                                                           fromaddr='divar.bot@test.xyz',
                                                           toaddrs='ali.4mini@proton.me',
                                                           subject='Divar Bot Errors')
            self.smtphandler.setFormatter("%(process)d-%(levelname)s-%(message)s")
            self.smtphandler.setLevel(logging.ERROR)
            self.logger.addHandler(self.smtphandler)
        def BurntCookie(self, cookie):
            """this method should called when a cookie is burnt"""
            template = f'''
                        we have a burnt cookie
                        cookie: {cookie}
                        '''
            data = {'from':'50004001845778', 'to':['09212396361'], 'text':template, 'udh':''}
            response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=data)
        
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
            try:
                post_detail['شمارهٔ موبایل']
            except:
                post_detail['شمارهٔ موبایل'] = 'None'
            try:
                post_detail['طبقه'] = post_detail['طبقه'].replace('٬', '')
                post_detail['طبقه'] = post_detail['طبقه'].replace('از', '')
                post_detail['طبقه'] = post_detail['طبقه'].split(' ')
                post_detail['طبقه'] = [int(_) for _ in post_detail['طبقه']]
            except:
                post_detail['طبقه'] = [999999]
            try:
                post_detail['ساخت']
            except:
                post_detail['ساخت'] = 999999
            try:
                post_detail['متراژ'] = post_detail['متراژ'].replace('٬', '')
                post_detail['متراژ'] = int(post_detail['متراژ'].replace(' متر', ''))
            except:
                post_detail['متراژ'] = 999999
            try:
                post_detail['ساخت'] = post_detail['ساخت'].replace('٬', '')
                post_detail['ساخت'] = int(post_detail['ساخت'].replace(' قبل از ', ''))
            except:
                post_detail['ساخت'] = 999999
            if "فروش" in post_detail["شاخه"][1]:
                try:
                    post_detail['قیمت کل'] = post_detail['قیمت کل'].replace('٬', '')
                    post_detail['قیمت کل'] = int(post_detail['قیمت کل'].replace(' تومان', ''))
                    post_detail['قیمت کل'] = post_detail['قیمت کل'] / 1000000
                except:
                    if post_detail['قیمت کل'] == 'توافقی':
                        post_detail['قیمت کل'] = 9999999
            elif "اجاره" in post_detail["شاخه"][1]:
                try:
                    try:
                        post_detail['ودیعه'] = post_detail['ودیعه'].replace('٬', '')
                        post_detail['ودیعه'] = int(post_detail['ودیعه'].replace(' تومان', ''))
                        post_detail['ودیعه'] = post_detail['ودیعه'] / 1000000   
                    except:
                        post_detail['ودیعه'] = post_detail['ودیعه (تومان)'].replace('٬', '')
                        post_detail['ودیعه'] = int(post_detail['ودیعه'].replace(' میلیون', ''))
                except:
                    if post_detail['ودیعه'] == 'توافقی':
                        post_detail['ودیعه'] = 9999999
                    
                try:
                    try:
                        post_detail['اجاره'] = post_detail['اجارهٔ ماهانه'].replace('٬', '')
                        post_detail['اجاره'] = float(post_detail['اجاره'].replace(' تومان', ''))
                        post_detail['اجاره'] = post_detail['اجاره'] / 1000000
                    except:
                        post_detail['اجاره'] = post_detail['اجارهٔ ماهانه (تومان)'].replace('٬', '')
                        post_detail['اجاره'] = float(post_detail['اجاره'].replace(' میلیون', ''))
                except Exception:
                    traceback.print_exc()
                    try:
                       if post_detail['اجارهٔ ماهانه'] == 'توافقی':
                          post_detail['اجاره'] = 9999999
                       if post_detail['اجارهٔ ماهانه'] == 'مجانی':
                          post_detail['اجاره'] = 0
                    except:
                       post_detail['اجاره'] = 0
                          
            try:            
                
                if post_detail['ویژگی ها'][0] == "آسانسور":
                    post_detail['ویژگی ها'][0] = True
                else:
                    post_detail['ویژگی ها'][0] = False
                    
                if post_detail['ویژگی ها'][1] == "پارکینگ":
                    post_detail['ویژگی ها'][1] = True
                else:
                    post_detail['ویژگی ها'][1] = False
                    
                if post_detail['ویژگی ها'][2] == "انباری":
                    post_detail['ویژگی ها'][2] = True
                else:
                    post_detail['ویژگی ها'][2] = False            
            except IndexError: 
                post_detail['ویژگی ها'] = ["None","None","None"]
                if post_detail['ویژگی ها'][0] == "آسانسور":
                    post_detail['ویژگی ها'][0] = True
                else:
                    post_detail['ویژگی ها'][0] = False
                    
                if post_detail['ویژگی ها'][1] == "پارکینگ":
                    post_detail['ویژگی ها'][1] = True
                else:
                    post_detail['ویژگی ها'][1] = False
                    
                if post_detail['ویژگی ها'][2] == "انباری":
                    post_detail['ویژگی ها'][2] = True
                else:
                    post_detail['ویژگی ها'][2] = False  
                    
                    

                
            post_detail['تگ ها'] = 'دیوار'  
            self.logger.info(f'ready to use info: {post_detail}')
            
            return post_detail
        def cookie_saver(self, cookie: str) -> None:
            """
            it open's login page and give you 60 sec to login, than it's going to save a cookie
            """
            self.divar_obj1 = Divar(headless=False)

            self.divar_obj1.login('9212031469', cookie='9212031469.pkl')
            self.divar_obj.save_cookie(cookie)
            del self.divar_obj1
            
        def scanner(self):
            current_cookie = {'cookie': '', 'passed': 0}
            def searcher(post, outf="checked_links.txt", inf="checked_links.txt"):
                if post in open(inf,"r").readlines():
                    self.logger.warning(f"{post} is here!!!")
                    
                else:
                    file = f'https://divar.ir/v/{post}'
                    time.sleep(30)
                    res = self.divar_obj.post_details(file)
                    res = self.validation(res)
                    valid_types = ['A', 
                                   'L',
                                   'S',
                                   'H',
                                   ]
                    if "فروش" in res["شاخه"][1] and res['نوع'] in valid_types:
                        if not res['شمارهٔ موبایل'] == 'None':
                            current_cookie['passed'] = 0
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
                                                    )
                                if not created:
                                    self.logger.warning('it was in DB')
                                file.tag_manager.add(res['تگ ها'])
                            except Exception as e:
                                current_cookie['passed'] += 1 
                                self.logger.exception('there was a error while adding sell file to DB')

                    elif "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                        if res["شاخه"][1] == 'اجاره کوتاه مدت':
                            pass
                        else:
                            if not res['شمارهٔ موبایل'] == 'None':
                                current_cookie['passed'] = 0
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
                                                        )
                                    if not created:
                                        self.logger.info('it was in DB')
                            
                                    file.tags_manager.add(res['تگ ها'])
                                except:
                                    self.logger.exception('there was a error while adding rent file to DB')
                            else:
                                current_cookie['passed'] += 0

                    else:
                        print('it is not sell')
                    with open(outf, 'w') as f1:
                        f1.write(post)
                        self.logger.info(f"{post}  is added ")
                        
            def id_generator(link: str) -> str:
                return link[-8:]
            temp_c = 0
            try:
                while True:
                    self.logger.warning('starting the loop')

                    if temp_c == 0:
                        self.divar_obj.login('9212396361', cookie='9212396361.pkl')
                        self.logger.warning('logged in with "9212396361"')
                        current_cookie['cookie'] = '9212396361'

                    post = self.divar_obj.last_post(page=self.divar_url)
                    self.logger.info(f'scraping info from {post}') 
                    post_id = id_generator(post)
                    searcher(post=post_id)

                    time.sleep(180)
                    temp_c = temp_c + 1
                    if temp_c == 5:
                        self.divar_obj.login('9199328173', cookie='9199328173.pkl')
                        self.logger.warning('logged in with "9199328173"')
                        current_cookie['cookie']= '9199328173'
                    if temp_c == 10:
                        self.divar_obj.login('9212031469', cookie='9212031469.pkl')
                        self.logger.warning('logged in with "9212031469"')
                        current_cookie['cookie'] = '9212031469'
                    if temp_c == 15:
                        temp_c = 0
                        
                    if current_cookie['passed'] > 4:
                        self.BurntCookie(cookie=current_cookie['cookie'])
            except Exception as e:
                self.logger.exception('we have a Error: ')

        def last_24_files(self) -> None:
            self.divar_obj.login('9212396361', cookie='test1.pkl')
            posts = self.divar_obj.all_posts(page=self.divar_url)
            time.sleep(3)
            for post in posts:
                self.logger.info(f'in => {post}  ')
                res = self.divar_obj.post_details(post)
                res = self.validation(res)
                self.logger.debug(f'extracted data: {res}')
                sell_file_count = models.Sell.objects.count()
                rent_file_count = models.Rent.objects.count()
                valid_types = [ 'A', 
                                'L',
                                'S',
                                'H',
                                   ]

                if "فروش" in res["شاخه"][1] and res['نوع'] in valid_types:
                    if not res['شمارهٔ موبایل'] == 'None':
                        
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
                                                    )                            
                            if not created:
                                    self.logger.info('it was in DB')

                            file.tag_manager.add(res['تگ ها'])
                        
                        except:
                            self.logger.exception('an Error hapend while adding sell file')
                    else:
                        self.logger.warning('phone was None!! ')


                if "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                    if res["شاخه"][1] == 'اجاره کوتاه مدت':
                            print('اجاره کوتاه مدت')
                    else:
                        if not res['شمارهٔ موبایل'] == 'None':
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
                                                    )  
                                if not created:
                                    self.logger.info('it was in DB')
                                    
                                file.tags_manager.add(res['تگ ها'])
                            except:
                                self.logger.exception('an Error hapend while adding rent file')
                        else:
                            self.logger.warning('phone was None')
                            print('   !!!!ejare!!!!  \n')
                self.logger.info(f'done => {post}  ')

        def run(self) -> None:
            self.logger.warning('running Divar bot.')
            self.last_24_files()
            self.logger.info('done extracting last 24 files.')
            self.scanner()
            # self.cookie_saver('9212396361.pkl')

