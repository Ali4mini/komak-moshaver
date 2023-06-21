from django.db.models.signals import post_save
from django.forms.models import model_to_dict
from django.dispatch import receiver
from .models import BuyCustomer, RentCustomer
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
#!SECTION

#SECTION - Signals
@receiver(signal=post_save, sender=BuyCustomer)
def new_buy_customer_signal(sender, instance, created, *args, **kwargs):
    if created:
        try:
            welcome_message(instance=instance)
        except: 
            pass

@receiver(signal=post_save, sender=RentCustomer)
def new_rent_customer_signal(sender, instance, created, *args, **kwargs):
    if created:
        try:
            welcome_message(instance=instance)
        except: 
            pass    