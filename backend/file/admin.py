from django.contrib import admin
from .models import Sell, Rent, SellImage, RentImage

# Register your models here.


@admin.register(Sell)
class SellAdmin(admin.ModelAdmin):
    list_display = [
        "owner_name",
        "m2",
        "address",
        "property_type",
        "divar_token",
        "date",
    ]
    list_filter = [
        "m2",
        "price",
    ]
    # search_fields = ['title', 'body']
    # prepopulated_fields = {'slug': ('title',)}
    # raw_id_fields = ['author']
    # date_hierarchy = 'publish'
    # ordering = ['status', 'publish']


@admin.register(Rent)
class RentAdmin(admin.ModelAdmin):
    list_display = [
        "owner_name",
        "m2",
        "address",
        "property_type",
        "divar_token",
        "created",
        "updated",
        "date",
    ]
    list_filter = [
        "m2",
        "price_up",
        "price_rent",
    ]


@admin.register(SellImage)
class SellImage(admin.ModelAdmin):
    list_display = ["file", "image"]


@admin.register(RentImage)
class RentImage(admin.ModelAdmin):
    list_display = ["file", "image"]
