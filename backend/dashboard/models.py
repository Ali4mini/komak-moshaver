from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils import timezone


class Task(models.Model):
    text = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # This stores the type of model we're linking to (e.g., 'Sell', 'Rent')
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    # This stores the ID of the specific object we're linking to
    object_id = models.PositiveIntegerField(null=True, blank=True)
    # This provides a convenient way to access the related object directly
    content_object = GenericForeignKey("content_type", "object_id")

    def save(self, *args, **kwargs):
        """
        Custom save method to set due_date to today if it's None.
        """
        # Check if the due_date is not set
        if self.due_date is None:
            # Set it to the current date
            self.due_date = timezone.now().date()

        # Call the original save() method
        super().save(*args, **kwargs)

    def __str__(self):
        return self.text

    class Meta:
        ordering = ["is_archived", "completed", "due_date", "-created_at"]
