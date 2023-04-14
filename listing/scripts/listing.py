from file import models
from listing.scripts.divar.divar import Divar
import time
import traceback

class Listing:
    def __init__(self) -> None:
        
        self.divar_url = 'https://divar.ir/s/tehran/real-estate/khavaran?districts=272%2C273&user_type=personal'
        self.divar_url = 'https://divar.ir/s/tehran/rent-residential?user_type=personal'
        self.divar_obj = Divar(headless=True)

    def divar_bot(self) -> None:
        def validation(post_detail: dict) -> dict:
            print(post_detail)
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
                    if post_detail['اجارهٔ ماهانه'] == 'توافقی':
                        post_detail['اجاره'] = 9999999
                    if post_detail['اجارهٔ ماهانه'] == 'مجانی':
                        post_detail['اجاره'] = 0
                    
                    
                
                # try:
                #     try:
                #         if post_detail['قیمت کل'] == 'توافقی':
                #             post_detail['قیمت کل'] = 9999999
                #     except:
                #         if post_detail['اجارهٔ ماهیانه'] == 'توافقی':
                #             post_detail['اجاره'] = 9999999
                # except:
                #     post_detail['ودیعه'] = post_detail['ودیعه'].replace('٬', '')
                #     post_detail['ودیعه'] = int(post_detail['ودیعه'].replace(' تومان', ''))
                #     post_detail['ودیعه'] = post_detail['ودیعه'] / 1000000    
                #     try:
                #         post_detail['اجاره'] = post_detail['اجارهٔ ماهیانه'].replace('٬', '')
                #         post_detail['اجاره'] = int(post_detail['اجارهٔ ماهیانه'].replace(' تومان', ''))
                #         post_detail['اجاره'] = post_detail['اجارهٔ ماهیانه'] / 1000000
                #     except:
                #         try:
                #             post_detail['اجاره'] = int(post_detail['اجارهٔٔ ماهانه (تومان)'].replace('میلیون تومان', ''))
                #         except:
                #             post_detail['اجاره'] = 0
                            
                            
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

        def scanner():
            self.divar_obj.login('9212396361', cookie='test1.pkl')
            def searcher(post,outf="checked_links.txt",inf="checked_links.txt"):
                if post in open(inf,"r").readlines():
                    print(f"{post} is here!!!")
                    
                else:
                    file = f'https://divar.ir/v/{post}'
                    file = 'https://divar.ir/v/AZ0MycnD'
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
                        models.Sell.objects.create(owner_name="UNKNOWN",
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
                    elif "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                        if res["شاخه"][1] == 'اجاره کوتاه مدت':
                            pass
                        else:
                            models.Rent.objects.create(owner_name="UNKNOWN",
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
                    
                        file_instance = models.Rent.objects.last()
                        tags = file_instance.tag_manager.add(res['تگ ها'])
                    else:
                        print('it is not sell')
                    with open(outf, 'w') as f1:
                        f1.write(post)
                        print(f"{post}  is added ")
                        
            def id_generator(link: str) -> str:
                return link[-8:]
            
            for _ in range(10):
                post = self.divar_obj.last_post(page=self.divar_url)
                print(post)
                post_id = id_generator(post)
                searcher(post=post_id)
                time.sleep(5)

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
                    models.Sell.objects.create(owner_name="UNKNOWN",
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
                    file_instance = models.Sell.objects.last()
                    tags = file_instance.tag_manager.add(res['تگ ها'])
                if "اجاره" in res["شاخه"][1] and res['نوع'] in valid_types:
                    if res["شاخه"][1] == 'اجاره کوتاه مدت':
                            print('اجاره کوتاه مدت')
                    else:
                        models.Rent.objects.create(owner_name="UNKNOWN",
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
                        file_instance = models.Rent.objects.last()
                        tags = file_instance.tags_manager.add(res['تگ ها'])
                        print('   !!!!ejare!!!!  \n')
                print(f'done => {post}  ')

          
            
        # scanner()
        last_24_files()
        del self.divar_obj
        
# class DivarBot:
#     def __init__(self) -> None:
#         self.divar_url = 'https://divar.ir/s/tehran/real-estate/khavaran?districts=272%2C273&user_type=personal'
#         self.divar_obj = Divar(headless=False)

#     def validation(post_detail: dict) -> dict:
#         try:
#             post_detail['شمارهٔ موبایل']
#         except:
#             post_detail['شمارهٔ موبایل'] = 'None'
#         try:
#             post_detail['طبقه'] = post_detail['طبقه'].replace('٬', '')
#             post_detail['طبقه'] = post_detail['طبقه'].replace('از', '')
#             post_detail['طبقه'] = post_detail['طبقه'].split(' ')
#             post_detail['طبقه'] = [int(_) for _ in post_detail['طبقه']]
#         except:
#             post_detail['طبقه'] = [999999]
#         try:
#             post_detail['ساخت']
#         except:
#             post_detail['ساخت'] = 999999
#         try:
#             post_detail['متراژ'] = post_detail['متراژ'].replace('٬', '')
#             post_detail['متراژ'] = int(post_detail['متراژ'].replace(' متر', ''))
#         except:
#             post_detail['متراژ'] = 999999
#         try:
#             post_detail['ساخت'] = post_detail['ساخت'].replace('٬', '')
#             post_detail['ساخت'] = int(post_detail['ساخت'].replace(' قبل از ', ''))
#         except:
#             post_detail['ساخت'] = 999999
#         try:
#             post_detail['قیمت کل'] = post_detail['قیمت کل'].replace('٬', '')
#             post_detail['قیمت کل'] = int(post_detail['قیمت کل'].replace(' تومان', ''))
#             post_detail['قیمت کل'] = post_detail['قیمت کل'] / 1000000
#         except:
#             if post_detail['قیمت کل'] == 'توافقی':
#                 post_detail['قیمت کل'] = 9999999
        
#         try:
#             if post_detail['ویژگی ها'][0] == "آسانسور":
#                 post_detail['ویژگی ها'][0] = True
#             else:
#                 post_detail['ویژگی ها'][0] = False
                
#             if post_detail['ویژگی ها'][1] == "پارکینگ":
#                 post_detail['ویژگی ها'][1] = True
#             else:
#                 post_detail['ویژگی ها'][1] = False
                
#             if post_detail['ویژگی ها'][2] == "انباری":
#                 post_detail['ویژگی ها'][2] = True
#             else:
#                 post_detail['ویژگی ها'][2] = False            
#         except IndexError: 
#             post_detail['ویژگی ها'] = ["None","None","None"]
#             if post_detail['ویژگی ها'][0] == "آسانسور":
#                 post_detail['ویژگی ها'][0] = True
#             else:
#                 post_detail['ویژگی ها'][0] = False
                
#             if post_detail['ویژگی ها'][1] == "پارکینگ":
#                 post_detail['ویژگی ها'][1] = True
#             else:
#                 post_detail['ویژگی ها'][1] = False
                
#             if post_detail['ویژگی ها'][2] == "انباری":
#                 post_detail['ویژگی ها'][2] = True
#             else:
#                 post_detail['ویژگی ها'][2] = False  
                
                
#         if post_detail["شاخه"][2] == "آپارتمان":
#             post_detail['نوع'] = 'A'
#         elif post_detail["شاخه"][2] == "زمین و کلنگی":
#             post_detail['نوع'] = 'L'
#         elif post_detail["شاخه"][2] == 'خانه و ویلا':
#             post_detail['نوع'] = 'H'
            
#         post_detail['تگ ها'] = 'دیوار'  
        
#         return post_detail

#     def scanner(self):
#         self.divar_obj.login('9212396361', cookie='test1.pkl')
#         def searcher(post,outf="checked_links.txt",inf="checked_links.txt"):
#             if post in open(inf,"r").readlines():
#                 print(f"{post} is here!!!")

#             else:
#                 with open(outf, 'w') as f1:
#                     f1.write(post)
#                     print(f"{post}  is added ")
#         def id_generator(link: str) -> str:
#             return link[-8:]
#         while True:
#             post = self.divar_obj.first_post(page=self.divar_url)
#             post_id = id_generator(post)
#             searcher(post=post_id)
#             time.sleep(5)
        
        


#     def last_24_files(self) -> None:
#         self.divar_obj.login('9212396361', cookie='test1.pkl')
#         posts = self.divar_obj.all_posts(page=self.divar_url)
#         time.sleep(3)
#         for post in posts:
#             print(f'in => {post}  ')
#             res = self.divar_obj.post_details(post)
#             res = self.validation(res)
#             file_count = models.Sell.objects.count()
#             if "فروش" in res["شاخه"][1]:
#                 models.Sell.objects.create(owner_name="UNKNOWN",
#                                         owner_phone=res['شمارهٔ موبایل'],
#                                         address=res["شاخه"][-1],
#                                         m2=res['متراژ'],
#                                         price=res['قیمت کل'],
#                                         year=res['ساخت'],
#                                         floor=res['طبقه'][0],
#                                         elevator=res['ویژگی ها'][0],
#                                         parking=res['ویژگی ها'][2],
#                                         storage=res['ویژگی ها'][1],
#                                         type=res['نوع'],
#                                         )
#                 file_instance = models.Sell.objects.last()
#                 tags = file_instance.tag_manager.add(res['تگ ها'])
        
    
