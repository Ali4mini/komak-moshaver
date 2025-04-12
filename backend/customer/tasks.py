from requests import Response
import requests
from celery import shared_task

#SECTION - Tasks
@shared_task
def welcome_message(data):

    template = f'''مشتری عزیز شما با موفقیت به سامانه املاک ولیعصر اضافه شدید'''
    
    message_data = {'from':'50004001845778', 'to':[data['customer_phone']], 'text':template, 'udh':''}
    response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01',
                             json=message_data)

    return response.status_code
    
#!SECTION