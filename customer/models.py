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
    class Meta:
        ordering = ['-created']
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    type = models.CharField(choices=Types.choices, max_length=1, default=Types.APARTEMANT)
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
    
    def __str__(self) -> str:
        return self.customer_name
    def get_absolute_url(self):
        return reverse("customer:buy_customer_detail", args=[self.id])
    
class RentCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین و کلنگی'
        STORE = 'S', 'مغازه و غرفه'
        VILA = 'H', 'خانه و ویلا'

    class Meta:
        ordering = ['-created']

    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=12)
    type = models.CharField(choices=Types.choices, max_length=1,default=Types.APARTEMANT)
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
    
    def __str__(self) -> str:
        return self.customer_name

    def get_absolute_url(self):
        return reverse("customer:rent_customer_detail", args=[self.id])
    
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