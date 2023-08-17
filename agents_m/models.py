from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
# Create your models here.
class Profile(models.Model):
    class Fields(models.TextChoices):
        SELL = 'sell', 'فروش'
        RENT = 'rent', 'اجاره'
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    phone_number = models.CharField(max_length=12)
    field = models.CharField(max_length=4, choices=Fields.choices, default=Fields.SELL)
    def __str__(self):
        return f'{self.first_name} with username: {self.user}'
    