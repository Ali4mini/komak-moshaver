from django.db.models.signals import post_save
from django.forms.models import model_to_dict
from django.dispatch import receiver
from .models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from requests import Response
import requests

#SECTION - Tasks
def welcome_message(instance) -> Response:
    data = model_to_dict(instance=instance)

    template = f'''مشتری عزیز شما با موفقیت به سامانه املاک ولیعصر اضافه شدید'''
    
    message_data = {'from':'50004001845778', 'to':[data['owner_phone']], 'text':template, 'udh':''}
    response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01',
                             json=message_data)
    return response

def match_customers(instance, file_type) -> bool:
    data = model_to_dict(instance=instance)
    
    if file_type == 'sell':
        sell_template = f'''مشتری عزیز یک فایل جدید برای شما پیدا شد
        قیمت:{data['price']}
        متراژ:{data['m2']}
        آدرس:{data['address']}
        طبقه:{data['floor']}'''
        customers = BuyCustomer.objects.filter(budget__gte=data['price'],
                                               m2__lte=data['m2'],).all()
        customers = [customer.customer_phone for customer in customers]
        message_data = {'from':'50004001845778', 'to':customers, 'text':sell_template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', 
                                 json=message_data)
        print(response)
    elif file_type == 'rent':
        
        rent_template = f'''مشتری عزیز یک فایل جدید برای شما پیدا شد
        ودیعه:{data['price_up']}
        اجاره:{data['price_rent']}
        متراژ:{data['m2']}
        آدرس:{data['address']}
        طبقه:{data['floor']}'''
        customers = RentCustomer.objects.filter(up_budget__gte=data['price_up'],
                                                rent_budget__gte=data['price_rent'],
                                                m2__lte=data['m2'])
        customers = [customer.customer_phone for customer in customers]
        message_data = {'from':'50004001845778', 'to':customers, 'text':rent_template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', 
                                 json=message_data)
        print(response)
#!SECTION



#SECTION - Signals
@receiver(signal=post_save, sender=Sell)
def new_sell_file_signal(sender, instance, created, *args, **kwargs):
    if instance.added_by != 'listing_bot' and created:
        try:
            welcome_message(instance=instance)
            match_customers(instance=instance, file_type='sell')
        except: 
            pass
    elif instance.added_by == 'listing_bot' and not created:
        try:
            welcome_message(instance=instance)
            match_customers(instance=instance, file_type='sell')
        except: 
            pass
        
@receiver(signal=post_save, sender=Rent)
def new_rent_file_signal(sender, instance, created, *args, **kwargs):
    if instance.added_by != 'listing_bot' and created:
        try:
            welcome_message(instance=instance)
            match_customers(instance=instance, file_type='rent')
        except: 
            pass
    elif instance.added_by == 'listing_bot' and not created:
        try:
            welcome_message(instance=instance)
            match_customers(instance=instance, file_type='rent')
        except: 
            pass
#!SECTION