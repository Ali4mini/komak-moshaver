from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import BuyCustomer, RentCustomer
# Assuming Person model is in 'utils.models' and registered in admin
# from utils.admin import PersonAdmin

# --- Base Admin for Customer Request Models ---
class BaseCustomerRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_link', # Uses the 'customer' FK defined in concrete models
        'property_type',
        'status_display', # Uses the 'status' field defined in concrete models
        'm2',
        'year',
        'bedroom',
        'added_by_link',
        'created_short',
    )
    list_filter = ('property_type', 'status', 'created', 'year', 'parking', 'elevator', 'storage')
    search_fields = (
        'id__iexact',
        'customer__first_name', 'customer__last_name', 'customer__phone_number', # Assumes Person has these
        'description',
        'source_id',
        'added_by__username'
    )
    readonly_fields = ('created', 'updated')
    raw_id_fields = ('customer', 'added_by') # 'customer' is defined in concrete models
    list_per_page = 25

    # Common fieldsets, specific budget fields will be added by subclasses
    base_fieldsets = (
        ("اطلاعات مشتری و درخواست پایه", {
            'fields': ('customer', 'property_type', 'status', 'description') # customer will be from concrete
        }),
        ("مشخصات ملک مورد نظر", {
            'fields': ('m2', 'year', 'bedroom', 'vahedha', 'parking', 'elevator', 'storage', 'parking_motor')
        }),
        ("اطلاعات سیستمی و منبع", {
            'fields': ('added_by', 'date', 'source_id', 'created', 'updated'),
            'classes': ('collapse',)
        }),
    )
    
    # This method assumes 'customer' is the ForeignKey to Person in concrete models
    def customer_link(self, obj):
        if obj.customer:
            # Adjust 'utils' if your Person app_label is different
            link = reverse("admin:utils_person_change", args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', link, obj.customer)
        return "مشتری عمومی" # Or "-"
    customer_link.short_description = "مشتری"
    customer_link.admin_order_field = 'customer'


    def added_by_link(self, obj):
        if obj.added_by:
            link = reverse("admin:auth_user_change", args=[obj.added_by.id])
            return format_html('<a href="{}">{}</a>', link, obj.added_by.get_username())
        return "-"
    added_by_link.short_description = "ثبت توسط"
    added_by_link.admin_order_field = 'added_by'

    def created_short(self, obj):
        return obj.created.strftime('%Y-%m-%d %H:%M')
    created_short.short_description = "زمان ثبت"
    created_short.admin_order_field = 'created'

    def status_display(self, obj):
        # Uses get_status_display() from the concrete BuyCustomer or RentCustomer model
        # This is important if they override the Status enum or field for different labels
        return obj.get_status_display()
    status_display.short_description = "وضعیت درخواست"
    status_display.admin_order_field = 'status'


# --- Concrete Admin for BuyCustomer ---
@admin.register(BuyCustomer)
class BuyCustomerAdmin(BaseCustomerRequestAdmin):
    list_display = ('id', 'customer_link', 'budget_display') + BaseCustomerRequestAdmin.list_display[2:] # Insert budget

    # Define full fieldsets, prepending budget section
    fieldsets = (
        ("اطلاعات مشتری و بودجه خرید", {
            'fields': ('customer', 'budget', 'property_type', 'status', 'description')
        }),
    ) + BaseCustomerRequestAdmin.base_fieldsets[1:] # Append the rest of base fieldsets

    def budget_display(self, obj):
        return f"{obj.budget:,} تومان"
    budget_display.short_description = "بودجه خرید"
    budget_display.admin_order_field = 'budget'


# --- Concrete Admin for RentCustomer ---
@admin.register(RentCustomer)
class RentCustomerAdmin(BaseCustomerRequestAdmin):
    list_display = ('id', 'customer_link', 'up_budget_display', 'rent_budget_display') + BaseCustomerRequestAdmin.list_display[2:]

    # Define full fieldsets, prepending budget section
    fieldsets = (
        ("اطلاعات مشتری و بودجه اجاره", {
            'fields': ('customer', 'up_budget', 'rent_budget', 'property_type', 'status', 'description')
        }),
    ) + BaseCustomerRequestAdmin.base_fieldsets[1:] # Append the rest of base fieldsets

    def up_budget_display(self, obj):
        return f"{obj.up_budget:,} تومان"
    up_budget_display.short_description = "بودجه رهن"
    up_budget_display.admin_order_field = 'up_budget'

    def rent_budget_display(self, obj):
        return f"{obj.rent_budget:,.0f} تومان"
    rent_budget_display.short_description = "بودجه اجاره"
    rent_budget_display.admin_order_field = 'rent_budget'

# BaseCustomerRequest is abstract, so it doesn't need its own admin registration.
