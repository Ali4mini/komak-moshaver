from django.db import models
from taggit.managers import TaggableManager
from django.urls import reverse
# Create your models here.

class Sell(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین'
        STORE = 'S', 'مغازه'
        HOUSE = 'H', 'خانه و ویلا'

    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField()
    price = models.IntegerField()
    year = models.IntegerField()
    floor = models.IntegerField()
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField(default=True)
    type = models.CharField(max_length=1, choices=Types.choices, default=Types.APARTEMANT)
    tags = TaggableManager(blank=True)

    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone}"
    
    def get_absolute_url(self):
        return reverse("file:sell_file_detail", args=[self.id])
    

class Rent(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین'
        STORE = 'S', 'مغازه'

    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField()
    price_up = models.IntegerField()
    price_rent = models.IntegerField()
    year = models.IntegerField()
    floor = models.IntegerField()
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField()
    type = models.CharField(max_length=1, choices=Types.choices, default=Types.APARTEMANT)
    tags = TaggableManager(blank=True)

    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone}"
    
    def get_absolute_url(self):
        return reverse("file:rent_file_detail", args=[self.id])

        