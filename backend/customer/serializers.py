from rest_framework import serializers
from .models import BuyCustomer, RentCustomer
from utils.common import set_added_by, set_updated_logic
import jdatetime


@set_added_by
@set_updated_logic
class BuyCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = BuyCustomer
        fields = "__all__"

    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_customer_type(self, obj):
        return "buy"

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")


@set_added_by
@set_updated_logic
class RentCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = RentCustomer
        fields = "__all__"

    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_customer_type(self, obj):
        return "rent"

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")
