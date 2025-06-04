from django.db import models
from django.conf import settings
from file.models import Sell, Rent # Assuming these are your refactored Property models
from customer.models import BuyCustomer, RentCustomer # Assuming these are your refactored Customer models
from utils.models import Person

# --- Call Recording Model (largely unchanged, but reviewed) ---
class Call(models.Model):
    class CallType(models.TextChoices):
        INCOMING = "IN", "ورودی"
        OUTGOING = "OUT", "خروجی"
        MISSED = "MISS", "از دست رفته"

    class CallStatus(models.TextChoices):
        COMPLETED = "COMP", "موفق"
        FAILED = "FAIL", "ناموفق"
        NO_ANSWER = "NOANS", "بدون پاسخ"
        BUSY = "BUSY", "مشغول"

    person = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='call_logs', # Changed from call_recordings for clarity if this is more a log
        verbose_name="شخص مرتبط"
    )
    phone_number = models.CharField(max_length=20, db_index=True, verbose_name="شماره تلفن")
    call_id = models.CharField(max_length=100, unique=True, blank=True, null=True, verbose_name="شناسه تماس")

    call_type = models.CharField(
        max_length=4,
        choices=CallType.choices,
        default=CallType.INCOMING,
        verbose_name="نوع تماس"
    )
    call_status = models.CharField(
        max_length=5,
        choices=CallStatus.choices,
        default=CallStatus.COMPLETED,
        verbose_name="وضعیت تماس"
    )
    start_time = models.DateTimeField(verbose_name="زمان شروع")
    end_time = models.DateTimeField(verbose_name="زمان پایان")
    duration = models.PositiveIntegerField(null=True, blank=True, verbose_name="مدت زمان (ثانیه)")

    recording_file = models.FileField(
        upload_to='call_recordings/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name="فایل ضبط شده"
    )
    recording_url = models.URLField(
        'آدرس فایل ضبط شده', # Corrected verbose_name
        blank=True,
        null=True
    )
    recording_transcription = models.TextField(blank=True, verbose_name="متن پیاده‌سازی شده")
    is_transcript_correct = models.BooleanField(default=False, verbose_name="صحت متن پیاده‌سازی شده")

    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, # Changed 'auth.User' to settings.AUTH_USER_MODEL
        on_delete=models.SET_NULL,
        verbose_name='اپراتور پاسخگو',
        null=True,
        blank=True
    )
    location = models.JSONField(null=True, blank=True, verbose_name="موقعیت مکانی (اختیاری)")


    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ایجاد رکورد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="زمان بروزرسانی رکورد")

    class Meta:
        ordering = ['-start_time']
        verbose_name = "لاگ تماس تلفنی"
        verbose_name_plural = "لاگ‌های تماس تلفنی"
        indexes = [
            models.Index(fields=['phone_number', 'start_time']),
            models.Index(fields=['person', 'start_time']),
            models.Index(fields=['call_id']),
        ]

    def __str__(self):
        return f"تماس با {self.phone_number or self.person} در {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    def save(self, *args, **kwargs):
        if not self.phone_number and self.person and hasattr(self.person, 'phone_number'):
            self.phone_number = self.person.phone_number # Make sure Person model has phone_number

        if self.start_time and self.end_time and self.duration is None: # Check duration is None
            time_diff = self.end_time - self.start_time
            if time_diff.total_seconds() >= 0:
                self.duration = int(time_diff.total_seconds())
            else:
                self.duration = 0 # Or handle as error

        super().save(*args, **kwargs)

# --- Abstract Base Models for Activity Logs ---

class BaseActivityLog(models.Model):
    """
    Abstract base model for activities related to a property file and a customer.
    The 'file' and 'customer' fields must be defined in concrete subclasses
    as they point to different specific models (Sell/Rent, BuyCustomer/RentCustomer).
    """
    # file = models.ForeignKey(...) # To be defined in concrete class
    # customer = models.ForeignKey(...) # To be defined in concrete class

    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ثبت شده توسط",
        on_delete=models.DO_NOTHING, # Consider SET_NULL or PROTECT if user can be deleted
        blank=False, # Assuming added_by is mandatory
    )
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات") # Changed to TextField
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ایجاد") # Renamed from 'created'
    updated_at = models.DateTimeField(auto_now=True, verbose_name="زمان بروزرسانی") # Renamed from 'updated'

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        # This relies on concrete classes defining self.customer and self.file
        # And those objects having a decent __str__ representation.
        customer_str = str(self.customer) if hasattr(self, 'customer') and self.customer else "مشتری نامشخص"
        file_str = str(self.file.pk) if hasattr(self, 'file') and self.file else "فایل نامشخص"
        return f"فعالیت برای {customer_str} روی فایل {file_str}"


class BaseCallLog(BaseActivityLog):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی فایل"
        OTHER = "O", "سایر موارد" # Added an 'Other' option

    subject = models.CharField(max_length=2, choices=Subjects.choices, verbose_name="موضوع تماس")
    # Optional: Link to the actual Call recording if applicable
    # call_recording = models.ForeignKey(Call, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_activity_logs')


    class Meta:
        abstract = True
        verbose_name = "لاگ تماس با مشتری" # Will be overridden
        verbose_name_plural = "لاگ‌های تماس با مشتریان" # Will be overridden


class BaseTourLog(BaseActivityLog):
    class TourTypes(models.TextChoices): # Renamed from 'Type' to be more descriptive
        POST_VISIT = "P", "بازدید پس از معرفی (پس فایل)" # More descriptive label
        ACCOMPANIED = "H", "بازدید به همراه مشتری"
        INITIAL_INQUIRY = "I", "مراجعه اولیه مشتری" # Example of another type

    tour_type = models.CharField(max_length=2, choices=TourTypes.choices, verbose_name="نوع بازدید/مراجعه")

    class Meta:
        abstract = True
        verbose_name = "لاگ بازدید/مراجعه" # Will be overridden
        verbose_name_plural = "لاگ‌های بازدید/مراجعات" # Will be overridden


# --- Concrete Activity Log Models ---

class SellCall(BaseCallLog):
    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING, related_name="call_logs_sell", verbose_name="فایل فروش مرتبط")
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING, related_name="call_logs_buy", verbose_name="مشتری خریدار")

    class Meta(BaseCallLog.Meta): # Inherit ordering
        verbose_name = "لاگ تماس فروش"
        verbose_name_plural = "لاگ‌های تماس فروش"

    # __str__ is inherited from BaseActivityLog, but can be overridden if needed:
    # def __str__(self):
    #     return f"تماس با خریدار {self.customer} برای فایل فروش {self.file.pk}"


class RentCall(BaseCallLog):
    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING, related_name="call_logs_rent", verbose_name="فایل اجاره مرتبط")
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING, related_name="call_logs_rent_customer", verbose_name="مشتری مستاجر")

    class Meta(BaseCallLog.Meta):
        verbose_name = "لاگ تماس اجاره"
        verbose_name_plural = "لاگ‌های تماس اجاره"

    # def __str__(self):
    #     return f"تماس با مستاجر {self.customer} برای فایل اجاره {self.file.pk}"


class SellTour(BaseTourLog):
    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING, related_name="tour_logs_sell", verbose_name="فایل فروش مرتبط")
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING, related_name="tour_logs_buy", verbose_name="مشتری خریدار")

    class Meta(BaseTourLog.Meta):
        verbose_name = "بازدید/مراجعه فایل فروش"
        verbose_name_plural = "بازدیدها/مراجعات فایل‌های فروش"

    # def __str__(self):
    #     return f"بازدید خریدار {self.customer} از فایل فروش {self.file.pk}"


class RentTour(BaseTourLog):
    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING, related_name="tour_logs_rent", verbose_name="فایل اجاره مرتبط")
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING, related_name="tour_logs_rent_customer", verbose_name="مشتری مستاجر")

    class Meta(BaseTourLog.Meta):
        verbose_name = "بازدید/مراجعه فایل اجاره"
        verbose_name_plural = "بازدیدها/مراجعات فایل‌های اجاره"

    # def __str__(self):
    #     return f"بازدید مستاجر {self.customer} از فایل اجاره {self.file.pk}"


# --- SMS Log Model (largely unchanged) ---
class SMSLog(models.Model):
    task_id = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="شناسه تسک")
    status = models.BooleanField(verbose_name="وضعیت ارسال (موفقیت)")
    message = models.TextField(verbose_name="متن پیامک")
    phone_number = models.CharField(max_length=20, db_index=True, verbose_name="شماره تلفن گیرنده") # Max length reduced
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ارسال/ثبت")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "لاگ پیامک"
        verbose_name_plural = "لاگ‌های پیامک"

    def __str__(self):
        status_str = "موفق" if self.status else "ناموفق"
        return f"پیامک به {self.phone_number} (ID: {self.task_id}): {status_str}"

    def resend_sms(self):
        # Ensure this task is correctly defined and handles resending logic
        from file.tasks import resend_message # Assuming this is the correct path
        # Consider adding error handling or logging here
        print(f"Attempting to resend SMS task_id: {self.task_id} to {self.phone_number}")
        resend_message.delay(self.phone_number, self.message)
