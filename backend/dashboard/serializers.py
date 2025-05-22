# crm_backend/tasks_api/serializers.py
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'text', 'completed', 'due_date', 'is_archived', 'created_at', 'updated_at']
