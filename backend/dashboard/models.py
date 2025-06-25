# crm_backend/tasks_api/models.py
from django.db import models
from django.utils import timezone


class Task(models.Model):
    # user = models.ForeignKey(...) # REMOVED
    text = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

    class Meta:
        # Adjust ordering as needed now that 'user' is gone
        ordering = ["is_archived", "due_date", "completed", "-created_at"]
