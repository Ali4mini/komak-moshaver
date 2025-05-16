from django.db import models
from django.conf import settings
from django.urls import reverse
from utils.models import Person
# Create your models here.


class BuyCustomer(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "مغازه و غرفه"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "پیدا نکرده"
        UNACTIVE = "UNACTIVE", "پیدا کرد"
        CANCELED = "CANCELED", "منصرف شد"

    class Meta:
        ordering = ["-date"]


    # New ForeignKey
    customer = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,  # Allow null during migration
        blank=True,
        verbose_name="Customer Person"
    )
    property_type = models.CharField(
        choices=Types.choices, max_length=1, default=Types.APARTEMANT
    )
    budget = models.IntegerField()
    m2 = models.IntegerField(null=True)
    year = models.IntegerField(null=True)
    bedroom = models.IntegerField(null=True)
    vahedha = models.IntegerField(null=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
        default=1,
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(null=True, blank=True)
    date = models.DateField(blank=True, null=True)
    parking = models.BooleanField(blank=True)
    elevator = models.BooleanField(default=False)
    storage = models.BooleanField(default=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )

    # notified_customers = models.ManyToManyField(Sell, blank=True)
    parking_motor = models.BooleanField(default=False)
    description = models.CharField(max_length=1000, blank=True, null=True)
    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return str(self.customer)

    def get_absolute_url(self):
        return reverse("customer:buy_customer_detail", args=[self.id])

    def get_related_files(self):
        from file.models import Sell

        budget_range = (int(self.budget * 0.75), int(self.budget * 1.25))

        # Function to remove keys with None values
        def remove_none_values(query):
            return {key: value for key, value in query.items() if value is not None}

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "price__gte": budget_range[0],
            "price__lte": budget_range[1],
            "m2__gte": self.m2,
            "bedroom__gte": self.bedroom,
            "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }

        filter_query = remove_none_values(filter_query)

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
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "مغازه و غرفه"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "پیدا نکرده"
        UNACTIVE = "UNACTIVE", "پیدا کرد"
        CANCELED = "CANCELED", "منصرف شد"

    class Meta:
        ordering = ["-date"]


    # New ForeignKey
    customer = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,  # Allow null during migration
        blank=True,
        verbose_name="Customer Person"
    )
    property_type = models.CharField(
        choices=Types.choices, max_length=1, default=Types.APARTEMANT
    )
    up_budget = models.IntegerField()
    rent_budget = models.FloatField()
    m2 = models.IntegerField(null=True)
    year = models.IntegerField(null=True)
    bedroom = models.IntegerField(null=True)
    vahedha = models.IntegerField(null=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
        default=1,
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    parking = models.BooleanField(blank=True)
    elevator = models.BooleanField(default=False)
    storage = models.BooleanField(default=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )

    # notified_customers = models.ManyToManyField(Rent, blank=True)
    parking_motor = models.BooleanField(default=False)
    description = models.CharField(max_length=1000, blank=True, null=True)
    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self) -> str:
        return str(self.customer)

    def get_absolute_url(self):
        return reverse("customer:rent_customer_detail", args=[self.id])

    def get_related_files(self):
        from file.models import Rent

        budget_up_range = (int(self.up_budget * 0.75), int(self.up_budget * 1.25))
        budget_rent_range = (int(self.rent_budget * 0.75), int(self.rent_budget * 1.25))

        # Function to remove keys with None values
        def remove_none_values(query):
            return {key: value for key, value in query.items() if value is not None}

        filter_query = {
            "status": "ACTIVE",
            "property_type": self.property_type,
            "price_up__gte": budget_up_range[0],
            "price_up__lte": budget_up_range[1],
            "price_rent__gte": budget_rent_range[0],
            "price_rent__lte": budget_rent_range[1],
            "m2__gte": self.m2,
            "bedroom__gte": self.bedroom,
            "year__lte": self.year,
            # 'parking': self.parking,
            # 'elevator': self.elevator,
            # 'storage': self.storage,
        }
        filter_query = remove_none_values(filter_query)

        all_files = Rent.objects.filter(**filter_query)

        notified_files = []
        unnotified_files = []
        for file in all_files:
            if self.id in file.notified_customers.values_list("id", flat=True):
                notified_files.append(file)
            else:
                unnotified_files.append(file)

        return unnotified_files
