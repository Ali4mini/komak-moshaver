from django.contrib import admin
from .models import Sell, Rent, SellComment, RentComment

# Register your models here.

@admin.register(Sell)
class SellAdmin(admin.ModelAdmin):
    list_display = ['owner_name', 'm2', 'address', 'type', ]
    list_filter = ['m2', 'price', ]
    #search_fields = ['title', 'body']
    #prepopulated_fields = {'slug': ('title',)}
    #raw_id_fields = ['author']
    #date_hierarchy = 'publish'
    #ordering = ['status', 'publish']


@admin.register(Rent)
class RentAdmin(admin.ModelAdmin):
    list_display = ['owner_name', 'm2', 'address', 'type', ]
    list_filter = ['m2', 'price_up', 'price_rent',]
    
@admin.register(SellComment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['file', 'body', 'created', 'active']
    
@admin.register(RentComment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['file', 'body', 'created', 'active']