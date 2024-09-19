from rest_framework import serializers
from file.models import Sell
from .models import BuyCustomer, RentCustomer
from agents_m.models import Profile
from datetime import date, datetime
import jdatetime


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
        jalali_date = jdatetime.date.fromgregorian(date=obj.created)
        return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
        return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user

        today = datetime.now()
        updated_field = validated_data.get("updated", None)

        if updated_field is None:
            validated_data["updated"] = today
        # changing the status based on date
        date_field = validated_data.get("date", None)
        if date_field:
            today = date.today()
            passed_days = today - date_field
            if passed_days.days >= 30:
                validated_data["status"] = "UNACTIVE"
            else:
                validated_data["status"] = "ACTIVE"
        return super().create(validated_data)


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
        jalali_date = jdatetime.date.fromgregorian(date=obj.created)
        return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
        return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user

        today = datetime.now()
        updated_field = validated_data.get("updated", None)

        if updated_field is None:
            validated_data["updated"] = today

        # changing the status based on date
        date_field = validated_data.get("date", None)
        if date_field:
            today = date.today()
            passed_days = today - date_field
            if passed_days.days >= 30:
                validated_data["status"] = "UNACTIVE"
            else:
                validated_data["status"] = "ACTIVE"
        return super().create(validated_data)
