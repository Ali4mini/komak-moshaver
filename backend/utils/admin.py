from django.contrib import admin
from utils.models import Person

# Register your models here.
@admin.register(Person)
class SellAdmin(admin.ModelAdmin):
    list_display = ['first_name','last_name', 'gender', 'phone_number', 'last_contact', ]
