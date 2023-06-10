from django.db.models.signals import post_save
from django.forms.models import model_to_dict
from django.dispatch import receiver
from .models import Sell, Rent
import requests

#! signals
@receiver(signal=post_save, sender=Sell)
def new_buy_file_signal(sender, instance, created, *args, **kwargs):
    if created:
        data = model_to_dict(instance=instance)

        template = f'''مشتری عزیز شما با موفقیت به سامانه املاک ولیعصر اضافه شدید'''
        message_data = {'from':'50004001845778', 'to':[data['owner_phone']], 'text':template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=message_data)
        print(message_data)
        print(response)

@receiver(signal=post_save, sender=Rent)
def new_rent_file_signal(sender, instance, created, *args, **kwargs):
    if created:
        data = model_to_dict(instance=instance)

        template = f'''مشتری عزیز شما با موفقیت به سامانه املاک ولیعصر اضافه شدید'''
        
        message_data = {'from':'50004001845778', 'to':[data['owner_phone']], 'text':template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=message_data)
        print(message_data)
        print(response)
    