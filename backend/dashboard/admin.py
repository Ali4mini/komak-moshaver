from django.contrib import admin

from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('text', 'completed', 'created_at', 'updated_at') # Add 'user' if using it
    list_filter = ('completed', 'created_at')
    search_fields = ('text',) 
