from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Agency(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=200)
    contact_info = models.CharField(max_length=100)

    def __str__(self) -> str:
        return str(self.name)


class Profile(models.Model):
    class Fields(models.TextChoices):
        SELL = "sell", "فروش"
        RENT = "rent", "اجاره"

    class Roles(models.TextChoices):
        MAIN_MANAGE = "main manager", "مدیر کل"
        RANGE_MANAGER = "range manager", "مدیر رنج"
        AGENT = "agent", "مشاور"

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    phone_number = models.CharField(max_length=12)
    agency = models.ForeignKey(
        Agency, on_delete=models.CASCADE, null=True, blank=True, related_name="agents"
    )
    role = models.CharField(choices=Roles.choices, default=Roles.AGENT)
    field = models.CharField(max_length=4, choices=Fields.choices, default=Fields.SELL)

    def __str__(self):
        return f"{self.first_name} with username: {self.user}"
