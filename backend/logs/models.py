from django.db import models
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from django.conf import settings
from utils.models import Person
from django.conf import settings

class Call(models.Model):
    class CallType(models.TextChoices):
        INCOMING = "IN", "Incoming"
        OUTGOING = "OUT", "Outgoing"
        MISSED = "MISS", "Missed"
    
    class CallStatus(models.TextChoices):
        COMPLETED = "COMP", "Completed"
        FAILED = "FAIL", "Failed"
        NO_ANSWER = "NOANS", "No Answer"
        BUSY = "BUSY", "Busy"

    # Core Fields
    person = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='call_recordings'
    )
    phone_number = models.CharField(max_length=20, db_index=True)
    call_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    # Call Metadata
    call_type = models.CharField(
        max_length=4,
        choices=CallType.choices,
        default=CallType.INCOMING
    )
    call_status = models.CharField(
        max_length=5,
        choices=CallStatus.choices,
        default=CallStatus.COMPLETED
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.PositiveIntegerField(null=True, blank=True)  # in seconds
    location = models.JSONField(null=True, blank=True)
    
    # Recording File
    recording_file = models.FileField(
        upload_to='call_recordings/%Y/%m/%d/',
        blank=True,
        null=True
    )
    recording_url = models.URLField(
        'Recording URL',
        blank=True,
        null=True
    )
    recording_transcription = models.TextField(blank=True)

    is_transcript_correct = models.BooleanField(default=False) ## a field to tag the transcript if it is correct. this will be used later for fine tuning
    
    agent = models.ForeignKey(
        'auth.User',  
        on_delete=models.SET_NULL,
        verbose_name='Handling Agent',
        null=True,
        blank=True
    )
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['phone_number', 'start_time']),
            models.Index(fields=['person', 'start_time']),
        ]

    def __str__(self):
        return f"Call with {self.phone_number} at {self.start_time}"

    def save(self, *args, **kwargs):
        """Ensure required fields are populated before saving."""
        if not self.phone_number:
            if self.person:
                self.phone_number = self.person.phone_number
        
        if self.start_time and self.end_time and not self.duration:
            self.duration = (self.end_time - self.start_time).seconds
            
        super().save(*args, **kwargs)

# Create your models here.
class SellCall(models.Model):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی"

    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING)
    subject = models.CharField(max_length=2, choices=Subjects.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class RentCall(models.Model):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی"

    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING)
    subject = models.CharField(max_length=2, choices=Subjects.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class RentTour(models.Model):
    class Type(models.TextChoices):
        POST = "P", "پس"
        HAMRAH = "H", "همراه"

    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING)
    tour_type = models.CharField(max_length=2, choices=Type.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class SellTour(models.Model):
    class Type(models.TextChoices):
        POST = "P", "پس"
        HAMRAH = "H", "همراه"

    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING)
    tour_type = models.CharField(max_length=2, choices=Type.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class SMSLog(models.Model):
    task_id = models.CharField(max_length=255, unique=True)
    status = models.BooleanField()
    message = models.TextField()
    phone_number = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task {self.task_id}: {self.status}"

    def resend_sms(self):
        from file.tasks import resend_message

        resend_message.delay(self.phone_number, self.message)
