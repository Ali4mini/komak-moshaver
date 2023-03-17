from django.contrib import admin
from .models import Profile
# Register your models here.
@admin.register(Profile)
class RentAdmin(admin.ModelAdmin):
    list_display = ['last_name', 'phone_number',]
    