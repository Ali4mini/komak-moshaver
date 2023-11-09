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
    m2 = models.IntegerField(null=True)
    price = models.IntegerField()
    year = models.IntegerField(null=True)
    floor = models.IntegerField(null=True)
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
    takhlie = models.CharField(max_length=100, null=True)
    vahedha = models.IntegerField(null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True)
    tabaghat = models.IntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    notified_customers = models.ManyToManyField(BuyCustomer, blank=True, null=True)

    image1 = models.ImageField(upload_to="images/", blank=True)
    image2 = models.ImageField(upload_to="images/", blank=True)
    image3 = models.ImageField(upload_to="images/", blank=True)
    image4 = models.ImageField(upload_to="images/", blank=True)
    image5 = models.ImageField(upload_to="images/", blank=True)

    tag_manager = TaggableManager(blank=True)
    divar_token = models.CharField(max_length=8, blank=True, null=True)

    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone} address: {self.address}"

    def get_absolute_url(self):
        return reverse("file:sell_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_related_customers(self) -> BuyCustomer:
        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "budget__gte": self.price,
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
    m2 = models.IntegerField(null=True)
    price_up = models.IntegerField()
    price_rent = models.FloatField()
    year = models.IntegerField(null=True)
    floor = models.IntegerField(null=True)
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
    takhlie = models.CharField(max_length=100, null=True)
    vahedha = models.IntegerField(null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True)
    tabdil = models.IntegerField(default=None, null=True, blank=True)
    tabaghat = models.IntegerField(null=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    notified_customers = models.ManyToManyField(RentCustomer, null=True, blank=True)

    image1 = models.ImageField(upload_to="images/", blank=True)
    image2 = models.ImageField(upload_to="images/", blank=True)
    image3 = models.ImageField(upload_to="images/", blank=True)
    image4 = models.ImageField(upload_to="images/", blank=True)
    image5 = models.ImageField(upload_to="images/", blank=True)

    tags_manager = TaggableManager(blank=True)
    divar_token = models.CharField(max_length=8, blank=True, null=True)

    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone} address: {self.address}"

    def get_absolute_url(self):
        return reverse("file:rent_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_related_customers(self) -> RentCustomer:
        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "up_budget__gte": self.price_up,
            "rent_budget__gte": self.price_rent,
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


class SellImages(models.Model):
    post = models.ManyToManyField("Sell", verbose_name=("post"), related_name="Images")
    image = models.ImageField(upload_to="images", verbose_name="Image")


class RentImages(models.Model):
    post = models.ManyToManyField("Rent", verbose_name=("post"), related_name="Images")
    image = models.ImageField(upload_to="images", verbose_name="Image")
