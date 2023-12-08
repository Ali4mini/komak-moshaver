from celery import shared_task
from .models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from requests import Response
import requests


#SECTION - Tasks
@shared_task
def welcome_message(data):

    template = f'''مشتری عزیز شما با موفقیت به سامانه املاک ولیعصر اضافه شدید'''
    
    message_data = {'from':'50004001845778', 'to':[data['owner_phone']], 'text':template, 'udh':''}
    response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01',
                             json=message_data)
    return response.status_code

@shared_task
def match_customers(data, file_type):
    if data['parking'] == True:
        data['parking'] = 'دارد'
    else: 
        data['parking'] = 'ندارد'
    if data['elevator'] == True:
        data['elevator'] = 'دارد'
    else: 
        data['elevator'] = 'ندارد'
    if data['storage'] == True:
        data['storage'] = 'دارد'
    else: 
        data['storage'] = 'ندارد'

    if file_type == 'sell':
        sell_template = f'''مشتری عزیز یک فایل جدید برای شما پیدا شد
        قیمت:{data['price']}
        متراژ:{data['m2']}
        آدرس:{data['address']}
        طبقه:{data['floor']}
        پارکینگ:{data['parking']}
        آسانسور:{data['elevator']}
        انباری:{data['storage']}'''
        customers = BuyCustomer.objects.filter(budget__gte=data['price'],
                                               m2__lte=data['m2'],).all()
        customers = [customer.customer_phone for customer in customers]
        message_data = {'from':'50004001845778', 'to':customers, 'text':sell_template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', 
                                 json=message_data)

    elif file_type == 'rent':
        
        rent_template = f'''مشتری عزیز یک فایل جدید برای شما پیدا شد
        ودیعه:{data['price_up']}
        اجاره:{data['price_rent']}
        متراژ:{data['m2']}
        آدرس:{data['address']}
        طبقه:{data['floor']}
        پارکینگ:{data['parking']}
        آسانسور:{data['elevator']}
        انباری:{data['storage']}'''
        customers = RentCustomer.objects.filter(up_budget__gte=data['price_up'],
                                                rent_budget__gte=data['price_rent'],
                                                m2__lte=data['m2'])
        customers = [customer.customer_phone for customer in customers]
        message_data = {'from':'50004001845778', 'to':customers, 'text':rent_template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', 
                                 json=message_data)

    return response.status_code
#!SECTION
