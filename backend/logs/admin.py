from django.contrib import admin
from .models import SellCall, RentCall

# Register your models here.

@admin.register(SellCall)
class SellAdmin(admin.ModelAdmin):
    list_display = ["file", "customer", "created", "added_by"]
    list_filter = [
        "added_by", "file", "customer"
    ]
