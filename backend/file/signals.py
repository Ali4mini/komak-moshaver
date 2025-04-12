# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from file.tasks import send_sell_related_customers_message
# from .models import Rent, Sell
#
#
# @receiver(post_save, sender=[Sell, Rent])
# def send_sell_related_customers_signal(sender, instance, created, **kwargs):
#     send_sell_related_customers_message.delay(instance)
#     print("signal finished")
