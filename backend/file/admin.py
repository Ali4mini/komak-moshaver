from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Sell, Rent,
    SellImage, RentImage,
    SellStaticLocation, RentStaticLocation
)
# Assuming Person model is in 'utils.models' and correctly registered in admin if needed
# from utils.admin import PersonAdmin # Or similar, if you want to link to it

# --- Inlines for Images ---
class SellImageInline(admin.TabularInline):
    model = SellImage
    extra = 1 # Number of empty forms to display
    readonly_fields = ('image_preview',)
    fields = ('image', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<a href="{}"><img src="{}" width="150" height="auto" /></a>', obj.image.url, obj.image.url)
        return "-"
    image_preview.short_description = "پیش‌نمایش تصویر"

class RentImageInline(admin.TabularInline):
    model = RentImage
    extra = 1
    readonly_fields = ('image_preview',)
    fields = ('image', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<a href="{}"><img src="{}" width="150" height="auto" /></a>', obj.image.url, obj.image.url)
        return "-"
    image_preview.short_description = "پیش‌نمایش تصویر"


# --- Inlines for Static Locations ---
class SellStaticLocationInline(admin.StackedInline): # StackedInline might be better for JSON and image
    model = SellStaticLocation
    can_delete = False # Usually a property has one location
    verbose_name_plural = 'موقعیت ثابت نقشه (فروش)'
    fields = ('location', 'image', 'image_preview')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<a href="{}"><img src="{}" width="200" height="auto" /></a>', obj.image.url, obj.image.url)
        return "-"
    image_preview.short_description = "پیش‌نمایش نقشه"


class RentStaticLocationInline(admin.StackedInline):
    model = RentStaticLocation
    can_delete = False
    verbose_name_plural = 'موقعیت ثابت نقشه (اجاره)'
    fields = ('location', 'image', 'image_preview')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<a href="{}"><img src="{}" width="200" height="auto" /></a>', obj.image.url, obj.image.url)
        return "-"
    image_preview.short_description = "پیش‌نمایش نقشه"


# --- Base Admin for Property Models (Sell and Rent) ---
class PropertyBaseAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'address_summary',
        'property_type',
        'status_display', # Custom method for Sell/Rent specific status
        'm2',
        'owner_link',
        'added_by_link',
        'created_short',
    )
    list_filter = ('property_type', 'status', 'created', 'year', 'parking', 'elevator', 'storage')
    search_fields = (
        'id__iexact', # Search by exact ID
        'address',
        'owner__first_name', 'owner__last_name', 'owner__phone_number', # Assuming Person model structure
        'tenant__first_name', 'tenant__last_name',
        'source_id'
    )
    readonly_fields = ('created', 'updated')
    raw_id_fields = ('owner', 'added_by', 'tenant', 'lobbyMan') # Good for performance
    list_per_page = 20
    
    # Common fieldsets, specific pricing/customer fields will be added by subclasses
    base_fieldsets = (
        ("اطلاعات اصلی ملک", {
            'fields': ('address', 'property_type', 'status', 'm2', 'year', 'floor', 'bedroom', 'tabaghat', 'vahedha')
        }),
        ("مالک و ساکنین", {
            'fields': ('owner', 'tenant', 'lobbyMan')
        }),
        ("امکانات", {
            'fields': ('elevator', 'storage', 'parking', 'parking_motor', 'komod_divari')
        }),
        ("سایر اطلاعات", {
            'fields': ('takhlie', 'bazdid', 'description', 'source_id', 'date')
        }),
        ("اطلاعات سیستمی", {
            'fields': ('added_by', 'created', 'updated'),
            'classes': ('collapse',)
        }),
    )

    def address_summary(self, obj):
        return (obj.address[:50] + '...') if len(obj.address) > 50 else obj.address
    address_summary.short_description = "آدرس"

    def status_display(self, obj):
        # This will use the get_status_display() from the concrete Sell or Rent model
        return obj.get_status_display()
    status_display.short_description = "وضعیت"
    status_display.admin_order_field = 'status'


    def owner_link(self, obj):
        if obj.owner:
            # Adjust 'utils' and 'person' if your Person model is elsewhere
            link = reverse("admin:utils_person_change", args=[obj.owner.id])
            return format_html('<a href="{}">{}</a>', link, obj.owner)
        return "-"
    owner_link.short_description = "مالک"
    owner_link.admin_order_field = 'owner'


    def added_by_link(self, obj):
        if obj.added_by:
            link = reverse("admin:auth_user_change", args=[obj.added_by.id])
            return format_html('<a href="{}">{}</a>', link, obj.added_by.get_username())
        return "-"
    added_by_link.short_description = "ثبت توسط"
    added_by_link.admin_order_field = 'added_by'

    def created_short(self, obj):
        return obj.created.strftime('%Y-%m-%d %H:%M')
    created_short.short_description = "زمان ایجاد"
    created_short.admin_order_field = 'created'


# --- Concrete Admin for Sell ---
@admin.register(Sell)
class SellAdmin(PropertyBaseAdmin):
    list_display = ('id', 'price_display') + PropertyBaseAdmin.list_display[1:] # Prepend price
    inlines = [SellImageInline, SellStaticLocationInline]
    filter_horizontal = ('notified_customers',) # Better UI for ManyToMany

    # Specific fieldsets for Sell
    fieldsets = (
        ("اطلاعات فروش", {
            'fields': ('price', 'notified_customers')
        }),
    ) + PropertyBaseAdmin.base_fieldsets # Append base fieldsets

    def price_display(self, obj):
        return f"{obj.price:,}" # Formats price with commas
    price_display.short_description = "قیمت (تومان)"
    price_display.admin_order_field = 'price'

    # If you need to override status_display because Sell.Status has different labels
    # def status_display(self, obj):
    #     return obj.get_status_display() # Django handles this automatically for choices fields
    # status_display.short_description = "وضعیت فروش"


# --- Concrete Admin for Rent ---
@admin.register(Rent)
class RentAdmin(PropertyBaseAdmin):
    list_display = ('id', 'price_up_display', 'price_rent_display') + PropertyBaseAdmin.list_display[1:] # Prepend prices
    inlines = [RentImageInline, RentStaticLocationInline]
    filter_horizontal = ('notified_customers',)

    # Specific fieldsets for Rent
    fieldsets = (
        ("اطلاعات اجاره", {
            'fields': ('price_up', 'price_rent', 'tabdil', 'notified_customers')
        }),
    ) + PropertyBaseAdmin.base_fieldsets # Append base fieldsets

    def price_up_display(self, obj):
        return f"{obj.price_up:,}"
    price_up_display.short_description = "رهن (تومان)"
    price_up_display.admin_order_field = 'price_up'

    def price_rent_display(self, obj):
        return f"{obj.price_rent:,.0f}" # Format float with commas, no decimals
    price_rent_display.short_description = "اجاره (تومان)"
    price_rent_display.admin_order_field = 'price_rent'

    # def status_display(self, obj):
    #     return obj.get_status_display()
    # status_display.short_description = "وضعیت اجاره"


# Note: PropertyImageBase and PropertyStaticLocationBase are abstract,
# so they don't need to be registered with the admin directly.
# Their concrete versions (SellImage, RentImage, etc.) are handled via Inlines.
