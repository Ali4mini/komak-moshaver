from django.db import models

# Create your models here.
class BuyCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین'
        STORE = 'S', 'مغازه'

    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    type = models.CharField(choices=Types.choices, max_length=1, default=Types.APARTEMANT)
    budget = models.IntegerField()
    
    ### optional fields
    # parking = models.BooleanField(blank=True)
    # elevator = models.BooleanField(default=False)
    
    def __str__(self) -> str:
        return self.customer_name
    
class RentCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین'
        STORE = 'S', 'مغازه'
        
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    type = models.CharField(choices=Types.choices, max_length=1,default=Types.APARTEMANT)
    up_budget = models.IntegerField()
    rent_budget = models.IntegerField()
    ### optional fields
    # parking = models.BooleanField(blank=True)
    # elevator = models.BooleanField(blank=True)
    
    def __str__(self) -> str:
        return self.customer_name