from typing import List
from django.core.files.base import ContentFile
from django.db import models
from django.urls import reverse
from django.conf import settings
from customer.models import BuyCustomer, RentCustomer
from celery.result import AsyncResult

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
    updated = models.DateTimeField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    lobbyMan_name = models.CharField(max_length=100, null=True, blank=True)
    lobbyMan_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    description = models.CharField(max_length=1000, blank=True, null=True)
    notified_customers = models.ManyToManyField(BuyCustomer, blank=True)

    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return f"code: {self.id} owner: {self.owner_name} "

    def get_absolute_url(self):
        return reverse("file:sell_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_file_type(self) -> str:
        return "sell"

    def get_related_customers(self) -> List[BuyCustomer]:
        budget_range = (int(self.price * 0.75), int(self.price * 1.25))

        # Function to remove keys with None values
        def remove_none_values(query):
            return {key: value for key, value in query.items() if value is not None}

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

        filter_query = remove_none_values(filter_query)
        all_customers = BuyCustomer.objects.filter(**filter_query)
        if self.notified_customers is not None:
            notified_customer_ids = self.notified_customers.values_list("id", flat=True)
            unnotified_customers = all_customers.exclude(id__in=notified_customer_ids)
            return unnotified_customers

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        from .tasks import send_message

        super().save(force_insert, force_update, using, update_fields)
        related_customers: List[BuyCustomer] = self.get_related_customers()

        # sending sms for related_customers
        if related_customers:
            for customer in related_customers:
                send_message.delay(customer.customer_phone, self)
                print(f"send message for {customer.customer_phone}")
        else:
            print("related_customers in None")

        return


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
    updated = models.DateTimeField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    bedroom = models.IntegerField(blank=True, null=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True, blank=True)
    vahedha = models.IntegerField(blank=True, null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True, blank=True)
    tabdil = models.IntegerField(default=None, null=True, blank=True)
    tabaghat = models.IntegerField(null=True, blank=True)
    tenet_name = models.CharField(max_length=100, null=True, blank=True)
    tenet_phone = models.CharField(max_length=12, null=True, blank=True)
    lobbyMan_name = models.CharField(max_length=100, null=True, blank=True)
    lobbyMan_phone = models.CharField(max_length=12, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    description = models.CharField(max_length=1000, blank=True, null=True)
    notified_customers = models.ManyToManyField(RentCustomer, blank=True)

    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return f"code: {self.id} owner: {self.owner_name} "

    def get_absolute_url(self):
        return reverse("file:rent_file_detail", args=[self.id])

    def get_file_type(self) -> str:
        return "rent"

    def get_pk(self) -> int:
        return self.pk

    def get_related_customers(self) -> List[RentCustomer]:
        budget_up_range = (
            int(self.price_up * 0.75),
            int(self.price_up * 1.25),
        )
        budget_rent_range = (
            int(self.price_rent * 0.75),
            int(self.price_rent * 1.25),
        )

        # Function to remove keys with None values
        def remove_none_values(query):
            return {key: value for key, value in query.items() if value is not None}

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

        filter_query = remove_none_values(filter_query)

        all_customers = RentCustomer.objects.filter(**filter_query)

        if self.notified_customers is None:
            return all_customers

        notified_customer_ids = self.notified_customers.values_list("id", flat=True)
        unnotified_customers = all_customers.exclude(id__in=notified_customer_ids)
        return unnotified_customers

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        from .tasks import send_message

        super().save(force_insert, force_update, using, update_fields)

        # sending message to related_customers
        related_customers: List[RentCustomer] = self.get_related_customers()
        if related_customers:
            for customer in related_customers:
                send_message.delay(customer.customer_phone, self)
                print(f"send message for {customer.customer_phone}")
        else:
            print("related_customers in None")


class SellImage(models.Model):
    file = models.ForeignKey(Sell, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="files")


class RentImage(models.Model):
    file = models.ForeignKey(Rent, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="files", null=True)


class SellStaticLocation(models.Model):
    file = models.OneToOneField(Sell, on_delete=models.CASCADE, related_name="location")
    # TODO: give structured data type for the location (custom model field or a unified json)
    location = models.JSONField(null=True)
    image = models.ImageField(upload_to="location-sell", null=True)

    def save(self, *args, **kwargs):
        from .tasks import download_static_location, geocoding

        location_file_name = f"sell/{self.file}.png"

        lat: float = 0
        lon: float = 0

        # Check if location data is provided
        if (
            self.location
            and self.location.get("latitude")
            and self.location.get("longitude")
        ):
            lat = self.location["latitude"]
            lon = self.location["longitude"]
        else:
            task_id = geocoding.delay(self.file.address)
            # NOTE: this part should move to the download_static_location task to be non-blocking
            location = AsyncResult.get(task_id)
            lat = location.get("x")
            lon = location.get("y")
            self.location = {"latitude": lat, "longitude": lon}

        task_id = download_static_location.delay(lat, lon)

        static_location_buffer = AsyncResult.get(task_id)
        static_location_image = ContentFile(static_location_buffer, location_file_name)
        self.image = static_location_image

        super().save(*args, **kwargs)


class RentStaticLocation(models.Model):
    file = models.OneToOneField(Rent, on_delete=models.CASCADE, related_name="location")
    location = models.JSONField(null=True)
    image = models.ImageField(upload_to="locations-rent", null=True)

    def save(self, *args, **kwargs):
        from .tasks import download_static_location, geocoding

        location_file_name = f"rent/{self.file}.png"

        lat: float = 0
        lon: float = 0

        # Check if location data is provided
        if (
            self.location
            and self.location.get("latitude")
            and self.location.get("longitude")
        ):
            lat = self.location["latitude"]
            lon = self.location["longitude"]
        else:
            task_id = geocoding.delay(self.file.address)
            # NOTE: this part should move to the download_static_location task to be non-blocking
            location = AsyncResult.get(task_id)
            lat = location.get("x")
            lon = location.get("y")
            self.location = {"latitude": lat, "longitude": lon}

        task_id = download_static_location.delay(lat, lon)

        static_location_buffer = AsyncResult.get(task_id)
        static_location_image = ContentFile(static_location_buffer, location_file_name)
        self.image = static_location_image

        super().save(*args, **kwargs)
