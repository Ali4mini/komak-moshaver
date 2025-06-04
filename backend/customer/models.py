from django.db import models
from django.conf import settings
from django.urls import reverse
from utils.models import Person
# from file.models import Sell, Rent # Will be imported locally in methods

# Create your models here.

class BaseCustomerRequest(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = "A", "آپارتمان"
        LAND = "L", "زمین و کلنگی"
        STORE = "S", "مغازه و غرفه"
        VILA = "H", "خانه و ویلا"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "در جستجو" # Changed Farsi label to be more generic for "looking"
        UNACTIVE = "UNACTIVE", "یافت شد" # Changed Farsi label
        CANCELED = "CANCELED", "منصرف شد"

    # customer ForeignKey will be defined in concrete classes for specific related_name
    property_type = models.CharField(
        choices=Types.choices, max_length=1, default=Types.APARTEMANT, verbose_name="نوع ملک مورد نظر"
    )
    m2 = models.IntegerField(null=True, blank=True, verbose_name="متراژ مورد نظر (حداقل)")
    year = models.IntegerField(null=True, blank=True, verbose_name="حداکثر سال ساخت") # Assuming customer wants newer
    bedroom = models.IntegerField(null=True, blank=True, verbose_name="تعداد خواب مورد نظر (حداقل)")
    vahedha = models.IntegerField(null=True, blank=True, verbose_name="حداکثر تعداد واحدها در ساختمان")
    
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ثبت شده توسط",
        on_delete=models.DO_NOTHING,
        blank=False,
        default=1, # Kept as per original, but review if this default is appropriate
    )
    created = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت درخواست")
    updated = models.DateTimeField(null=True, blank=True, auto_now=True, verbose_name="تاریخ بروزرسانی")
    date = models.DateField(blank=True, null=True, verbose_name="تاریخ درخواست") # Consider auto_now_add or default
    
    parking = models.BooleanField(blank=True, null=True, verbose_name="نیاز به پارکینگ") # Made nullable for tri-state
    elevator = models.BooleanField(default=False, verbose_name="نیاز به آسانسور")
    storage = models.BooleanField(default=True, verbose_name="نیاز به انباری")
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE, verbose_name="وضعیت درخواست"
    )
    parking_motor = models.BooleanField(default=False, verbose_name="نیاز به پارکینگ موتور")
    description = models.CharField(max_length=1000, blank=True, null=True, verbose_name="توضیحات مشتری")
    source_id = models.CharField(max_length=100, blank=True, null=True, unique=True, verbose_name="شناسه منبع")

    class Meta:
        abstract = True
        ordering = ["-date"]

    def __str__(self) -> str:
        if self.customer:
            return f"درخواست {self.get_property_type_display()} توسط {self.customer}"
        return f"درخواست {self.get_property_type_display()} (مشتری نامشخص)"

    def _remove_none_values(self, query_dict: dict) -> dict:
        return {key: value for key, value in query_dict.items() if value is not None}

    # --- Abstract methods or methods to be overridden by concrete classes ---
        
    def get_customer_person(self):
        """Helper to access the customer Person instance, as the FK field name might vary."""
        return self.customer # Assumes the FK in concrete class is named 'customer'

    def get_related_files(self):
        TargetFileModel = self._get_target_file_model()
        
        file_attribute_filters = {}
        if self.m2 is not None:
            file_attribute_filters["m2__gte"] = self.m2
        if self.bedroom is not None:
            file_attribute_filters["bedroom__gte"] = self.bedroom
        if self.year is not None: # Customer wants properties with year <= self.year (newer or same age)
            file_attribute_filters["year__lte"] = self.year
        if self.vahedha is not None: # Customer wants buildings with units <= self.vahedha
             file_attribute_filters["vahedha__lte"] = self.vahedha

        # For boolean preferences, only filter if the customer explicitly requires it (True)
        # If parking is True, look for files with parking=True. If False or None, don't filter on parking.
        if self.parking is True:
            file_attribute_filters["parking"] = True
        if self.elevator is True:
            file_attribute_filters["elevator"] = True
        if self.storage is True: # default is True, so this would mean they *require* storage
            file_attribute_filters["storage"] = True
        if self.parking_motor is True:
            file_attribute_filters["parking_motor"] = True


        budget_filters = self._get_budget_filters_for_files()

        filter_query = {
            # Assuming TargetFileModel (Sell/Rent) has a Status enum
            # and we are looking for ACTIVE files.
            # Make sure Sell/Rent models have a Status enum compatible with this.
            # from file.models import Property (if Sell/Rent inherit from it and it has Status)
            # "status": Property.PropertyStatusChoices.ACTIVE,
            "status": "ACTIVE", # Or access the specific Status enum from TargetFileModel if needed
            "property_type": self.property_type,
            **budget_filters,
            **file_attribute_filters,
        }

        final_filter_query = self._remove_none_values(filter_query)
        all_files = TargetFileModel.objects.filter(**final_filter_query)

        unnotified_files = []
        # The 'notified_customers' field is on the TargetFileModel (Sell or Rent)
        # and it's a M2M to the correct Customer type (BuyCustomer or RentCustomer).
        for file_instance in all_files:
            # Check if this customer (self) is in the file's notified_customers list.
            if not file_instance.notified_customers.filter(pk=self.pk).exists():
                unnotified_files.append(file_instance)
            
        return unnotified_files


class BuyCustomer(BaseCustomerRequest):
    # Specific Status enum if labels need to be different

    customer = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        verbose_name="مشتری خریدار",
        related_name="buy_requests" # Specific related_name
    )
    budget = models.IntegerField(verbose_name="بودجه خرید")
    status = models.CharField( # Override status to use specific choices
        max_length=12, choices=BaseCustomerRequest.Status.choices, default=BaseCustomerRequest.Status.ACTIVE, verbose_name="وضعیت درخواست خرید"
    )
    
    # The `notified_files` M2M on SellCustomer was commented out, implying notification is tracked
    # on the Sell/Rent side via `file.notified_customers`. So, no M2M here.

    class Meta(BaseCustomerRequest.Meta): # Inherit ordering
        verbose_name = "مشتری خریدار"
        verbose_name_plural = "مشتریان خریدار"

    def get_absolute_url(self):
        return reverse("customer:buy_customer_detail", args=[self.id])

    def _get_target_file_model(self):
        from file.models import Sell # Local import
        return Sell

    def _get_budget_filters_for_files(self) -> dict:
        budget_range = (int(self.budget * 0.75), int(self.budget * 1.25))
        return {
            "price__gte": budget_range[0],
            "price__lte": budget_range[1],
        }
    
    # __str__ is inherited


class RentCustomer(BaseCustomerRequest):
    # Specific Status enum if labels need to be different

    customer = models.ForeignKey(
        Person,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        verbose_name="مشتری مستاجر",
        related_name="rent_requests" # Specific related_name
    )
    up_budget = models.IntegerField(verbose_name="حداکثر رهن (پیش پرداخت)")
    rent_budget = models.FloatField(verbose_name="حداکثر اجاره ماهیانه")
    status = models.CharField( # Override status to use specific choices
        max_length=12, choices=BaseCustomerRequest.Status.choices, default=BaseCustomerRequest.Status.ACTIVE, verbose_name="وضعیت درخواست اجاره"
    )

    class Meta(BaseCustomerRequest.Meta): # Inherit ordering
        verbose_name = "مشتری مستاجر"
        verbose_name_plural = "مشتریان مستاجر"

    def get_absolute_url(self):
        return reverse("customer:rent_customer_detail", args=[self.id])

    def _get_target_file_model(self):
        from file.models import Rent # Local import
        return Rent

    def _get_budget_filters_for_files(self) -> dict:
        # For rent, customer specifies maximums, so file should be <= customer's budget
        # The original code used a range, which might be more flexible.
        # I'll stick to the range logic from the original for consistency.
        budget_up_range = (int(self.up_budget * 0.75), int(self.up_budget * 1.25)) # Or (0, self.up_budget) if it's a max
        budget_rent_range = (int(self.rent_budget * 0.75), int(self.rent_budget * 1.25)) # Or (0, self.rent_budget)

        return {
            "price_up__gte": budget_up_range[0],
            "price_up__lte": budget_up_range[1],
            "price_rent__gte": budget_rent_range[0],
            "price_rent__lte": budget_rent_range[1],
        }

    # __str__ is inherited
