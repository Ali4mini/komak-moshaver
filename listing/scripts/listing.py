from file import models
from listing.scripts.divar.divar import Divar
import time
import traceback

class Listing:
    def __init__(self) -> None:
        
        self.divar_url = 'https://divar.ir/s/tehran/real-estate/khavaran?districts=1015%2C1019%2C1020%2C272%2C273&user_type=personal'
        self.divar_obj = Divar(headless=True)

    def divar_bot(self) -> None:
        def validation(post_detail: dict) -> dict:
            print(post_detail)
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
            
            return post_detail
        def cookie_saver():
            """
            it open's login page and give 120 sec to login than it's going to save a cookie
            """
            self.divar_obj1 = Divar(headless=False)
            self.divar_obj1.login('9212396361', cookie='test1.pkl')
            time.sleep(100)
            self.divar_obj1.save_cookie('test1.pkl')
            del self.divar_obj1
            
        def scanner():
            self.divar_obj.login('9212396361', cookie='test1.pkl')
            def searcher(post,outf="checked_links.txt",inf="checked_links.txt"):
                if post in open(inf,"r").readlines():
                    print(f"{post} is here!!!")
                    
                else:
                    file = f'https://divar.ir/v/{post}'
                    time.sleep(30)
                    res = self.divar_obj.post_details(file)
                    res = validation(res)
                    self.divar_obj.save_cookie('test1.pkl')
                    print(res)
                    valid_types = ['A', 
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
                                    print('it was in DB')
                                file.tag_manager.add(res['تگ ها'])
                            except:
                                pass
                    elif "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                        if res["شاخه"][1] == 'اجاره کوتاه مدت':
                            pass
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
                                        print('it was in DB')
                            
                                    file.tags_manager.add(res['تگ ها'])
                                except:
                                    pass
                    else:
                        print('it is not sell')
                    with open(outf, 'w') as f1:
                        f1.write(post)
                        print(f"{post}  is added ")
                        
            def id_generator(link: str) -> str:
                return link[-8:]
            temp_c = 0
            while True:
                post = self.divar_obj.last_post(page=self.divar_url)
                print(post)
                post_id = id_generator(post)
                searcher(post=post_id)
                time.sleep(60)
                temp_c = temp_c + 1
                if temp_c > 4:
                    self.divar_obj.save_cookie('test1.pkl')
                    time.sleep(10)
                    ## deleting session and making another one
                    self.divar_obj.driver.close()
                    self.divar_obj.driver.quite()

                    self.divar_obj.login('9212396361', cookie='test1.pkl')



        def last_24_files() -> None:
            self.divar_obj.login('9212396361', cookie='test1.pkl')
            posts = self.divar_obj.all_posts(page=self.divar_url)
            time.sleep(3)
            for post in posts:
                print(f'in => {post}  ')
                res = self.divar_obj.post_details(post)
                res = validation(res)
                print(res)
                sell_file_count = models.Sell.objects.count()
                rent_file_count = models.Rent.objects.count()
                valid_types = [ 'A', 
                                'L',
                                'S',
                                'H',
                                   ]

                if "فروش" in res["شاخه"][1] and res['نوع'] in valid_types:
                    if not res['شمارهٔ موبایل'] == 'None':
                        
                        
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
                            print(res['تگ ها'])
                            
                            if not created:
                                    print('it was in DB')
                                
                            file.tag_manager.add(res['تگ ها'])
                        
                        
                    else:
                        print('phone was None!! ')
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
                                print(res['تگ ها'])
                                if not created:
                                    print('it was in DB')
                                    
                                file.tags_manager.add(res['تگ ها'])
                            except:
                                pass
                        else:
                            print('phone was None')
                            print('   !!!!ejare!!!!  \n')
                print(f'done => {post}  ')

          
        # last_24_files()
        # scanner()
        
        cookie_saver()
        del self.divar_obj
        
