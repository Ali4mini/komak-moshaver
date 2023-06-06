from django.apps import AppConfig
from django.db.models.signals import post_save

class CustomerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'customer'
    def ready(self) -> None:
        from . import signals
        from . import models
        post_save.connect(receiver=signals.new_buy_customer_signal, sender=models.BuyCustomer)
        post_save.connect(receiver=signals.new_rent_customer_signal, sender=models.RentCustomer)
