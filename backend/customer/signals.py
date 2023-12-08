# from django.db.models.signals import post_save
# from django.forms.models import model_to_dict
# from django.dispatch import receiver
# from .models import BuyCustomer, RentCustomer
# from .tasks import welcome_message
# import requests




# #SECTION - Signals
# @receiver(signal=post_save, sender=BuyCustomer)
# def new_buy_customer_signal(sender, instance, created, *args, **kwargs):
#     if created:
#         data = model_to_dict(instance)
#         welcome_message.delay(data=data)
        

# @receiver(signal=post_save, sender=RentCustomer)
# def new_rent_customer_signal(sender, instance, created, *args, **kwargs):
#     if created:
#         data = model_to_dict(instance)
#         welcome_message.delay(data=instance)




