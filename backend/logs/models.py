from django.db import models
from file.models import Owner, Sell, Rent
from customer.models import BuyCustomer, RentCustomer

from django.conf import settings


# Create your models here.
class SellCall(models.Model):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی"

    owner = models.ForeignKey(Owner, on_delete=models.DO_NOTHING)
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

    owner = models.ForeignKey(Owner, on_delete=models.DO_NOTHING)
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
