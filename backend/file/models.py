from enum import unique
from django.db import models
from taggit.managers import TaggableManager
from django.urls import reverse
from agents_m.models import Profile
from django.conf import settings
from customer.models import BuyCustomer, RentCustomer
from django.contrib.postgres.fields import ArrayField

# Create your models here.


class Sell(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "مغازه و غرفه"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "برای فروش"
        UNACTIVE = "UNACTIVE", "فروخته شد"
        CANCELED = "CANCELED", "برای فروش نیست"

    class Meta:
        ordering = ["-created"]

    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField(null=True, blank=True)
    price = models.IntegerField()
    year = models.IntegerField(null=True, blank=True)
    floor = models.IntegerField(null=True, blank=True)
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField(default=True)
    property_type = models.CharField(
        max_length=1, choices=Types.choices, default=Types.APARTEMANT
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    bedroom = models.IntegerField(blank=True, null=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True, blank=True)
    vahedha = models.IntegerField(null=True, blank=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True, blank=True)
    tabaghat = models.IntegerField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    description = models.CharField(max_length=1000, blank=True, null=True)
    notified_customers = models.ManyToManyField(BuyCustomer, blank=True)

    tag_manager = TaggableManager(blank=True)
    divar_token = models.CharField(max_length=8, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return f"code: {self.id} owner: {self.owner_name} "

    def get_absolute_url(self):
        return reverse("file:sell_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_related_customers(self) -> BuyCustomer:

        budget_range = (0, 0) # Default value, adjust as necessary
        if self.price <= 3000:
            budget_range = (int(self.price * 0.80), int(self.price * 1.20))
        elif self.price > 3000 and self.price < 5000:
            budget_range = (int(self.price * 0.85), int(self.price * 1.15))
        elif self.price > 5000:
            budget_range = (int(self.price * 0.90), int(self.price * 1.10))

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "budget__gte": budget_range[0],
            "budget__lte": budget_range[1],
            # "m2__lte": self.m2,
            # "bedroom__lte": self.bedroom,
            # "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }
        all_customers = BuyCustomer.objects.filter(**filter_query)
        if self.notified_customers is not None:
            notified_customer_ids = self.notified_customers.values_list("id", flat=True)
            unnotified_customers = all_customers.exclude(id__in=notified_customer_ids)
            return unnotified_customers


class Rent(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "اداری و تجاری"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "برای اجاره"
        UNACTIVE = "UNACTIVE", "اجاره داده شد"
        CANCELED = "CANCELED", "برای اجاره نیست"

    class Meta:
        ordering = ["-created"]

    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField(null=True, blank=True)
    price_up = models.IntegerField()
    price_rent = models.FloatField()
    year = models.IntegerField(null=True, blank=True)
    floor = models.IntegerField(null=True, blank=True)
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField()
    property_type = models.CharField(
        max_length=1, choices=Types.choices, default=Types.APARTEMANT
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    bedroom = models.IntegerField(blank=True, null=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True, blank=True)
    vahedha = models.IntegerField(blank=True, null=True )
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True, blank=True)
    tabdil = models.IntegerField(default=None, null=True, blank=True)
    tabaghat = models.IntegerField(null=True, blank=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    description = models.CharField(max_length=1000, blank=True, null=True)
    notified_customers = models.ManyToManyField(RentCustomer, blank=True)

    tags_manager = TaggableManager(blank=True)
    divar_token = models.CharField(max_length=8, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return f"code: {self.id} owner: {self.owner_name} "

    def get_absolute_url(self):
        return reverse("file:rent_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_related_customers(self) -> RentCustomer:
        if self.price_up <= 300:
            budget_up_range = (int(self.price_up * 0.80), int(self.price_up * 1.20))
        elif self.price_up > 300 and self.price_up < 700:
            budget_up_range = (int(self.price_up * 0.85), int(self.price_up * 1.15))
        elif self.price_up > 700:
            budget_up_range = (int(self.price_up * 0.90), int(self.price_up * 1.10))

        if self.price_rent <= 3:
            budget_rent_range = (
                int(self.price_rent * 0.70),
                int(self.price_rent * 1.30),
            )
        elif self.price_rent > 3 and self.price_rent < 7:
            budget_rent_range = (
                int(self.price_rent * 0.80),
                int(self.price_rent * 1.20),
            )
        elif self.price_rent > 7:
            budget_rent_range = (
                int(self.price_rent * 0.85),
                int(self.price_rent * 1.15),
            )

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "up_budget__gte": budget_up_range[0],
            "up_budget__lte": budget_up_range[1],
            "rent_budget__gte": budget_rent_range[0],
            "rent_budget__lte": budget_rent_range[1],
            # "m2__lte": self.m2,
            # "bedroom__lte": self.bedroom,
            # "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }
        all_customers = RentCustomer.objects.filter(**filter_query)
        if self.notified_customers is not None:
            notified_customer_ids = self.notified_customers.values_list("id", flat=True)
            unnotified_customers = all_customers.exclude(id__in=notified_customer_ids)
            return unnotified_customers


class SellComment(models.Model):
    file = models.ForeignKey(
        "Sell",
        verbose_name=("file"),
        on_delete=models.CASCADE,
        related_name="sell_comments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("user's profile"),
        on_delete=models.CASCADE,
        related_name="sell_comments",
    )
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"comment by {self.user} on {self.file}"

    def get_absolute_url(self):
        return reverse("sell_comment", kwargs={"pk": self.pk})

    def get_pk(self) -> int:
        return self.pk


class RentComment(models.Model):
    file = models.ForeignKey(
        "Rent", on_delete=models.CASCADE, related_name="rent_comments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("user's profile"),
        on_delete=models.CASCADE,
        related_name="rent_comments",
    )
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"comment by {self.user} on {self.file}"

    def get_absolute_url(self):
        return reverse("rent_comment", kwargs={"pk": self.pk})

    def get_pk(self) -> int:
        return self.pk


class SellImage(models.Model):
    file = models.ForeignKey(Sell, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="files")


class RentImage(models.Model):
    file = models.ForeignKey(Rent, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="files")
