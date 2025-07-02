from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Task(models.Model):
    # user = models.ForeignKey(...) # REMOVED
    text = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- NEW: Generic Foreign Key for linking to any object ---
    # This stores the type of model we're linking to (e.g., 'Sell', 'Rent')
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    # This stores the ID of the specific object we're linking to
    object_id = models.PositiveIntegerField(null=True, blank=True)
    # This provides a convenient way to access the related object directly
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return self.text

    class Meta:
        ordering = ["is_archived", "completed", "due_date", "-created_at"]
