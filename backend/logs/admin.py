from django.contrib import admin
from .models import SellCall, RentCall, Call

# Register your models here.


@admin.register(SellCall)
class SellAdmin(admin.ModelAdmin):
    list_display = ["file", "customer", "created", "added_by"]
    list_filter = [
        "added_by", "file", "customer"
    ]

@admin.register(Call)
class CallAdmin(admin.ModelAdmin):
    list_display = ["phone_number", "call_type", "recording_url", "agent", "start_time"]
