from file import models
from listing.scripts.divar.divar import Divar
from time import sleep


class Listing:
    def __init__(self) -> None:
        
        self.divar_url = 'https://divar.ir/s/tehran/buy-residential/khavaran?districts=273%2C272&user_type=personal'

    def divar_bot(self) -> None:
        def validation(post_detail: dict) -> dict:
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
            try:
                post_detail['قیمت کل'] = post_detail['قیمت کل'].replace('٬', '')
                post_detail['قیمت کل'] = int(post_detail['قیمت کل'].replace(' تومان', ''))
                post_detail['قیمت کل'] = post_detail['قیمت کل'] / 1000000
            except:
                if post_detail['قیمت کل'] == 'توافقی':
                    post_detail['قیمت کل'] = 9999999
            
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
                    
                    
            if post_detail["شاخه"][2] == "آپارتمان":
                post_detail['نوع'] = 'A'
            elif post_detail["شاخه"][2] == "زمین و کلنگی":
                post_detail['نوع'] = 'L'
            elif post_detail["شاخه"][2] == 'خانه و ویلا':
                post_detail['نوع'] = 'H'
                
            post_detail['تگ ها'] = 'دیوار'  
            
            return post_detail
            
        Divar_obj = Divar(headless=True)
        Divar_obj.login('9212396361', cookie='alireza2.pkl')
        posts = Divar_obj.all_posts(page=self.divar_url)
        sleep(6)
        #Divar_obj.save_cookie('alireza.pkl')
        for post in posts[:3]:
            print(f'in => {post}  ')
            res = Divar_obj.post_details(post)
            res = validation(res)
            file_count = models.Sell.objects.count()
            if res["شاخه"][1] == "فروش مسکونی":
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
        
        
        del Divar_obj