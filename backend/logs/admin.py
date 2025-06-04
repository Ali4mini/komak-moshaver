from django.contrib import admin
from .models import Call, SellCall, RentCall, SellTour, RentTour, SMSLog

# ... (CallAdmin and SMSLogAdmin remain the same as before) ...
# --- Admin for Call (System Call Log) ---
@admin.register(Call)
class CallAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'phone_number',
        'person_link', # Custom method for link
        'call_type',
        'call_status',
        'start_time',
        'duration_display', # Custom method for display
        'agent_link', # Custom method for link
        'has_recording', # Custom method
    )
    list_filter = ('call_type', 'call_status', 'start_time', 'agent', 'is_transcript_correct')
    search_fields = ('phone_number', 'person__first_name', 'person__last_name', 'person__phone_number', 'call_id', 'recording_transcription', 'agent__username')
    readonly_fields = ('created_at', 'updated_at', 'duration')
    list_per_page = 25
    fieldsets = (
        ("اطلاعات تماس", {
            'fields': ('call_id', 'phone_number', 'person', 'call_type', 'call_status', 'start_time', 'end_time', 'duration')
        }),
        ("اپراتور و موقعیت", {
            'fields': ('agent', 'location')
        }),
        ("اطلاعات ضبط", {
            'fields': ('recording_file', 'recording_url', 'recording_transcription', 'is_transcript_correct')
        }),
        ("سیستمی", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',) # Collapsible section
        }),
    )

    def person_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.person:
            # Ensure 'utils' is the app_label for your Person model
            link = reverse("admin:utils_person_change", args=[obj.person.id])
            return format_html('<a href="{}">{}</a>', link, obj.person)
        return "-"
    person_link.short_description = "شخص مرتبط"
    person_link.admin_order_field = 'person'

    def agent_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.agent:
            link = reverse("admin:auth_user_change", args=[obj.agent.id]) # Standard User model
            return format_html('<a href="{}">{}</a>', link, obj.agent.get_username())
        return "-"
    agent_link.short_description = "اپراتور"
    agent_link.admin_order_field = 'agent'

    def duration_display(self, obj):
        if obj.duration is not None:
            minutes, seconds = divmod(obj.duration, 60)
            return f"{minutes:02d}:{seconds:02d}"
        return "-"
    duration_display.short_description = "مدت زمان"

    def has_recording(self, obj):
        return bool(obj.recording_file or obj.recording_url)
    has_recording.short_description = "دارای ضبط؟"
    has_recording.boolean = True


# --- Base Admin for Activity Logs (Sell/Rent Call/Tour) ---
class BaseActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_link', 'file_link', 'activity_type_display', 'subject_or_tour_type_display', 'added_by_link', 'created_at_short')
    list_filter = ('created_at', 'added_by')
    search_fields = (
        'customer__customer__first_name', 'customer__customer__last_name', 'customer__customer__phone_number',
        'file__id', 'file__address',
        'description',
        'added_by__username'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('file', 'customer', 'added_by')
    list_per_page = 25
    
    # Define base fieldsets that subclasses will extend
    # Subclasses will need to define their own complete fieldsets or carefully modify this.
    # For simplicity here, we'll let subclasses define their full fieldsets.
    # fieldsets = (
    #     (None, {
    #         'fields': ('customer', 'file')
    #     }),
    #     ("جزئیات فعالیت پایه", { # Placeholder, will be replaced
    #         'fields': ('description',)
    #     }),
    #     ("اطلاعات سیستمی", {
    #         'fields': ('added_by', 'created_at', 'updated_at'),
    #         'classes': ('collapse',)
    #     }),
    # )

    def customer_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.customer:
            app_label = obj.customer._meta.app_label
            model_name = obj.customer._meta.model_name
            link = reverse(f"admin:{app_label}_{model_name}_change", args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', link, obj.customer)
        return "-"
    customer_link.short_description = "مشتری"
    customer_link.admin_order_field = 'customer'

    def file_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.file:
            app_label = obj.file._meta.app_label
            model_name = obj.file._meta.model_name
            link = reverse(f"admin:{app_label}_{model_name}_change", args=[obj.file.id])
            # Assuming your Sell/Rent models (or their base) have get_property_type_display
            property_type_display = ""
            if hasattr(obj.file, 'get_property_type_display'):
                 property_type_display = obj.file.get_property_type_display()
            return format_html('<a href="{}">{} (کد: {})</a>', link, property_type_display, obj.file.id)
        return "-"
    file_link.short_description = "فایل مرتبط"
    file_link.admin_order_field = 'file'

    def added_by_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.added_by:
            link = reverse("admin:auth_user_change", args=[obj.added_by.id])
            return format_html('<a href="{}">{}</a>', link, obj.added_by.get_username())
        return "-"
    added_by_link.short_description = "ثبت توسط"
    added_by_link.admin_order_field = 'added_by'

    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_short.short_description = "زمان ایجاد"
    created_at_short.admin_order_field = 'created_at'

    def activity_type_display(self, obj):
        return obj._meta.verbose_name
    activity_type_display.short_description = "نوع فعالیت"

    def subject_or_tour_type_display(self, obj):
        return "-"
    subject_or_tour_type_display.short_description = "موضوع/نوع"


@admin.register(SellCall)
class SellCallAdmin(BaseActivityLogAdmin):
    list_filter = BaseActivityLogAdmin.list_filter + ('subject',)
    
    fieldsets = (
        (None, {
            'fields': ('customer', 'file')
        }),
        ("جزئیات تماس فروش", {
            'fields': ('subject', 'description') # Add 'subject' here
        }),
        ("اطلاعات سیستمی", {
            'fields': ('added_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def subject_or_tour_type_display(self, obj):
        return obj.get_subject_display()
    subject_or_tour_type_display.short_description = "موضوع تماس"
    subject_or_tour_type_display.admin_order_field = 'subject'


@admin.register(RentCall)
class RentCallAdmin(BaseActivityLogAdmin):
    list_filter = BaseActivityLogAdmin.list_filter + ('subject',)

    fieldsets = (
        (None, {
            'fields': ('customer', 'file')
        }),
        ("جزئیات تماس اجاره", {
            'fields': ('subject', 'description') # Add 'subject' here
        }),
        ("اطلاعات سیستمی", {
            'fields': ('added_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def subject_or_tour_type_display(self, obj):
        return obj.get_subject_display()
    subject_or_tour_type_display.short_description = "موضوع تماس"
    subject_or_tour_type_display.admin_order_field = 'subject'


@admin.register(SellTour)
class SellTourAdmin(BaseActivityLogAdmin):
    list_filter = BaseActivityLogAdmin.list_filter + ('tour_type',)

    fieldsets = (
        (None, {
            'fields': ('customer', 'file')
        }),
        ("جزئیات بازدید فروش", {
            'fields': ('tour_type', 'description') # Add 'tour_type' here
        }),
        ("اطلاعات سیستمی", {
            'fields': ('added_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def subject_or_tour_type_display(self, obj):
        return obj.get_tour_type_display()
    subject_or_tour_type_display.short_description = "نوع بازدید"
    subject_or_tour_type_display.admin_order_field = 'tour_type'


@admin.register(RentTour)
class RentTourAdmin(BaseActivityLogAdmin):
    list_filter = BaseActivityLogAdmin.list_filter + ('tour_type',)

    fieldsets = (
        (None, {
            'fields': ('customer', 'file')
        }),
        ("جزئیات بازدید اجاره", {
            'fields': ('tour_type', 'description') # Add 'tour_type' here
        }),
        ("اطلاعات سیستمی", {
            'fields': ('added_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def subject_or_tour_type_display(self, obj):
        return obj.get_tour_type_display()
    subject_or_tour_type_display.short_description = "نوع بازدید"
    subject_or_tour_type_display.admin_order_field = 'tour_type'


# --- Admin for SMSLog ---
@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'phone_number', 'message_summary', 'status', 'created_at', 'task_id')
    list_filter = ('status', 'created_at')
    search_fields = ('phone_number', 'message', 'task_id')
    readonly_fields = ('created_at', 'task_id')
    actions = ['resend_selected_sms']
    list_per_page = 25

    fieldsets = (
        (None, {
            'fields': ('phone_number', 'message', 'status')
        }),
        ("اطلاعات سیستمی", {
            'fields': ('task_id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def message_summary(self, obj):
        return (obj.message[:75] + '...') if len(obj.message) > 75 else obj.message
    message_summary.short_description = "خلاصه پیام"

    def resend_selected_sms(self, request, queryset):
        count = 0
        for sms_log in queryset:
            try:
                sms_log.resend_sms()
                count += 1
            except Exception as e:
                self.message_user(request, f"خطا در ارسال مجدد پیامک برای {sms_log.phone_number}: {e}", level='error')
        if count > 0:
            self.message_user(request, f"{count} پیامک با موفقیت برای ارسال مجدد در صف قرار گرفتند.")
    resend_selected_sms.short_description = "ارسال مجدد پیامک‌های انتخاب شده"
