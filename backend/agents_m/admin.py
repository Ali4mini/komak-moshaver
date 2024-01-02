from django.contrib import admin
from .models import Profile, Agency


# Register your models here.
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "first_name", "last_name", "phone_number", "field"]


@admin.register(Agency)
class AgencieAdmin(admin.ModelAdmin):
    list_display = ["name", "address"]
