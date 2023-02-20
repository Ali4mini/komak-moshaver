from django.contrib import admin
from .models import Sell, Rent

# Register your models here.

@admin.register(Sell)
class PostAdmin(admin.ModelAdmin):
    list_display = ['owner_name', 'm2', 'address', 'type', ]
    list_filter = ['m2', 'price', ]
    #search_fields = ['title', 'body']
    #prepopulated_fields = {'slug': ('title',)}
    #raw_id_fields = ['author']
    #date_hierarchy = 'publish'
    #ordering = ['status', 'publish']


@admin.register(Rent)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['owner_name', 'm2', 'address', 'type', ]
    list_filter = ['m2', 'price_up', 'price_rent',]