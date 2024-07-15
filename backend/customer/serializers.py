from rest_framework import serializers
from file.models import Sell
from .models import BuyCustomer, RentCustomer
from agents_m.models import Profile
import jdatetime


class BuyCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()

    class Meta:
        model = BuyCustomer
        exclude = ("added_by",)  # Exclude the 'added_by' field

    def get_customer_type(self, obj):
        return "buy"

    def get_customer_date(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.date)
        return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        print(validated_data)
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)


class RentCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()

    class Meta:
        model = RentCustomer
        exclude = ("added_by",)  # Exclude the 'added_by' field

    def get_customer_type(self, obj):
        return "rent"

    def get_customer_date(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.date)
        return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        print(validated_data)
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)
