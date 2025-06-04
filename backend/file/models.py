from typing import List, Tuple, Type, TypeVar
from django.core.files.base import ContentFile
from django.db import models
from django.urls import reverse
from django.conf import settings
from customer.models import BuyCustomer, RentCustomer
from celery.result import AsyncResult
from utils.models import Person

# Create your models here.

class PropertyBase(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "مغازه و غرفه"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "فعال"
        OLD = "OLD", "قدیمی"
        UNACTIVE = "UNACTIVE", "غیرفعال"
        CANCELED = "CANCELED", "لغو شده"

    class Meta:
        abstract = True
        ordering = ["-created"]

    # Common Fields
    owner = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        verbose_name="Owner Person",
        related_name="%(class)s_owned_properties"
    )
    address = models.TextField()
    m2 = models.IntegerField(null=True, blank=True)
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
        verbose_name="added to site by",
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    bedroom = models.IntegerField(null=True, blank=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True, blank=True)
    vahedha = models.IntegerField(blank=True, null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True, blank=True)
    tabaghat = models.IntegerField(null=True, blank=True)
    tenant = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        verbose_name="tenant Person",
        related_name="%(class)s_tenant_for"
    )
    lobbyMan = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        verbose_name="lobby man Person",
        related_name="%(class)s_lobbyMan_for"
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    description = models.CharField(max_length=1000, blank=True, null=True)
    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return f"code: {self.id} owner: {self.owner}"

    def get_absolute_url(self):
        return reverse(f"file:{self.get_file_type()}_file_detail", args=[self.id])

    def get_pk(self) -> int:
        return self.pk

    def get_file_type(self) -> str:
        raise NotImplementedError("Subclasses must implement this method")

    def get_related_customers(self):
        raise NotImplementedError("Subclasses must implement this method")

    def save(self, *args, **kwargs):
        raise NotImplementedError("Subclasses must implement this method")


class Sell(PropertyBase):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "برای فروش"
        UNACTIVE = "UNACTIVE", "فروخته شد"
        CANCELED = "CANCELED", "برای فروش نیست"

    price = models.IntegerField()
    notified_customers = models.ManyToManyField(BuyCustomer, blank=True)

    def get_file_type(self) -> str:
        return "sell"

    def get_related_customers(self) -> List[BuyCustomer]:
        budget_range = (int(self.price * 0.75), int(self.price * 1.25))
        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "budget__gte": budget_range[0],
            "budget__lte": budget_range[1],
        }
        # Remove None values
        filter_query = {k: v for k, v in filter_query.items() if v is not None}
        all_customers = BuyCustomer.objects.filter(**filter_query)
        
        if self.notified_customers.exists():
            notified_ids = self.notified_customers.values_list("id", flat=True)
            return all_customers.exclude(id__in=notified_ids)
        return all_customers

    def save(self, *args, **kwargs):
        from .tasks import send_message
        super().save(*args, **kwargs)
        customers = self.get_related_customers()
        if customers:
            for customer in customers:
                send_message.delay(customer.phone_number, self)
                print(f"Sent message to {customer.phone_number}")


class Rent(PropertyBase):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "برای اجاره"
        UNACTIVE = "UNACTIVE", "اجاره داده شد"
        CANCELED = "CANCELED", "برای اجاره نیست"

    price_up = models.IntegerField()
    price_rent = models.FloatField()
    tabdil = models.IntegerField(null=True, blank=True)
    notified_customers = models.ManyToManyField(RentCustomer, blank=True)

    def get_file_type(self) -> str:
        return "rent"

    def get_related_customers(self) -> List[RentCustomer]:
        budget_up_range = (int(self.price_up * 0.75), int(self.price_up * 1.25))
        budget_rent_range = (int(self.price_rent * 0.75), int(self.price_rent * 1.25))
        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "up_budget__gte": budget_up_range[0],
            "up_budget__lte": budget_up_range[1],
            "rent_budget__gte": budget_rent_range[0],
            "rent_budget__lte": budget_rent_range[1],
        }
        # Remove None values
        filter_query = {k: v for k, v in filter_query.items() if v is not None}
        all_customers = RentCustomer.objects.filter(**filter_query)
        
        if self.notified_customers.exists():
            notified_ids = self.notified_customers.values_list("id", flat=True)
            return all_customers.exclude(id__in=notified_ids)
        return all_customers

    def save(self, *args, **kwargs):
        from .tasks import send_message
        super().save(*args, **kwargs)
        customers = self.get_related_customers()
        if customers:
            for customer in customers:
                send_message.delay(customer.customer_phone, self)
                print(f"Sent message to {customer.customer_phone}")


class PropertyImageBase(models.Model):
    image = models.ImageField(upload_to="files", null=True)
    
    class Meta:
        abstract = True

    def __str__(self):
        return f"Image for {self.file.id}"


class SellImage(PropertyImageBase):
    file = models.ForeignKey(Sell, on_delete=models.CASCADE, related_name="images")


class RentImage(PropertyImageBase):
    file = models.ForeignKey(Rent, on_delete=models.CASCADE, related_name="images")


class PropertyStaticLocationBase(models.Model):
    location = models.JSONField(null=True)
    image = models.ImageField(upload_to=None, null=True)  # To be defined in subclasses
    
    class Meta:
        abstract = True

    def _process_location(self, address: str, folder_name: str):
        from .tasks import download_static_location, geocoding
        
        if self.location and self.location.get("latitude") and self.location.get("longitude"):
            lat = self.location["latitude"]
            lon = self.location["longitude"]
        else:
            task_id = geocoding.delay(address)
            location = AsyncResult.get(task_id)
            lat = location.get("x")
            lon = location.get("y")
            self.location = {"latitude": lat, "longitude": lon}
        
        task_id = download_static_location.delay(lat, lon)
        static_location_buffer = AsyncResult.get(task_id)
        file_name = f"{folder_name}/{self.file}.png"
        return ContentFile(static_location_buffer, file_name)

    def save(self, *args, **kwargs):
        raise NotImplementedError("Subclasses must implement this method")


class SellStaticLocation(PropertyStaticLocationBase):
    file = models.OneToOneField(Sell, on_delete=models.CASCADE, related_name="location")
    image = models.ImageField(upload_to="location-sell", null=True)

    def save(self, *args, **kwargs):
        if not self.image or not self.location:
            self.image = self._process_location(self.file.address, "sell")
        super().save(*args, **kwargs)


class RentStaticLocation(PropertyStaticLocationBase):
    file = models.OneToOneField(Rent, on_delete=models.CASCADE, related_name="location")
    image = models.ImageField(upload_to="locations-rent", null=True)

    def save(self, *args, **kwargs):
        if not self.image or not self.location:
            self.image = self._process_location(self.file.address, "rent")
        super().save(*args, **kwargs)
