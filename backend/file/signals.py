# from django.db.models.signals import post_save
# from django.forms.models import model_to_dict
# from django.dispatch import receiver
# from .tasks import welcome_message, match_customers
# from .models import Sell, Rent


# #SECTION - Signals
# @receiver(signal=post_save, sender=Sell)
# def new_sell_file_signal(sender, instance, created, *args, **kwargs):
#     data = model_to_dict(instance, exclude=['image1','image2','image3','image4','image5',])

#     if instance.added_by != 'listing_bot' and created:
#         welcome_message.delay(data=data)
#         match_customers.delay(data=data, file_type='sell')
       
#     elif instance.added_by == 'listing_bot' and not created:
#         try:
#             welcome_message(instance=instance)
#             match_customers(instance=instance, file_type='sell')
#         except: 
#             pass
        
# @receiver(signal=post_save, sender=Rent)
# def new_rent_file_signal(sender, instance, created, *args, **kwargs):
#     data = model_to_dict(instance, exclude=['image1','image2','image3','image4','image5',])

#     if instance.added_by != 'listing_bot' and created:
#         welcome_message.delay(data=data)
#         match_customers.delay(data=data, file_type='rent')

#     elif instance.added_by == 'listing_bot' and not created:
#         try:
#             welcome_message(instance=instance)
#             match_customers(instance=instance, file_type='rent')
#         except: 
#             pass
# #!SECTION