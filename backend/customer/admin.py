from django.contrib import admin
from .models import BuyCustomer, RentCustomer

# Register your models here.

@admin.register(BuyCustomer)
class SellAdmin(admin.ModelAdmin):
    list_display = ['property_type','customer', 'budget', ]
    list_filter = ['budget', ]



@admin.register(RentCustomer)
class RentAdmin(admin.ModelAdmin):
    list_display = ['property_type','customer', 'up_budget', 'rent_budget']
    list_filter = ['up_budget', 'rent_budget']
