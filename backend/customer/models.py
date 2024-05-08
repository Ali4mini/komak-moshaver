from django.db import models
from django.conf import settings
from django.urls import reverse

# Create your models here.

class BuyCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین و کلنگی'
        STORE = 'S', 'مغازه و غرفه'
        VILA = 'H', 'خانه و ویلا'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'پیدا نکرده'
        UNACTIVE = 'UNACTIVE', 'پیدا کرد'
        CANCELED = 'CANCELED', 'منصرف شد'

    class Meta:
        ordering = ['-created']
        
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    property_type = models.CharField(choices=Types.choices, max_length=1, default=Types.APARTEMANT)
    budget = models.IntegerField()
    m2 = models.IntegerField(null=True)
    year = models.IntegerField(null=True)
    bedroom = models.IntegerField(null=True)
    vahedha = models.IntegerField(null=True)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 verbose_name=("added to site by "),
                                 on_delete=models.DO_NOTHING,
                                 blank=False,
                                 default=1
                                 )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    parking = models.BooleanField(blank=True)
    elevator = models.BooleanField(default=False)
    storage = models.BooleanField(default=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)

    
    def __str__(self) -> str:
        return self.customer_name

    def get_absolute_url(self):
        return reverse("customer:buy_customer_detail", args=[self.id])

    def get_related_files(self):
        from file.models import Sell

        budget_range = (0, 0) # Default value, adjust as necessary
        if self.budget <= 3000:
            budget_range = (int(self.budget * 0.80), int(self.budget * 1.20))
        elif self.budget > 3000 and self.budget < 5000:
            budget_range = (int(self.budget * 0.85), int(self.budget * 1.15))
        elif self.budget > 5000:
            budget_range = (int(self.budget * 0.90), int(self.budget * 1.10))
    

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "price__gte": budget_range[0],
            "price__lte": budget_range[1],
            # "m2__lte": self.m2,
            # "bedroom__lte": self.bedroom,
            # "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }


        all_files = Sell.objects.filter(**filter_query)

        notified_files = []
        unnotified_files = []
        for file in all_files:
            if self.id in file.notified_customers.values_list("id", flat=True):
                notified_files.append(file)
            else:
                unnotified_files.append(file)

        return unnotified_files



class RentCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین و کلنگی'
        STORE = 'S', 'مغازه و غرفه'
        VILA = 'H', 'خانه و ویلا'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'پیدا نکرده'
        UNACTIVE = 'UNACTIVE', 'پیدا کرد'
        CANCELED = 'CANCELED', 'منصرف شد'

    class Meta:
        ordering = ['-created']

    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    property_type = models.CharField(choices=Types.choices, max_length=1,default=Types.APARTEMANT)
    up_budget = models.IntegerField()
    rent_budget = models.FloatField()
    m2 = models.IntegerField(null=True)
    year = models.IntegerField(null=True)
    bedroom = models.IntegerField(null=True)
    vahedha = models.IntegerField(null=True)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 verbose_name=("added to site by "),
                                 on_delete=models.DO_NOTHING,
                                 blank=False,
                                 default=1
                                 )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    parking = models.BooleanField(blank=True)
    elevator = models.BooleanField(default=False)
    storage = models.BooleanField(default=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)

    
    def __str__(self) -> str:
        return self.customer_name

    def get_absolute_url(self):
        return reverse("customer:rent_customer_detail", args=[self.id])

    def get_related_files(self):
        from file.models import Rent

        budget_up_range = (0, 0) # Default value, adjust as necessary
        budget_rent_range = (0, 0) # Default value, adjust as necessary
        if self.up_budget <= 300:
            budget_up_range = (int(self.up_budget * 0.80), int(self.up_budget * 1.20))
        elif self.up_budget > 300 and self.up_budget < 700:
            budget_up_range = (int(self.up_budget * 0.85), int(self.up_budget * 1.15))
        elif self.up_budget > 700:
            budget_up_range = (int(self.up_budget * 0.90), int(self.up_budget * 1.10))

        if self.rent_budget <= 3:
            budget_rent_range = (
                int(self.rent_budget * 0.70),
                int(self.rent_budget * 1.30),
            )
        elif self.rent_budget > 3 and self.rent_budget < 7:
            budget_rent_range = (
                int(self.rent_budget * 0.80),
                int(self.rent_budget * 1.20),
            )
        elif self.rent_budget > 7:
            budget_rent_range = (
                int(self.rent_budget * 0.85),
                int(self.rent_budget * 1.15),
            )
    

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "price_up__gte": budget_up_range[0],
            "price_up__lte": budget_up_range[1],
            "price_rent__gte": budget_rent_range[0],
            "price_rent__lte": budget_rent_range[1],
            # "m2__lte": self.m2,
            # "bedroom__lte": self.bedroom,
            # "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }


        all_files = Rent.objects.filter(**filter_query)

        notified_files = []
        unnotified_files = []
        for file in all_files:
            if self.id in file.notified_customers.values_list("id", flat=True):
                notified_files.append(file)
            else:
                unnotified_files.append(file)

        return unnotified_files
    
class BuyComment(models.Model):
    file = models.ForeignKey("BuyCustomer",
                             verbose_name=("file"),
                             on_delete=models.CASCADE,
                             related_name='buy_customer_comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             verbose_name=("user's profile"),
                             on_delete=models.CASCADE,
                             related_name='buy_customer_comments')
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = ("Comment")
        verbose_name_plural = ("Comments")

    def __str__(self):
        return f'comment by {self.user} on {self.file}'

    def get_absolute_url(self):
        return reverse("sell_comment", kwargs={"pk": self.pk})
        
class RentComment(models.Model):
    file = models.ForeignKey("RentCustomer",
                             on_delete=models.CASCADE,
                             related_name='rent_customer_comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             verbose_name=("user's profile"),
                             on_delete=models.CASCADE,
                             related_name='rent_customer_comments')
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = ("Comment")
        verbose_name_plural = ("Comments")

    def __str__(self):
        return f'comment by {self.user} on {self.file}'

    def get_absolute_url(self):
        return reverse("sell_comment", kwargs={"pk": self.pk})
